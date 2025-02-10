import { createOllama } from 'ollama-ai-provider'
import { anthropic } from '@ai-sdk/anthropic'
import { generateObject } from 'ai'

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
})

// Empty string defaults to the model selected in lmstudio
const model = ollama('llama3.2', {
  structuredOutputs: true,
})
// const model = anthropic('claude-3-5-haiku-latest')

export const classifySentiment = async (text: string) => {
  const { object } = await generateObject({
    model,
    output: 'enum',
    enum: ['positive', 'neutral', 'negative'], // List our enums here.
    prompt: text,
    system:
      `Classify the sentiment of the text as either ` +
      `positive, negative, or neutral.`,
  })

  return object // This is not an object, but one of the values from the enum
}

console.log(await classifySentiment(`I'm not sure how I feel`)) // returns `neutral`
console.log(await classifySentiment(`I'm pretty excited about this`)) // returns `positive`
console.log(await classifySentiment(`I'm not excited at all`)) // returns `negative`
