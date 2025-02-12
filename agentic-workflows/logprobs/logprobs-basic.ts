import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

const model = openai('gpt-4o-mini', { logprobs: 10 })
const prompt = `Finish this sentence, responding with the next word and nothing else. The unicorn's favourite colour is `

const lowTempResult = await generateText({
  model,
  temperature: 0, // Greedy sampling, only the top token is sampled
  prompt,
})

console.dir(lowTempResult.logprobs, { depth: null })

/**
Example output:
[
  {
    token: 'pink',
    logprob: -0.15612991,
    topLogprobs: [
      { token: 'pink', logprob: -0.15612991 },
      { token: 'spark', logprob: -2.6561298 },
      { token: 'rain', logprob: -3.2811298 },
      { token: 'purple', logprob: -3.5311298 },
      { token: 'blue', logprob: -5.28113 },
      { token: 'mag', logprob: -6.15613 },
      { token: 'gl', logprob: -9.40613 },
      { token: 'vio', logprob: -10.15613 },
      { token: ' pink', logprob: -10.40613 },
      { token: 'past', logprob: -10.53113 }
    ]
  }

*/

const highTempResult = await generateText({
  model,
  temperature: 2, // More random sampling.
  prompt,
})

console.dir(highTempResult.logprobs, { depth: null })

/**
Example output:
[
  {
    token: 'spark',
    logprob: -2.800707,
    topLogprobs: [
      { token: 'pink', logprob: -0.17570704 },
      { token: 'spark', logprob: -2.800707 },
      { token: 'rain', logprob: -2.925707 },
      { token: 'purple', logprob: -3.300707 },
      { token: 'blue', logprob: -4.925707 },
      { token: 'mag', logprob: -6.050707 },
      { token: 'gl', logprob: -9.550707 },
      { token: 'vio', logprob: -10.050707 },
      { token: ' pink', logprob: -10.300707 },
      { token: 'past', logprob: -10.800707 }
    ]
  }
]
*/
