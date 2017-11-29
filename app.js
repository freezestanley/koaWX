const koa = require('koa')
const app = new koa()
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const koaStatic  = require('koa-static') 
const path = require('path')
const views  = require('koa-views')
const log4js = require('log4js')
const crypto = require('crypto')
const json = require('koa-json')
const onerror = require('koa-onerror')

onerror(app)
app.use(json())
app.use(bodyParser({
  enableTypes:['json', 'form', 'text']
}))


log4js.configure({
  appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
  categories: { default: { appenders: ['cheese'], level: 'error' } }
})
const logger = log4js.getLogger('cheese')
logger.error('Entering cheese testing')

app.use(views(path.resolve(__dirname, './application')))
//静态服务器资源
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

router.get('/hello/:name', async (ctx, next) => {
  await ctx.render('bb')
})

router.get('/', async (ctx, next) => {
  await ctx.render('aa')
})

router.get('/author', async (ctx, next) => {
  var signature = ctx.query.signature
  var timestamp = ctx.query.timestamp
  var nonce = ctx.query.nonce
  var echostr = ctx.query.echostr
  var token = 'asiaxxli'
  /*  加密/校验流程如下： */
  //1. 将token、timestamp、nonce三个参数进行字典序排序
  var array = new Array(token,timestamp,nonce);
  array.sort();
  var str = array.toString().replace(/,/g,"");

  //2. 将三个参数字符串拼接成一个字符串进行sha1加密
  var sha1Code = crypto.createHash("sha1");
  var code = sha1Code.update(str,'utf-8').digest("hex");
  //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
  if(code === signature){
    ctx.body = echostr
  }else{
    ctx.body = "error"
  }
  // console.log(code)
  logger.error(code)
  // await ctx.render('aa')
})

app.use(router.routes())

app.listen(3000)
console.log('app start at port 3000...')