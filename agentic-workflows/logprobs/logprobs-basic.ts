import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

const model = openai('gpt-4o', { logprobs: 10 })

const lowTempResult = await generateText({
  model,
  temperature: 0, // Greedy sampling, only the top token is sampled
  prompt:
    'Finish this sentence. Only respond with the next word: My favourite colour is...',
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
  },
  {
    token: '.',
    logprob: -0.061975636,
    topLogprobs: [
      { token: '.', logprob: -0.061975636 },
      { token: '<|end|>', logprob: -2.8119757 },
      { token: '!', logprob: -12.8119755 },
      { token: '<|end|>', logprob: -12.9369755 },
      { token: '।', logprob: -13.8119755 },
      { token: '。', logprob: -13.9369755 },
      { token: '  ', logprob: -15.1869755 },
      { token: '.\n', logprob: -15.5619755 },
      { token: '۔', logprob: -15.5619755 },
      { token: ' ', logprob: -15.6869755 }
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
