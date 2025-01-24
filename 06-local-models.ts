import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText } from 'ai'

const lmstudio = createOpenAICompatible({
  name: 'lmstudio',
  baseURL: 'http://localhost:1234/v1',
})

// Empty string defaults to the model selected in lmstudio
const model = lmstudio('')

export const askLocalLLMQuestion = async (input: string) => {
  const { text } = await generateText({
    model,
    prompt: input,
    maxRetries: 0, // skip default network retries, since this is local
  })

  return text
}

const response = await askLocalLLMQuestion(
  `Briefly tell me a story about your origins and AI ancestors – 2 paragraphs or less.`
)

console.log(response)
