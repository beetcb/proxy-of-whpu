const app = require('express')()
const fetch = require('node-fetch')
const bp = require('body-parser')
const cp = require('cookie-parser')

const PORT = 3000

app.use(cp())
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

const cb = (req, res) => {
  const where = req.path.split('/')[2]
  const query = req.query

  const fetchOps = {
    headers: {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      Host: 'cas.whpu.edu.cn',
      Origin: 'https://cas.whpu.edu.cn',
      Referer: 'https://cas.whpu.edu.cn/authserver/login?service=https%3A%2F%2Fwhpu.campusphere.net%2Fportal%2Flogin',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
      Connection: 'keep-alive',
      Cookie: Object.keys(req.cookies).reduce((s, i) => `${s}${i}=${req.cookies[i]};`, ''),
      'Upgrade-Insecure-Requests': '1',
    },
    method: req.method,
    redirect: 'manual',
  }

  if (req.method === 'POST') {
    fetchOps.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    fetchOps.body = new URLSearchParams(req.body).toString()
  }

  fetch(`https://cas.whpu.edu.cn/authserver/${where}?${new URLSearchParams(query)}`, fetchOps).then((data) => {
    const fromHeader = data.headers.raw()
    data.body.pipe(res)
    res.status(data.status)
    Object.keys(fromHeader).forEach((e) => {
      res.setHeader(e, fromHeader[e])
    })
    console.log('用作请求的Cookie', fetchOps.headers.cookie)
    console.log('远端返回的Cookie：', data.headers.raw()['set-cookie'])
    console.log('本地请求的Cookie：', req.cookies)
  })
}

app.use(require('express').json())

app.get('/authserver/login', cb)
app.get('/checkNeedCaptcha.htl', cb)
app.get('/getCaptcha.htl', cb)

app.post('/authserver/login', cb)

app.get('/', (req, res) => {
  res.send()
})

app.listen(PORT)
