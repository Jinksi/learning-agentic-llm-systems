import { createOllama } from 'ollama-ai-provider'
import { generateObject } from 'ai'
import { z } from 'zod'

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
})

const model = ollama('llama3.2', {
  structuredOutputs: true,
})
// const model = anthropic('claude-3-5-haiku-latest')

const schema = z.object({
  name: z.string().describe(`The name of the user`),
  age: z.number().describe(`The user's age`),
  email: z.string().email().describe(`The user's email address`),
  occupation: z.string().describe(`The user's occupation`),
})

export const createFakeUsers = async (prompt: string) => {
  const result = await generateObject({
    model,
    prompt,
    output: 'array', // array output
    schema,
    system: `You are generating fake user data.`,
    temperature: 0.9,
  })

  return result.object
}

const fakeUsers = await createFakeUsers(`3 antarctic explorers`)

console.log(fakeUsers)
