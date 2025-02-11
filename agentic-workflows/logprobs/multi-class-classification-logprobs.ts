import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

const model = openai('gpt-4o', { logprobs: 3, structuredOutputs: true })

async function checkFruitVegHerb(input: string) {
  const result = await generateObject({
    temperature: 0, // Greedy sampling, only the top token is sampled
    model,
    schema: z.object({
      type: z
        .enum(['fruit', 'vegetable', 'herb'])
        .describe('The classification of the item, based on culinary usage.'),
      reason: z
        .string()
        .describe('The reason for the classification, in 10 words or less'),
    }),
    system: `You are a chef. You are given an item and you need to classify it as a fruit, vegetable, or herb.`,
    prompt: input,
  })

  const { type, reason } = result.object

  // The logprob for the value will be after the first occurrence of 'type' and ':' tokens.
  const typeColonLogprobIndex = result.logprobs?.findIndex((item) =>
    item.token.includes(':')
  )
  const typeValueLogprob = typeColonLogprobIndex
    ? result.logprobs?.[typeColonLogprobIndex + 1]
    : undefined

  // Calculate the confidence as the exponential of the logprob to get the probability.
  const confidence = typeValueLogprob ? Math.exp(typeValueLogprob?.logprob) : 0

  const alternativeAnswers = typeValueLogprob?.topLogprobs
    .slice(1) // Skip the first logprob, which is the correct answer
    .map(
      (item) => item.token + ` (${(Math.exp(item.logprob) * 100).toFixed(2)}%)`
    )
    .join(', ')

  console.log(`${input}`)
  console.log(`Type: ${type}`)
  console.log(`Reason: ${reason}`)
  console.log(`Confidence: ${(confidence * 100).toFixed(2)}%`)
  console.log(`Alternative answers: ${alternativeAnswers}`)
  console.log('--------------------------------')

  return { ...result.object, confidence }
}

await Promise.all([
  checkFruitVegHerb('Lemon'),
  checkFruitVegHerb('Tomato'),
  checkFruitVegHerb('Basil'),
  checkFruitVegHerb('Cucumber'),
])

/**
Example output:

Tomato
Type: vegetable
Reason: Used as a vegetable in culinary contexts.
Confidence: 90.46%
Alternative answers: fruit (9.53%), veg (0.00%)
--------------------------------
Basil
Type: herb
Reason: Used for flavoring in cooking.
Confidence: 100.00%
Alternative answers: veget (0.00%), he (0.00%)
--------------------------------
Lemon
Type: fruit
Reason: Culinary use as a citrus fruit.
Confidence: 100.00%
Alternative answers: veget (0.00%), fr (0.00%)
--------------------------------
Cucumber
Type: vegetable
Reason: Used in savory dishes and salads.
Confidence: 100.00%
Alternative answers: fruit (0.00%), her (0.00%)
--------------------------------
*/
