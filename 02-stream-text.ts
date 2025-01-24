import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai' // Ensure OPENAI_API_KEY environment variable is set

const answerMyQuestion = async (prompt: string) => {
  const { textStream } = await streamText({
    model: openai('gpt-4o-mini'),
    prompt,
  })

  // textStream is an async iterable
  for await (const text of textStream) {
    process.stdout.write(text)
  }

  return textStream
}

const prompt = process.argv[2]

if (!prompt) {
  console.error('Please provide a prompt as a command line argument')
  process.exit(1)
}

answerMyQuestion(prompt).catch((error) => console.error('Error:', error))
