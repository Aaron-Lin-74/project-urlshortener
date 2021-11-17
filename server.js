require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

const dns = require('dns')

// Basic Configuration
const port = process.env.PORT || 3000

app.use(cors())

app.use('/public', express.static(`${process.cwd()}/public`))

app.use(express.json())
app.use(express.urlencoded())

const dataStore = []
let short_url = 1

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' })
})

app.post('/api/shorturl', function (req, res) {
  let url = req.body.url
  if (/^https?:\/\//i.test(url)) {
    // if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      let lookupURL = new URL(url)
      dns.lookup(lookupURL.host, (err, address, family) => {
        if (address !== undefined) {
          const result = { original_url: url, short_url: short_url++ }
          dataStore.push(result)
          console.log(dataStore)
          res.status(200).json(result)
        } else {
          return res.json({ error: 'invalid url' })
        }
      })
    } catch (e) {
      return res.json({ error: 'invalid url' })
    }
  } else {
    return res.json({ error: 'invalid url' })
  }
})

app.get('/api/shorturl/:short_url', function (req, res) {
  const index = Number(req.params['short_url'])
  if (!index) {
    return res.status(400).json({ error: 'invalid short url' })
  }
  const url = dataStore.find((item) => item['short_url'] === index)
  if (url === undefined) {
    return res.status(404).json({ error: 'could not find this short url' })
  }
  res.redirect(url.original_url)
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})
