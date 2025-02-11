import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

const model = openai('gpt-4o-mini', { logprobs: true, structuredOutputs: true })

async function checkPineapple(input: string) {
  const result = await generateObject({
    model,
    temperature: 0, // Greedy sampling, only the top token is sampled
    schema: z.object({
      containsPineapple: z
        .boolean()
        .describe('Whether the food contains pineapple'),
      reason: z
        .string()
        .describe('The reason for the classification, in 10 words or less'),
    }),
    system: `You are a chef. You are given a food item and you need to determine if it contains pineapple.`,
    prompt: input,
  })

  const { containsPineapple, reason } = result.object

  // Find the logprob for the "true" or "false" containsPineapple value token.
  const trueOrFalseLogprob = result.logprobs?.find(
    (item) => item.token === String(containsPineapple)
  )

  // Calculate the confidence as the exponential of the logprob to get the probability.
  const confidence = trueOrFalseLogprob
    ? Math.exp(trueOrFalseLogprob.logprob)
    : 0

  console.log(`${input}`)
  console.log(`Contains pineapple: ${containsPineapple}`)
  console.log(`Reason: ${reason}`)
  console.log(`Confidence: ${(confidence * 100).toFixed(2)}%`)
  console.log(`--------------------------------`)

  return { containsPineapple, reason, confidence }
}

await Promise.all([
  checkPineapple('Hawaiian pizza'),
  checkPineapple('Margherita pizza'),
  checkPineapple('Supreme pizza'),
])

/**

Example output:

Margherita pizza
Contains pineapple: false
Reason: Traditional recipe does not include pineapple.
Confidence: 100.00%
--------------------------------
Hawaiian pizza
Contains pineapple: true
Reason: Hawaiian pizza traditionally includes pineapple as a topping.
Confidence: 100.00%
--------------------------------
Supreme pizza
Contains pineapple: false
Reason: Typically does not include pineapple as a topping.
Confidence: 56.22%
--------------------------------

*/
