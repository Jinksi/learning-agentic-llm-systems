import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { embedMany, embed, cosineSimilarity } from 'ai'
import { createOllama } from 'ollama-ai-provider'

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
})

const lmstudio = createOpenAICompatible({
  name: 'lmstudio',
  baseURL: 'http://localhost:1234/v1',
})

// const model = lmstudio.textEmbeddingModel(
//   'text-embedding-nomic-embed-text-v1.5' // Providing a model name will auto-load the model
// )
const model = ollama.textEmbeddingModel('nomic-embed-text')

const values = ['Mars', 'Pineapple', 'Eucalyptus', 'Opinion']

// Embeddings are an array of vectors, one for each word in `values`
const { embeddings } = await embedMany({
  model,
  values,
})

// Store the embeddings in a basic vector database,
// associating each value above with it's embedding
const vectorDatabase = embeddings.map((embedding, index) => ({
  value: values[index],
  embedding,
}))

const searchTerm = await embed({
  model,
  value: 'Assumption',
})

const entries = vectorDatabase.map((entry) => {
  return {
    value: entry.value,
    // Compare the search term with each entry to find similarity value, between 0 and 1
    similarity: cosineSimilarity(entry.embedding, searchTerm.embedding),
  }
})

// Sort by similarity, descending
console.log(entries.sort((a, b) => b.similarity - a.similarity))

/*
[
  { value: 'Opinion', similarity: 0.6168683508020734 },
  { value: 'Eucalyptus', similarity: 0.47055352566035763 },
  { value: 'Mars', similarity: 0.4543035286634257 },
  { value: 'Pineapple', similarity: 0.4413786556235543 }
]
*/
