const fs = require('fs')

const cheerio = require('cheerio')
const http = require('axios')
const Queue = require('p-queue')

const delay = require('./delay.js')
const followers = require('./follower-handles.json')

let locations = []
const queue = new Queue({ concurrency: 2 })

if (fs.existsSync('./follower-locations.json')) {
  locations = require('./follower-locations.json')
  console.log(`there are ${locations.length} locations existing, picking up where we left off`)
}

function enqueue(fn, delayMs = 0) {
  queue.add(() => delay(delayMs).then(fn()))
}

function getUserLocationFromHandle(handle) {
  const url = `https://www.twitter.com/${handle}`
  return http.get(url).then(response => {
    console.log(`Trying to get location for ${handle}`)
    if (response.status !== 200) throw new Error(`${response.status} - ${response.data}`)

    const $ = cheerio.load(response.data)
    const locationElement = $('.ProfileHeaderCard-locationText')
    const location = locationElement ? locationElement.text().trim() : null

    console.log(`Found location for ${handle}`)
    locations.push({ handle, location })
    return
  }).catch(e => {
    console.error(`Had issue with ${handle}, will try again. Error: `, e)
    enqueue(() => getUserLocationFromHandle(handle), 1000)
  })
}

function save() {
  fs.writeFileSync('./follower-locations.json', JSON.stringify(locations, null, 2))
}

followers.forEach(({ handle }) => {
  const match = locations.find(l => l.handle === handle)
  const secondsBefore = Math.floor(Math.random() * 3) + 1

  if (match) return
  enqueue(() => getUserLocationFromHandle(handle), secondsBefore * 1000)
})

queue.onEmpty().then(() => { save() }).catch(e => { debugger })
process.on('SIGINT', () => { 
  queue.pause()
  queue.clear()
  save()
})