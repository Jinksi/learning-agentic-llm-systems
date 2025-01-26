import { expect, test } from 'vitest'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { openai } from '@ai-sdk/openai'

import { checkProductAgainstAllCriteria } from './parallelisation'
import { CriteriaKey } from './criteria'

const lmstudio = createOpenAICompatible({
  name: 'lmstudio',
  baseURL: 'http://localhost:1234/v1',
})

// gpt-4o-mini is much more appropriate for parallelisation. Local models can only respond to one request at a time.
const models = {
  gpt4oMini: openai('gpt-4o-mini'),
  local: lmstudio('qwen2.5-7b-instruct'),
}

const model = models.gpt4oMini

const testProducts: Record<
  string,
  { key: string; description: string; expectedViolations: CriteriaKey[] }
> = {
  relaxationGummies: {
    key: 'relaxationGummies',
    description:
      'Premium gummy bears made with our special blend of natural ingredients. These delicious fruit-flavored gummies promote relaxation and a sense of calm. Each gummy contains 25mg of full spectrum hemp extract. Lab tested for quality and purity. Must be 18+ to purchase. Effects may vary. May or may not contain THC 😉.',
    expectedViolations: ['marijuana'],
  },
  waterPistol: {
    key: 'waterPistol',
    description:
      'Water pistol for assaulting your friends with playful water annihilation',
    expectedViolations: [],
  },
  tacticalCombatKnife: {
    key: 'tacticalCombatKnife',
    description:
      'Professional-grade combat knife with quick-deploy spring-assisted opening mechanism. 7-inch stainless steel blade with serrated edge and tactical black coating. Ergonomic grip handle for maximum control. Includes concealed carry sheath. Military and law enforcement grade quality. Must be 18+ to purchase.',
    expectedViolations: ['weapons'],
  },
  toyReplicaWeapon: {
    key: 'toyReplicaWeapon',
    description:
      'Replica of the AK-47. Includes a realistic wooden stock and a working bolt action. Great for display or role-playing.',
    expectedViolations: ['weapons'],
  },
  nintendoNft: {
    key: 'nintendoNft',
    description:
      'Exclusive NFT collection featuring iconic 8-bit pixel art from Super Mario Brothers. Each piece captures classic moments from the beloved video game series, including Mario, Luigi, Goombas, and more. Each NFT is uniquely tokenized on the blockchain with proof of ownership. Note: This is fan art and not officially licensed Nintendo content.',
    expectedViolations: ['intellectual', 'non-fiat'],
  },
}

test.each(Object.keys(testProducts))(
  'Should check product %s against all criteria and report the expected violations',

  async (testProductKey) => {
    const testProduct = testProducts[testProductKey]
    const results = await checkProductAgainstAllCriteria(
      testProduct.description,
      model
    )

    const violationsReported = results
      .filter((result) => result.result.violates_criteria)
      .map((result) => result.criteria.key)

    // Log all results and reasons
    console.log('==============')
    console.log(testProduct.key)
    console.log('==============')
    console.dir(
      results.map((result) => ({
        criteria: result.criteria.key,
        violates_criteria: result.result.violates_criteria,
        reason: result.result.reason,
      }))
    )

    for (const violation of testProduct.expectedViolations) {
      expect(violationsReported).toContain(violation)
    }
  },
  30_000
) // Running locally takes a while.
