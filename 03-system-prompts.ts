import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai' // Ensure OPENAI_API_KEY environment variable is set

const summariseText = async (input: string) => {
  const { textStream } = await streamText({
    model: openai('gpt-4o-mini'),
    // Prepend a system prompt to the messages list
    // Tell the AI to act in a certain way, give it a role and instructions
    messages: [
      {
        role: 'system',
        content:
          `You are a text summarizer. ` +
          `Summarize the text you receive. ` +
          `Be concise. ` +
          `Return only the summary. ` +
          `Do not use the phrase "here is a summary". ` +
          `Highlight relevant phrases in bold. ` +
          `The summary should be two sentences long. `,
      },
      {
        role: 'user',
        content: input,
      },
    ],
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

summariseText(prompt).catch((error) => console.error('Error:', error))
