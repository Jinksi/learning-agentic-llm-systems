import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { readFileSync } from 'fs'

// const model = anthropic('claude-3-5-sonnet-latest')
const model = openai('gpt-4o-mini')

const systemPrompt =
  `You will receive an image. ` +
  `Please create an alt text for the image. ` +
  `Be concise. ` +
  `Use adjectives only when necessary. ` +
  `Do not pass 160 characters. ` +
  `Use simple language. `

export const describeImage = async (imagePath?: string, imageUrl?: string) => {
  let image: Buffer | URL | null = null

  if (imagePath) {
    // load image as Uint8Array
    image = readFileSync(imagePath)
  } else if (imageUrl) {
    image = new URL(imageUrl)
  }

  if (!image) {
    throw new Error('No image found')
  }

  const { text } = await generateText({
    model,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image,
          },
        ],
      },
    ],
  })

  return text
}

// Image from local file
console.log(
  await describeImage('./vercel-ai-sdk-tutorial/images/hows-the-water.jpg')
)

// claude-3-5-sonnet-latest
// Comic showing two penguins: one jumping into water asks "how's the water?" while another floats in a colorful inner tube responds "cold" then "really cold" after the first penguin enters.

// Image from URL
// console.log(
//   await describeImage(
//     undefined,
//     'https://ia802204.us.archive.org/12/items/mbid-4693bdbc-d690-4f96-9af1-ded8cb2b7d8c/mbid-4693bdbc-d690-4f96-9af1-ded8cb2b7d8c-996600702.jpg'
//   )
// )

// claude-3-5-sonnet-latest
// Album cover of "Rubber Soul" with four faces arranged in a circular pattern against dark foliage background, with orange psychedelic text at top.
