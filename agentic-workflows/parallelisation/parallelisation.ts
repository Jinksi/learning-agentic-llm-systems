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
  confidence: number
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
  const { object, response, logprobs } = await generateObject({
    model,
    schema,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content:
          'You are checking to see if a product is compliant with the criteria of a merchant. ' +
          'You will be given a product and a specific criteria. ' +
          'You will need to check the product against the criteria and return a boolean value. ' +
          'You will also need to provide a reason for your answer. ' +
          '<criteria>' +
          criteria.label +
          '</criteria>' +
          'The examples of products in violation of this criteria are: ' +
          '<examples>' +
          criteria.examples +
          '</examples>',
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

  // Find the logprob for the "true" or "false" value token.
  const trueOrFalseLogprob = logprobs?.find(
    (item) => item.token === String(object.violates_criteria)
  )

  // Calculate the confidence as the exponential of the logprob to get the probability.
  const confidence = trueOrFalseLogprob
    ? Math.exp(trueOrFalseLogprob.logprob)
    : 0

  return {
    modelId: response.modelId,
    timestamp: response.timestamp.toISOString(),
    result: object,
    confidence,
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
