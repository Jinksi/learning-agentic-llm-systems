import { anthropic } from '@ai-sdk/anthropic'
import { createOllama } from 'ollama-ai-provider'
import { generateObject } from 'ai'
import { z } from 'zod'

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
})

// Empty string defaults to the model selected in lmstudio
const model = ollama('llama3.2', {
  structuredOutputs: true,
})
// const model = anthropic('claude-3-5-sonnet-latest')

// Define the schema, ensuring each property is described
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
  // Using generateObject instead of generateText
  const { object } = await generateObject({
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

  return object.recipe
}

const response = await createRecipe(`banana smoothie`)

console.log(response)

/*
📡 Example response from Claude 3.5 Sonnet

{
  name: 'ANZAC Biscuits',
  ingredients: [
    { name: 'rolled oats', amount: '85g' },
    { name: 'plain flour', amount: '85g' },
    { name: 'desiccated coconut', amount: '85g' },
    { name: 'brown sugar', amount: '100g' },
    { name: 'butter', amount: '100g' },
    { name: 'golden syrup', amount: '2 tablespoons' },
    { name: 'bicarbonate of soda', amount: '1 teaspoon' },
    { name: 'boiling water', amount: '2 tablespoons' }
  ],
  steps: [
    'Preheat oven to 180°C and line two baking trays with baking paper',
    'Mix the rolled oats, flour, coconut and brown sugar in a large bowl',
    'Melt the butter and golden syrup together in a small saucepan over low heat',
    'Mix the bicarbonate of soda with the boiling water in a small bowl',
    'Add the bicarb mixture to the melted butter mixture - it will foam up',
    'Pour the butter mixture into the dry ingredients and mix well',
    'Roll tablespoons of mixture into balls and place on prepared trays, allowing room for spreading',
    'Flatten each ball slightly with a fork',
    'Bake for 12-15 minutes or until golden brown',
    'Allow to cool on the trays for 5 minutes (they will be soft)',
    'Transfer to a wire rack to cool completely',
    'Store in an airtight container'
  ]
}


👾 Example response from local qwen2.5-7b-instruct

{
  name: 'ANZAC Biscuits',
  ingredients: [
    { name: 'rolled oats', amount: '200g' },
    { name: 'desiccated coconut', amount: '150g' },
    { name: 'brown sugar', amount: '80g' },
    { name: 'butter', amount: '60g, softened' },
    { name: 'cornflour', amount: '30g' },
    { name: 'bicarbonate of soda', amount: '1 tsp' }
  ],
  steps: [
    'Preheat the oven to 180°C.',
    'In a bowl, mix together the oats, coconut and cornflour.',
    'Add the brown sugar and butter to the dry ingredients. Mix until well combined.',
    'Stir in the bicarbonate of soda.',
    'Roll the mixture into balls about 2 cm in diameter.',
    'Place the biscuits on a lined baking tray and flatten slightly with your fingers.',
    'Bake for 15-20 minutes or until golden brown.',
    'Allow to cool on the tray for 5 minutes before transferring to a wire rack to cool completely.'
  ]
}

*/
