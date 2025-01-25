import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { generateText, tool } from 'ai'
import { z } from 'zod'

const lmstudio = createOpenAICompatible({
  name: 'lmstudio',
  baseURL: 'http://localhost:1234/v1',
})

const model = lmstudio('')
// const model = anthropic('claude-3-5-haiku-latest')
// const model = openai('gpt-4o-mini')

const maxPosts = 5

const getTopHackerNewsPostTool = tool({
  description: 'Get the current top hacker news posts',
  parameters: z.object({
    numberOfPosts: z
      .number()
      .optional()
      .describe(
        `The optional number of posts to retrieve. Defaults to 1. Maximum ${maxPosts}.`
      ),
  }),
  execute: async ({ numberOfPosts = 1 }) => {
    const numToFetch = Math.min(numberOfPosts, maxPosts)
    console.log(`Fetching ${numToFetch} best stories`)
    const bestStories: string[] = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json'
    ).then((res) => res.json())

    interface Story {
      by: string
      id: number
      time: number
      title: string
      type: string
      url: string
      commentsUrl?: string
    }

    let stories: Story[] = []

    for (const storyId of bestStories.slice(0, numToFetch)) {
      const storyPath = `https://hacker-news.firebaseio.com/v0/item/${storyId}.json`
      console.log('Fetching story: ' + storyPath)
      let story: Story = await fetch(storyPath).then((res) => res.json())

      story = {
        ...story,
        commentsUrl: `https://news.ycombinator.com/item?id=${story.id}`,
      }

      stories.push(story)
    }

    return stories
  },
})

const getTopHnPost = async (prompt: string = '') => {
  const { text, steps } = await generateText({
    model,
    prompt,
    system:
      `Your only role in life is to fetch the top Hacker News post for a user. ` +
      `Use the tool provided to get it and return any relevant details, the comments URL in particular. ` +
      `If the user asks for more than ${maxPosts} posts, return the top ${maxPosts} ONLY.`,
    tools: {
      getTopHackerNewsPostTool,
    },
    maxSteps: 10, // Since the LLM will have to take multiple steps, we allow this here
  })

  console.log(
    'steps taken',
    steps.map((step) => step.stepType)
  )

  // Debug tool steps
  // console.log(steps[0]?.toolCalls)
  // Debug tool results
  // console.log(steps[0]?.toolResults)
  return text
}

console.log(await getTopHnPost('Give me the top 11 Hacker News posts'))

/*
Example response

Here are the top 11 Hacker News posts:

1. **Title:** Wild – A fast linker for Linux
   - URL: [https://github.com/davidlattimore/wild](https://github.com/davidlattimore/wild)
   - Comments URL: [https://news.ycombinator.com/item?id=42814683](https://news.ycombinator.com/item?id=42814683)

2. **Title:** Show HN: Cs16.css – CSS library based on CS 1.6 UI
   - URL: [https://cs16.samke.me](https://cs16.samke.me)
   - Comments URL: [https://news.ycombinator.com/item?id=42814110](https://news.ycombinator.com/item?id=42814110)

3. **Title:** Subpixel Snake [video]
   - URL: [https://www.youtube.com/watch?v=iDwganLjpW0](https://www.youtube.com/watch?v=iDwganLjpW0)
   - Comments URL: [https://news.ycombinator.com/item?id=42815288](https://news.ycombinator.com/item?id=42815288)

4. **Title:** Snowdrop OS – a homebrew operating system from scratch, in assembly language
   - URL: [http://sebastianmihai.com/snowdrop/](http://sebastianmihai.com/snowdrop/)
   - Comments URL: [https://news.ycombinator.com/item?id=42814820](https://news.ycombinator.com/item?id=42814820)

5. **Title:** C++26: Pack Indexing
   - URL: [https://www.sandordargo.com/blog/2025/01/22/cpp26-pack-indexing](https://www.sandordargo.com/blog/2025/01/22/cpp26-pack-indexing)
   - Comments URL: [https://news.ycombinator.com/item?id=42816207](https://news.ycombinator.com/item?id=42816207)

The remaining posts are not included here due to space constraints, but you can view them on the Hacker News website.

*/
