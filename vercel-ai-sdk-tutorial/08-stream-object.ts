import { createOllama } from 'ollama-ai-provider'
import { anthropic } from '@ai-sdk/anthropic'
import { streamObject } from 'ai'
import { z } from 'zod'

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
})

// Empty string defaults to the model selected in lmstudio
const model = ollama('llama3.2', {
  structuredOutputs: true,
})
// const model = anthropic('claude-3-5-sonnet-latest')

const schema = z.object({
  recipe: z.object({
    name: z.string().describe('The title of the recipe'),
    ingredients: z
      .array(
        z.object({
          name: z.string().describe('The name of the ingredient'),
          amount: z
            .string()
            .describe(
              'The amount of the ingredient to be used for this recipe'
            ),
        })
      )
      .describe('The ingredients used to make the recipe'),
    steps: z
      .array(z.string())
      .describe('The steps a user should take to create this recipe'),
  }),
})

export const createRecipe = async (prompt: string) => {
  // Using streamObject instead of generateObject
  const result = streamObject({
    model,
    prompt,
    schema, // pass in schema
    schemaName: 'Recipe', // Additional LLM guidance for what the schema represents
    // schemaDescription: '' // Optional, further assistance for the LLM's context, but overkill in this case
    maxRetries: 0, // skip default network retries, since this is local
    // Give the LLM some extra context about what the goal is
    system:
      `You are helping a user create a recipe. ` +
      `Use British English variants of ingredient names, like Coriander instead of Cilantro. ` +
      `Use metric measurements and temperatures, e.g. Celsius.`,
  })

  // result.partialObjectStream is an async iterable, each step will be a partially complete object
  for await (const obj of result.partialObjectStream) {
    // Clear the console and log the partially complete object
    console.clear()
    console.dir(obj, {
      depth: null,
    })
  }

  // This will include all chunks of the object stream
  const finalObject = await result.object

  return finalObject.recipe
}

await createRecipe(`banana smoothie`)
