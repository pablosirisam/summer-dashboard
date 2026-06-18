// CDP screenshot helper — drives the Chrome already running on :9222.
// usage: node shot.mjs <url> <width> <height> <out.png> [mode] [waitMs]
//   mode = "full"     -> whole page (captureBeyondViewport)
//   mode = "<y>:<h>"  -> clip region at y, height h (beyond viewport, no scroll)
//   mode = omitted    -> viewport only
const [url, wS, hS, out, mode, waitS] = process.argv.slice(2)
const width = Number(wS), height = Number(hS)
const waitMs = Number(waitS || 2800)
const CDP = 'http://127.0.0.1:9222'

const ver = await (await fetch(`${CDP}/json/version`)).json()
const ws = new WebSocket(ver.webSocketDebuggerUrl)
let id = 0
const pending = new Map()
const send = (method, params = {}, sessionId) =>
  new Promise((res, rej) => {
    const mid = ++id
    pending.set(mid, { res, rej })
    ws.send(JSON.stringify({ id: mid, method, params, sessionId }))
  })

await new Promise(r => (ws.onopen = r))
ws.onmessage = e => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id)
    pending.delete(m.id)
    m.error ? rej(new Error(m.error.message)) : res(m.result)
  }
}

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
await send('Page.enable', {}, sessionId)
await send('Emulation.setDeviceMetricsOverride',
  { width, height, deviceScaleFactor: 2, mobile: width < 600 }, sessionId)
await send('Page.navigate', { url }, sessionId)
await new Promise(r => setTimeout(r, waitMs))

// Scroll sweep so IntersectionObserver (whileInView) reveals fire, then back to top.
await send('Runtime.evaluate', {
  expression: `(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += ${height} * 0.7) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 130));
    }
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 400));
  })()`,
  awaitPromise: true,
}, sessionId)
await new Promise(r => setTimeout(r, 500))

let shotParams = { format: 'png' }
if (mode === 'full') {
  const { contentSize } = await send('Page.getLayoutMetrics', {}, sessionId)
  shotParams = {
    format: 'png', captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: contentSize.width, height: Math.ceil(contentSize.height), scale: 1 },
  }
} else if (mode && mode.includes(':')) {
  const [y, h] = mode.split(':').map(Number)
  shotParams = {
    format: 'png', captureBeyondViewport: true,
    clip: { x: 0, y, width, height: h, scale: 1 },
  }
}
const { data } = await send('Page.captureScreenshot', shotParams, sessionId)
const fs = await import('node:fs')
fs.writeFileSync(out, Buffer.from(data, 'base64'))
await send('Target.closeTarget', { targetId })
ws.close()
console.log('WROTE', out)
process.exit(0)
