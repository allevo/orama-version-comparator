import * as orama2012 from 'orama-2.0.12'
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

const documents = generateDocuments(1_000)
const documentLength = documents.length
const schema = {
  username: 'string'
} as const

await run()

async function run() {
  await b.suite(
    'insertMultiple',
  
    b.add('local', async () => {      
      const dbLocal = await oramaLocal.create({ schema })
      for (let i = 0; i < documentLength; i++) {
        await oramaLocal.insert(dbLocal, documents[i])
      }
    }),

    b.add('2.0.12', async () => {
      const db2012 = await orama2012.create({ schema })
      for (let i = 0; i < documentLength; i++) {
        await orama2012.insert(db2012, documents[i])
      }
    }),
  
    b.cycle(),
    b.complete(),
    b.save({ file: 'insert', version: '1.0.0' }),
    b.save({ file: 'insert', format: 'chart.html' }),
  )
}

