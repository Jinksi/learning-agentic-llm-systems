import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText } from 'ai'
import { createOllama } from 'ollama-ai-provider'

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
})

// const lmstudio = createOpenAICompatible({
//   name: 'lmstudio',
//   baseURL: 'http://localhost:1234/v1',
// })

const model = ollama('llama3.2')

export const askLocalLLMQuestion = async (input: string) => {
  const { text } = await generateText({
    model,
    prompt: input,
    maxRetries: 0, // skip default network retries, since this is local
    temperature: 0.9,
  })

  return text
}

const response = await askLocalLLMQuestion(
  `In one sentence, explain the figure of speech "flamin galah".`
)

console.log(response)
