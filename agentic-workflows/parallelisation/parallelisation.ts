import { z } from 'zod'
import { generateObject, type LanguageModel } from 'ai'

import { criteria, type Criteria } from './criteria'

const schema = z.object({
  violates_criteria: z
    .boolean()
    .describe('Whether the product violates the criteria'),
  reason: z
    .string()
    .describe(
      'The reason why the product violates the criteria or why it does not'
    ),
})

export interface CheckProductAgainstCriteriaResult {
  result: z.infer<typeof schema>
  criteria: Criteria
  productDescription: string
  modelId: string
  timestamp: string
}

export const checkProductAgainstCriteria = async (
  criteria: Criteria,
  productDescription: string,
  model: LanguageModel
): Promise<CheckProductAgainstCriteriaResult> => {
  const { object, response } = await generateObject({
    model,
    schema,
    messages: [
      {
        role: 'system',
        content:
          'You are checking to see if a product is compliant with the criteria of a merchant. ' +
          'You will be given a product and a specific criteria. ' +
          'You will need to check the product against the criteria and return a boolean value. ' +
          'You will also need to provide a reason for your answer. ' +
          'The criteria is: ' +
          criteria.label +
          'The examples of products in violation of this criteria are: ' +
          criteria.examples,
      },
      {
        role: 'user',
        content: JSON.stringify({
          productDescription,
        }),
      },
    ],
    maxRetries: 0, // skip default network retries, since this is local
  })

  return {
    modelId: response.modelId,
    timestamp: response.timestamp.toISOString(),
    result: object,
    criteria,
    productDescription,
  }
}

export const checkProductAgainstAllCriteria = async (
  productDescription: string,
  model: LanguageModel
) => {
  const allCriteria = Object.values(criteria)
  const results = await Promise.all(
    allCriteria.map((criteria) =>
      checkProductAgainstCriteria(criteria, productDescription, model)
    )
  )
  return results
}
