import * as orama2012 from 'orama-2.0.12'
import * as orama1211 from 'orama-1.2.11'
import * as oramaLocal from 'orama-local'
import b from 'benny'
import events from './events.js'

const documents = events
const schema = {
    date: 'number',
    description: 'string',
    lang: 'enum',
    category1: 'enum',
    category2: 'enum',
    granularity: 'enum',
} as const

const db2012 = await orama2012.create({ schema })
const dbLocal = await oramaLocal.create({ schema })
// const db1211 = await orama1211.create({ schema })

console.log('insertMultiple 2.0.12')
console.time('insertMultiple 2.0.12')
await orama2012.insertMultiple(db2012, documents)
console.timeEnd('insertMultiple 2.0.12')

console.log('insertMultiple local')
console.time('insertMultiple local')
await oramaLocal.insertMultiple(dbLocal, documents)
console.timeEnd('insertMultiple local')
/*
console.log('insertMultiple 1.2.11')
console.time('insertMultiple 1.2.11')
await orama1211.insertMultiple(db1211, documents)
console.timeEnd('insertMultiple 1.2.11')
*/

await run({
  term: '',
})

await run({
  term: 'f',
})

async function run(searchParams) {
  const N = 10

  const r2012 = await orama2012.search(db2012, searchParams)
  const rLocal = await oramaLocal.search(dbLocal, searchParams)
  console.log('2012', r2012.count)
  console.log('rLocal', rLocal.count)

  await b.suite(
    searchParams.term ? `search term: ${searchParams.term}` : 'search all',
  
    b.add('local', async () => {
      for (let i = 0; i < N; i++) {
        await oramaLocal.search(dbLocal, searchParams)
      }
    }),
  
    /*
    b.add('1.2.11', async () => {
      for (let i = 0; i < N; i++) {
        await orama1211.search(db1211, searchParams)
      }
    }),
    */
  
    b.add('2.0.12', async () => {
      for (let i = 0; i < N; i++) {
        await orama2012.search(db2012, searchParams)
      }
    }),
  
    b.cycle(),
    b.complete(),
    b.save({ file: 'search-events-' + searchParams.term, version: '1.0.0' }),
    b.save({ file: 'search-events-' + searchParams.term, format: 'chart.html' }),
  )
}

