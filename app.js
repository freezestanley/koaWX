const koa = require('koa')
const app = new koa()
const bodyParser = require('koa-bodyparser')
const koaStatic  = require('koa-static') 
const path = require('path')
const views  = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const http = require('http')
const logger = require('./log')
const config = require('./config')
const httpRequest = require('./utills')
const router = require('./router')
const xmlParser = require('koa-xml-parser')

const parseXML = xmlParser({
  limit: '1MB',           // Reject payloads larger than 1 MB
  encoding: 'UTF-8',      // Explicitly set UTF-8 encoding
  xml: {
    normalize: true,      // Trim whitespace inside text nodes
    normalizeTags: true,  // Transform tags to lowercase
    explicitArray: false  // Only put nodes in array if >1
  }
});
app.use(parseXML)

onerror(app)
app.use(json())
app.use(bodyParser({
  enableTypes:['json', 'form', 'text','xml']
}))

logger.warn('starting')

//静态服务器资源
app.use(views(path.resolve(__dirname, './application')))
app.use(koaStatic(path.resolve(__dirname, './application')))

app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`); // 打印URL
  await next(); // 调用下一个middleware
});

app.use(async (ctx, next) => {
  const start = new Date().getTime(); // 当前时间
  await next(); // 调用下一个middleware
  const ms = new Date().getTime() - start; // 耗费时间
  console.log(`Time: ${ms}ms`); // 打印耗费时间
});

app.use(router.routes())

app.listen(3000)
console.log('app start at port 3000...')