import * as orama2012 from 'orama-2.0.12'
import * as orama1211 from 'orama-1.2.11'
import * as oramaLocal from 'orama-local'
import { faker } from '@faker-js/faker'
import b from 'benny'

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

const documents = generateDocuments(10_000)
const schema = {
  username: 'string'
} as const

const db2012 = await orama2012.create({ schema })
const dbLocal = await oramaLocal.create({ schema })
const db1211 = await orama1211.create({ schema })

await orama2012.insertMultiple(db2012, documents)
await oramaLocal.insertMultiple(dbLocal, documents)
await orama1211.insertMultiple(db1211, documents)

await run({
  term: '',
})

await run({
  term: 'f',
})

async function run(searchParams) {
  const N = 1_000

  const r2012 = await orama2012.search(db2012, searchParams)
  const rLocal = await oramaLocal.search(dbLocal, searchParams)
  const r1211 = await orama1211.search(db1211, searchParams)
  console.log('2012', r2012.count)
  console.log('rLocal', rLocal.count)
  console.log('r1211', r1211.count)

  await b.suite(
    searchParams.term ? `search term: ${searchParams.term}` : 'search all',
  
    b.add('local', async () => {
      for (let i = 0; i < N; i++) {
        await oramaLocal.search(dbLocal, searchParams)
      }
    }),
  
    b.add('1.2.11', async () => {
      for (let i = 0; i < N; i++) {
        await orama1211.search(db1211, searchParams)
      }
    }),
  
    b.add('2.0.12', async () => {
      for (let i = 0; i < N; i++) {
        await orama2012.search(db2012, searchParams)
      }
    }),
  
    b.cycle(),
    b.complete(),
    b.save({ file: 'search-' + searchParams.term, version: '1.0.0' }),
    b.save({ file: 'search-' + searchParams.term, format: 'chart.html' }),
  )
}

