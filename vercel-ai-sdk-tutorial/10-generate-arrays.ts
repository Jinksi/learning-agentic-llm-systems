import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { anthropic } from '@ai-sdk/anthropic'
import { generateObject } from 'ai'
import { z } from 'zod'

const lmstudio = createOpenAICompatible({
  name: 'lmstudio',
  baseURL: 'http://localhost:1234/v1',
})

// Empty string defaults to the model selected in lmstudio
const model = lmstudio('qwen2.5-7b-instruct') // Providing a model name will auto-load the model
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
  })

  return result.object
}

const fakeUsers = await createFakeUsers(`3 antarctic explorers`)

console.log(fakeUsers)
