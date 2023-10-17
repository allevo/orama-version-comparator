import * as orama200beta1 from 'orama-2.0.0-beta.1'
import * as oramaLocal from 'orama-local'
import { faker } from '@faker-js/faker'
import { run, bench, group, baseline } from 'mitata'

faker.seed(123);

function generateDocuments(n: number): { username: string }[] {
  const documents = new Array(n)
  for (let i = 0; i < n; i++) {
    documents[i] = {
      username: faker.internet.userName()
    }
  }
  return documents
}

const schema = {
  username: 'string'
} as const

const db200beta1 = await orama200beta1.create({ schema })
const dbLocal = await oramaLocal.create({ schema })

const documents = generateDocuments(1000)

await orama200beta1.insertMultiple(db200beta1, documents)
await oramaLocal.insertMultiple(dbLocal, documents)

const searchParams = {
  term: 'f',
  limit: 10
}

const r200beta1 = await orama200beta1.search(db200beta1, searchParams)
const rLocal = await oramaLocal.search(dbLocal, searchParams)

console.log('200beta1', r200beta1.count)
console.log('rLocal', rLocal.count)

const N = 10000

group('search', () => {
  baseline('local', async () => {
    for (let i = 0; i < N; i++) {
      await oramaLocal.search(dbLocal, searchParams)
    }
  })
  bench('2.0.0-beta.1', async () => {
    for (let i = 0; i < N; i++) {
      await orama200beta1.search(db200beta1, searchParams)
    }
  })
})

await run({
  avg: true, // enable/disable avg column (default: true)
  json: false, // enable/disable json output (default: false)
  colors: true, // enable/disable colors (default: true)
  min_max: true, // enable/disable min/max column (default: true)
  collect: false, // enable/disable collecting returned values into an array during the benchmark (default: false)
  percentiles: true, // enable/disable percentiles column (default: true)
})
