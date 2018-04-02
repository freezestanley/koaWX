const router = require('koa-router')()
const crypto = require('crypto')
const logger = require('../log')
const config = require('../config')
const httpRequest = require('../utills')
const qs = require('querystring')
const https = require('https')

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
}).post('/author', async (ctx, next) => {
  console.log("-----------body-----");
  console.dir(ctx.request.query.signature)
  console.log(ctx.req.body)
  ctx.res.writeHead(200, {'Content-Type': 'application/xml'});
  var data = ctx.req.body.xml;
  var resMsg = '<xml>' +
    '<ToUserName><![CDATA[' + data.fromusername + ']]></ToUserName>' +
    '<FromUserName><![CDATA[' + data.tousername + ']]></FromUserName>' +
    '<CreateTime>' + parseInt(new Date().valueOf() / 1000) + '</CreateTime>' +
    '<MsgType><![CDATA[text]]></MsgType>' +
    '<Content><![CDATA['+Math.random()+']]></Content>' +
    '</xml>';
  ctx.res.end(resMsg);
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
  // console.log('qs======')
  // console.log(qs.stringify(option.data))
  return await httpRequest(option)
}
router.get('/test', async (ctx, next) => {
  await ctx.render('cc')
  next()
})
router.get('/token', async (ctx, next) => {
  let token = await getToken()
  // console.log(`token = ${token}`)
  ctx.body = `token: ${token}`
})
router.get('/menu/:key', async (ctx, next) => {
  let token = await getToken()
  console.log('==========token.access_token=======')
  token = JSON.parse(token)
  console.log(token.access_token)
  if (ctx.params.key == 'create') {
    var option = {
        "button": [
            {
                "name": "test", 
                "sub_button": [
                    {
                        "type": "click", 
                        "name": "子菜单名", 
                        "key": "name1"
                    },
                    {
                      "type": "view", 
                      "name": "aboutus", 
                      "url": "http://www.baidu.com"
                    }
                ]
            }, 
            {
              "name": "扫码", 
              "sub_button": [
                  {
                      "type": "scancode_waitmsg", 
                      "name": "扫码带提示", 
                      "key": "rselfmenu_0_0", 
                      "sub_button": [ ]
                  }, 
                  {
                      "type": "scancode_push", 
                      "name": "扫码推事件", 
                      "key": "rselfmenu_0_1", 
                      "sub_button": [ ]
                  }
              ]
            },
            {
              "name": "发图", 
              "sub_button": [
                  {
                      "type": "pic_sysphoto", 
                      "name": "系统拍照发图", 
                      "key": "rselfmenu_1_0", 
                     "sub_button": [ ]
                   }, 
                  {
                      "type": "pic_photo_or_album", 
                      "name": "拍照或者相册发图", 
                      "key": "rselfmenu_1_1", 
                      "sub_button": [ ]
                  }, 
                  {
                      "type": "pic_weixin", 
                      "name": "微信相册发图", 
                      "key": "rselfmenu_1_2", 
                      "sub_button": [ ]
                  },
                  {
                    "name": "发送位置", 
                    "type": "location_select", 
                    "key": "rselfmenu_2_0"
                },
                {
                   "type": "media_id", 
                   "name": "图片", 
                   "media_id": "MEDIA_ID1"
                }, 
                {
                   "type": "view_limited", 
                   "name": "图文消息", 
                   "media_id": "MEDIA_ID2"
                }
              ]
            }
            
        ]
    }
  var postData = qs.stringify(option);
  var opts = {
      hostname: 'api.weixin.qq.com', 
      path: `/cgi-bin/menu/create?access_token=${token.access_token}`,
      methods: 'POST',
      headers:{
          'Content-Type':'application/json; encoding=utf-8',
          'Content-Length':postData.length
      }
  }
    var req = https.request(opts,function(res){
      var datas = [];
      var size = 0;
      res.setEncoding('utf8');
      res.on('data',function(data){
          datas.push(data);
          size += data.length;
      })
      res.on('end', function(data){
        console.log('end')
      })
    })
    req.on('error',function(err){
        console.log('异常,异常原因'+err);
        callback({success:false, msg:'失败'});
    })
    req.write(postData);
    ctx.body = `create token: ${token.access_token}`
  } else if (ctx.params.key == 'delete') {
    var options = {
      hostname: 'api.weixin.qq.com', 
      path: `/cgi-bin/menu/delete?access_token=${token.access_token}`, // /my/open?' 
      method: 'GET',
      headers: {  
        'Content-Type': 'application/json; charset=UTF-8'  
      } 
    }
    var req = https.request(options, function (res) {  
      res.setEncoding('utf8');  
      var callback = (chunk) => chunk;
      res.on('data', function (chunk) {
        console.log(chunk)
      });  
      res.on('end', function(data){
        console.log('end')
      })
    });  
    req.on('error', function (e) {  
      console.log('problem with request: ' + e.message);  
    });  
    req.end(); 
  } else if (ctx.params.key == 'get') {
    var options = {
      hostname: 'api.weixin.qq.com', 
      path: `/cgi-bin/menu/get?access_token=${token.access_token}`, // /my/open?' 
      method: 'GET',
      headers: {  
        'Content-Type': 'application/json; charset=UTF-8'  
      } 
    }
    var req = https.request(options, function (res) {  
      res.setEncoding('utf8');  
      var callback = (chunk) => chunk;
      res.on('data', function (chunk) {
        console.log(chunk)
      });  
      res.on('end', function(data){
        console.log('end')
      })
    });  
    req.on('error', function (e) {  
      console.log('problem with request: ' + e.message);  
    });  
    req.end();
    ctx.body = `get success`
  }
  next()
})

router.get('/wx/:key', async (ctx, next) => {
  let token = await getToken()
  console.log('==========token.access_token=======')
  token = JSON.parse(token)
  if (ctx.params.key == 'getIp') {
    var options = {
      hostname: 'api.weixin.qq.com', 
      path: `/cgi-bin/getcallbackip?access_token=${token.access_token}`, // /my/open?' 
      method: 'GET',
      headers: {  
        'Content-Type': 'application/json; charset=UTF-8'  
      } 
    }
    var req = https.request(options, function (res) {  
      res.setEncoding('utf8');  
      var callback = (chunk) => chunk;
      res.on('data', function (chunk) {
        console.log(chunk)
      });  
      res.on('end', function(data){
        console.log('end')
      })
    });  
    req.on('error', function (e) {  
      console.log('problem with request: ' + e.message);  
    });  
    req.end();
    ctx.body = `get success`
  }
})
module.exports = router