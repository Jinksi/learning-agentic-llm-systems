import { generateText, LanguageModel } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { createOllama } from 'ollama-ai-provider'

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
})

const lmstudio = createOpenAICompatible({
  name: 'lmstudio',
  baseURL: 'http://localhost:1234/v1',
})

const ask = async (prompt: string, model: LanguageModel) => {
  const { text, response } = await generateText({
    model,
    prompt,
    temperature: 0.9,
  })

  return { text, modelId: response.modelId }
}

const prompt = `Write me a haiku about how reinforcement learning with human feedback works`

const logResponse = ({ text, modelId }) => {
  console.log(`\n✨ ${modelId} response: \n\n${text}\n\n-----------\n`)
}

const claude = anthropic('claude-3-5-haiku-latest')
ask(prompt, claude).then(logResponse)

const gpt4o = openai('gpt-4o-mini')
ask(prompt, gpt4o).then(logResponse)

// const localModel = lmstudio('')
// ask(prompt, localModel).then(logResponse)

ask(prompt, ollama('llama3.1')).then(logResponse)
ask(prompt, ollama('llama3.2')).then(logResponse)
ask(prompt, ollama('mistral')).then(logResponse)
ask(prompt, ollama('qwen2.5:7b-instruct-q4_K_M')).then(logResponse)
