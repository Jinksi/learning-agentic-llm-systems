import { generateText, type CoreMessage } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { once } from 'node:events'

const model = anthropic('claude-3-5-haiku-latest')

export const startServer = async () => {
  const app = new Hono()

  // Stateless server, client tracks messages.
  // An alternative would be to let the server store the message history.
  app.post('/api/get-completions', async (ctx) => {
    // Message history received in the request body
    const messages: CoreMessage[] = await ctx.req.json()

    const result = await generateText({
      model,
      messages,
    })

    // Response with the new messages.
    return ctx.json(result.response.messages)
  })

  const server = serve({
    fetch: app.fetch,
    port: 4317,
    hostname: '0.0.0.0',
  })

  // Wait for server to be listening
  await once(server, 'listening')

  return server
}

await startServer()

// Messages represent the entire conversation, including calls to tools
const messagesToSend: CoreMessage[] = [
  // System prompt with instructions
  {
    role: 'system',
    content: 'You are a friendly greeter.',
  },
  // The user sends a message
  {
    role: 'user',
    content: 'Hello, you!',
  },
]

const response = await fetch('http://localhost:4317/api/get-completions', {
  method: 'POST',
  body: JSON.stringify(messagesToSend),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Only the new messages are returned from server
const newMessages = (await response.json()) as CoreMessage[]

const allMessages: CoreMessage[] = [...messagesToSend, ...newMessages]

const secondMessages: CoreMessage[] = [
  ...allMessages,
  {
    role: 'user',
    content: "What's your name anyway?",
  },
]

console.dir(allMessages, { depth: null })

/**
// Example response
[
  { role: 'system', content: 'You are a friendly greeter.' },
  { role: 'user', content: 'Hello, you!' },
  [
    {
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: "Hi there! How are you doing today? I'm happy to chat, help with tasks, or answer any questions you might have."
        }
      ],
      id: 'msg-xOe8fXDNg0XvVS44W7dXpgBT'
    }
  ]
]
*/
