const router = require('koa-router')()
const crypto = require('crypto')
const logger = require('../log')
const config = require('../config')
const httpRequest = require('../utills')

router.get('/hello/:name', async (ctx, next) => {
  await ctx.render('bb')
}).post('/open', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
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
    ctx.body = "success"
  }
  // console.log(code)
  logger.error(code)
  // await ctx.render('aa')
})

let getToken = async () => {
  var option = {
    hostname: 'api.weixin.qq.com', 
    path: '/cgi-bin/token',
    methods: 'GET',
    data: {  
      grant_type: 'client_credential', 
      appid: config.appid, 
      secret: config.appsecret
    }
  }
  return await httpRequest(option)
}

router.get('/menu/:key', async (ctx, next) => {
  let token = await getToken()
  if (ctx.params.key == 'create') {
    var option = {
      hostname: 'api.weixin.qq.com', 
      path: `/cgi-bin/menu/create?access_token=${token}`,
      methods: 'POST',
      data:  {
        "button":[
          {    
             "type":"click",
             "name":"今日歌曲",
             "key":"V1001_TODAY_MUSIC"
          },
          {
              "name":"菜单",
              "sub_button":[
              {    
                  "type":"view",
                  "name":"搜索",
                  "url":"http://www.soso.com/"
               },
               {
                    "type":"miniprogram",
                    "name":"wxa",
                    "url":"http://mp.weixin.qq.com",
                    "appid":"wx286b93c14bbf93aa",
                    "pagepath":"pages/lunar/index"
                },
               {
                  "type":"click",
                  "name":"赞一下我们",
                  "key":"V1001_GOOD"
               }]
          }
        ]
      }
    }
    httpRequest(option).then(result=> {
      console.log('post=' + result);
      logger.error(result)
    }).catch(err=> {
        console.log(err);
    })
  } else {

  }
  

  ctx.body = "success"
})

module.exports = router