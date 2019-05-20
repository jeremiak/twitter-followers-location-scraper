
const fs = require('fs')

const cheerio = require('cheerio')
const http = require('axios')
const Queue = require('p-queue')

const delay = require('./delay.js')
const followers = require('./followers.json')
let handles = []
const queue = new Queue({ concurrency: 2 })

if (fs.existsSync('./follower-handles.json')) {
  handles = require('./follower-handles.json')
  console.log(`there are ${handles.length} handles existing, picking up where we left off`)
}

function enqueue(fn, delayMs = 0) {
  queue.add(() => delay(delayMs).then(fn()))
}

function getUserNameFromId(id) {
  const url = `https://twitter.com/intent/user?user_id=${id}`
  const config = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:66.0) Gecko/20100101 Firefox/66.0'
    }
  }
  return http.get(url, config).then(response => {
    console.log(`Trying to get user name for ${id}`)
    if (response.status !== 200) throw new Error(`${response.status} - ${response.data}`)

    const $ = cheerio.load(response.data)
    const handle = $('.nickname').text()
    console.log(`Found ${handle} for ${id}`)
    handles.push({ id, handle })

    return
  }).catch(e => {
    console.error(`Had issue with ${id}, will try again. Error: `, e)
    enqueue(() => getUserNameFromId(id), 1000)
  })
}

function save() {
  fs.writeFileSync('./follower-handles.json', JSON.stringify(handles, null, 2))
}

followers.forEach(({ follower }) => {
  const { accountId } = follower
  const match = handles.find(h => h.id === accountId)
  const secondsBefore = Math.floor(Math.random() * 3) + 1

  if (match) return
  enqueue(() => getUserNameFromId(accountId), secondsBefore * 1000)
})

queue.onEmpty().then(() => { save() }).catch(e => { debugger })
process.on('SIGINT', () => {
  queue.pause()
  queue.clear()
  save()
})