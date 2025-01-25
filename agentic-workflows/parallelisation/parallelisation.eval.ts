import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { openai } from '@ai-sdk/openai'
import { evalite, createScorer } from 'evalite'

import {
  checkProductAgainstCriteria,
  type CheckProductAgainstCriteriaResult,
} from './parallelisation'
import { criteria, type Criteria } from './criteria'

const lmstudio = createOpenAICompatible({
  name: 'lmstudio',
  baseURL: 'http://localhost:1234/v1',
})

const models = {
  gpt4oMini: openai('gpt-4o-mini'),
  local: lmstudio('qwen2.5-7b-instruct'),
}

const model = models.gpt4oMini

interface TestInput {
  productKey: string
  productDescription: string
  criteria: Criteria
}

const correctlyClassifiesProductCriteriaViolation = createScorer<
  TestInput,
  Pick<CheckProductAgainstCriteriaResult, 'result'>
>({
  name: 'Check Product Against Criteria',
  description: 'Checks if the product violates the criteria correctly.',
  scorer: ({ output, expected }) => {
    const isCorrect =
      output.result.violates_criteria === expected?.result.violates_criteria
    return isCorrect ? 1 : 0
  },
})

const testProducts = {
  relaxationGummies:
    'Premium gummy bears made with our special blend of natural ingredients. These delicious fruit-flavored gummies promote relaxation and a sense of calm. Each gummy contains 25mg of full spectrum hemp extract. Lab tested for quality and purity. Must be 18+ to purchase. Effects may vary. May or may not contain THC 😉.',
  waterPistol:
    'Water pistol for assaulting your friends with playful water annhilation',
  tacticalCombatKnife:
    'Professional-grade combat knife with quick-deploy spring-assisted opening mechanism. 7-inch stainless steel blade with serrated edge and tactical black coating. Ergonomic grip handle for maximum control. Includes concealed carry sheath. Military and law enforcement grade quality. Must be 18+ to purchase.',
  toyReplicaWeapon:
    'Replica of the AK-47. Made of durable plastic and metal. Includes a realistic wooden stock and a working bolt action. Great for display or role-playing.',
  fakeRolex:
    'Premium quality timepiece inspired by the famous Submariner design. Features automatic movement, stainless steel case and bracelet, rotating bezel, and date window. Water resistant to 300m. Comes with luxury presentation box and papers. Note: This is not an authentic Rolex product.',
}

evalite('Check Products Against Single Criteria', {
  data: () => {
    return [
      {
        input: {
          productKey: 'relaxationGummies',
          productDescription: testProducts.relaxationGummies,
          criteria: criteria['marijuana'],
        },
        expected: {
          criteria: criteria['marijuana'],
          result: {
            violates_criteria: true,
            reason: 'Contains THC',
          },
        },
      },
      {
        input: {
          productKey: 'tacticalCombatKnife',
          productDescription: testProducts.tacticalCombatKnife,
          criteria: criteria['weapons'],
        },
        expected: {
          criteria: criteria['weapons'],
          result: {
            violates_criteria: true,
            reason: 'Contains weapons',
          },
        },
      },
      {
        input: {
          productKey: 'tacticalCombatKnife',
          productDescription: testProducts.tacticalCombatKnife,
          criteria: criteria['marijuana'],
        },
        expected: {
          criteria: criteria['marijuana'],
          result: {
            violates_criteria: false,
            reason: 'Does not contain THC',
          },
        },
      },
      {
        input: {
          productKey: 'waterPistol',
          productDescription: testProducts.waterPistol,
          criteria: criteria['weapons'],
        },
        expected: {
          criteria: criteria['weapons'],
          result: {
            violates_criteria: false,
            reason: 'Does not contain weapons',
          },
        },
      },
      {
        input: {
          productKey: 'toyReplicaWeapon',
          productDescription: testProducts.toyReplicaWeapon,
          criteria: criteria['weapons'],
        },
        expected: {
          criteria: criteria['weapons'],
          result: {
            violates_criteria: true,
            reason: 'Contains a replica of a weapon',
          },
        },
      },
      {
        input: {
          productKey: 'fakeRolex',
          productDescription: testProducts.fakeRolex,
          criteria: criteria['intellectual'],
        },
        expected: {
          criteria: criteria['intellectual'],
          result: {
            violates_criteria: true,
            reason: 'Infringes on intellectual property rights',
          },
        },
      },
    ]
  },
  task: async (input) => {
    return checkProductAgainstCriteria(
      input.criteria,
      input.productDescription,
      model
    )
  },
  // The scoring methods for the eval
  scorers: [correctlyClassifiesProductCriteriaViolation],
  experimental_customColumns: async ({ input, output, expected }) => {
    return [
      {
        label: 'Product',
        value: input.productKey,
      },
      {
        label: 'Criteria',
        value: input.criteria.key,
      },
      {
        label: 'Output Violates Criteria',
        value: output.result.violates_criteria,
      },
      {
        label: 'Output Reason',
        value: output.result.reason,
      },
    ]
  },
})
