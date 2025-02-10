import { anthropic } from '@ai-sdk/anthropic'
import { generateText, tool } from 'ai'
import { optional, z } from 'zod'
import cows from 'cows'
import { createOllama } from 'ollama-ai-provider'

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
})

const model = ollama('qwen2.5:7b-instruct-q4_K_M')
// const model = anthropic('claude-3-5-haiku-latest')

const getAsciiArtTool = tool({
  description: 'Get a string of ASCII art to present to the user',
  parameters: z.object({
    index: z
      .number()
      .lte(400)
      .optional()
      .describe(
        'An optional index number of the artwork to retrieve, from 0 to 400. Example: 29.'
      ),
  }),
  execute: async ({ index }) => {
    // Return a cow ascii art string
    return cows()[index ?? Math.floor(Math.random() * 401)]
  },
})

const generateAsciiArt = async (prompt: string = '') => {
  const { text, steps } = await generateText({
    model,
    prompt,
    system:
      `Your only role in life is to fetch ASCII artwork for a user. ` +
      `Use the tool provided to get a string of ASCII art and return it in your message to the user. ` +
      `If an artwork index is not provided by the user, always return a random one.`,
    tools: {
      getAsciiArtTool,
    },
    maxSteps: 10, // Since the LLM will have to take multiple steps, we allow this here
  })

  console.log(steps)
  // Debug tool steps
  console.log(steps[0]?.toolCalls)
  // Debug tool results
  console.log(steps[0]?.toolResults)

  return text
}

console.log(await generateAsciiArt('Give me some artwork'))
console.log(await generateAsciiArt('Show me artwork number twenty-one'))
