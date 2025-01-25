import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai' // Ensure OPENAI_API_KEY environment variable is set

const answerMyQuestion = async (prompt: string) => {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt,
  })

  return text
}

const prompt = process.argv[2]

if (!prompt) {
  console.error('Please provide a prompt as a command line argument')
  process.exit(1)
}

answerMyQuestion(prompt)
  .then((response) => console.log(response))
  .catch((error) => console.error('Error:', error))
