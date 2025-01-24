import { anthropic } from '@ai-sdk/anthropic'
import { generateObject } from 'ai'
import { readFileSync } from 'fs'
import { z } from 'zod'

const model = anthropic('claude-3-5-sonnet-latest')

// Lots of descriptions to really help the LLM figure it out
const schema = z
  .object({
    total: z.number().describe('The total amount of the invoice.'),
    currency: z.string().describe('The currency of the total amount.'),
    invoiceNumber: z.string().describe('The invoice number.'),
    companyName: z
      .string()
      .describe('The name of the company issuing the invoice.'),
  })
  .describe('The extracted data from the invoice.')

export const extractDataFromInvoice = async (invoicePath: string) => {
  const { object } = await generateObject({
    model,
    system:
      `You will receive an invoice. ` +
      `Please extract the data from the invoice.`,
    schema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'file',
            data: readFileSync(invoicePath),
            mimeType: 'application/pdf', // MIME type is required
          },
        ],
      },
    ],
  })

  return object
}

console.log(await extractDataFromInvoice('./images/invoice-1.pdf'))

console.log(await extractDataFromInvoice('./images/invoice-2.pdf'))
