import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

const model = openai('gpt-4o', { logprobs: 10 })

const lowTempResult = await generateText({
  model,
  temperature: 0, // Greedy sampling, only the top token is sampled
  prompt:
    'Finish this sentence. Only respond with the next word and nothing else: My favourite colour is...',
})

console.dir(lowTempResult.logprobs, { depth: null })

/**
Example output:
[
  {
    token: 'blue',
    logprob: -0.0000061537958,
    topLogprobs: [
      { token: 'blue', logprob: -0.0000061537958 },
      { token: ' blue', logprob: -12.500006 },
      { token: 'Blue', logprob: -13.500006 },
      { token: 'purple', logprob: -14.375006 },
      { token: 'green', logprob: -15.750006 },
      { token: '.blue', logprob: -16.375006 },
      { token: 'red', logprob: -16.625006 },
      { token: '-blue', logprob: -17.750006 },
      { token: '蓝', logprob: -18.000006 },
      { token: '_blue', logprob: -18.000006 }
    ]
  }
]

*/

const highTempResult = await generateText({
  model,
  temperature: 1, // Very random sampling.
  prompt:
    'Finish this sentence. Only respond with the next word: My favourite colour is...',
})

console.dir(highTempResult.logprobs, { depth: null })

/**
Example output:
[
  {
    token: 'blue',
    logprob: -0.0003825293,
    topLogprobs: [
      { token: 'blue', logprob: -0.0003825293 },
      { token: 'green', logprob: -9.000382 },
      { token: 'purple', logprob: -9.125382 },
      { token: 'red', logprob: -9.375382 },
      { token: 'Blue', logprob: -9.750382 },
      { token: ' blue', logprob: -13.375382 },
      { token: 'black', logprob: -13.500382 },
      { token: 'te', logprob: -13.875382 },
      { token: '...', logprob: -14.375382 },
      { token: 'yellow', logprob: -15.125382 }
    ]
  }
]
*/
