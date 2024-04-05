import * as orama2012 from 'orama-2.0.12'
import * as oramaLocal from 'orama-local'
import b from 'benny'
import { events } from './dataset/index.js'

const documents = events.slice(10_000, 20_000)
const documentLength = documents.length
const schema = {
    date: 'number',
    description: 'string',
    lang: 'enum',
    category1: 'enum',
    category2: 'enum',
    granularity: 'enum',
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
    b.save({ file: 'insert-events', version: '1.0.0' }),
    b.save({ file: 'insert-events', format: 'chart.html' }),
  )
}

