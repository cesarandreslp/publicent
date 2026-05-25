import puppeteer from 'puppeteer'
const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', err => errors.push({ msg: err.message, stack: err.stack?.slice(0,400) }))
page.on('console', msg => { if (msg.type() === 'error') errors.push({ msg: msg.text() }) })
const url = 'https://personeriabuga.vercel.app/?nocache=' + Date.now()
console.log('Goto:', url)
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise(r => setTimeout(r, 4000))
console.log('Errors:', errors.length)
errors.forEach(e => { console.log('--'); console.log(e.msg); if (e.stack) console.log(e.stack) })
const html = await page.content()
const matches = html.match(/[0-9]+ de [a-z]+ de 2026/gi) || []
console.log('Dates rendered:', matches.slice(0,6))
await browser.close()
