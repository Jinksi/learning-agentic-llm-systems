import { generateText, LanguageModel } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

const lmstudio = createOpenAICompatible({
  name: 'lmstudio',
  baseURL: 'http://localhost:1234/v1',
})

const ask = async (prompt: string, model: LanguageModel) => {
  const { text, response } = await generateText({
    model,
    prompt,
  })

  return { text, modelId: response.modelId }
}

const prompt = `Briefly tell me a story about your origins and AI ancestors – 2 paragraphs or less.`

const logResponse = ({ text, modelId }) => {
  console.log(`\n✨ ${modelId} response: \n\n${text}\n\n-----------\n`)
}

const claude = anthropic('claude-3-5-haiku-latest')
ask(prompt, claude).then(logResponse)

const gpt4o = openai('gpt-4o-mini')
ask(prompt, gpt4o).then(logResponse)

const localModel = lmstudio('')
ask(prompt, localModel).then(logResponse)
