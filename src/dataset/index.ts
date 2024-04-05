import fs from 'node:fs'

const eventsFromFile = JSON.parse(fs.readFileSync('./src/dataset/events.json', 'utf8')) as {
    result: {
        count: number
        events: {
            date: string
            description: string
            lang: string
            category1: string
            category2: string
            granularity: string
        }[]
    }
}

const events: {
    date: number | undefined
    description: string
    lang: string
    category1: string
    category2: string
    granularity: string
}[] = eventsFromFile.result.events
    .map(ev => {
        let date: number | undefined = new Date(ev.date).getTime()
        if (isNaN(date)) {
            date = undefined
        }
        return {
            date,
            description: ev.description,
            lang: ev.lang,
            category1: ev.category1,
            category2: ev.category2,
            granularity: ev.granularity,
        }
    })

export { events }