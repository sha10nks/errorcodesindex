import https from 'https'

const SITEMAP_URL = 'https://errorcodesindex.com/sitemap.xml'

function ping(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        res.resume()
        resolve({ statusCode: res.statusCode, url })
      })
      .on('error', reject)
  })
}

async function main() {
  const endpoints = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  ]

  const results = await Promise.allSettled(endpoints.map(ping))
  for (const r of results) {
    if (r.status === 'fulfilled') {
      console.log('Pinged:', r.value.url, r.value.statusCode)
    } else {
      console.warn('Ping failed:', r.reason?.message || r.reason)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 0 // never fail build on ping
})

