'use strict'
const qs = require('querystring')
const http = require('http')
  // var option = {
  //   hostname: 'asiaxxli.free.ngrok.cc', 
  //   path: '/my/open',
  //   data: {  
  //     signature: 123, 
  //     echostr: 'Abcd1234', 
  //     timestamp: new Date().getTime()
  //   }
  // }
  // httpRequest(option).then(result=> {
  //     console.log('post=' + result);
  // }).catch(err=> {
  //     console.log(err);
  // })

  // option = {
  //   hostname: 'asiaxxli.free.ngrok.cc', 
  //   path: '/my/author',
  //   method: 'GET',
  //   data: {  
  //     signature: 123, 
  //     echostr: 'Abcd1234', 
  //     timestamp: new Date().getTime()
  //   }
  // }
  // httpRequest(option).then(result=> {
  //     console.log('get=' + result);
  // }).catch(err=> {
  //     console.log(err);
  // })
module.exports = async function (opt) {
  var options = {  
    hostname: opt.hostname || 'asiaxxli.free.ngrok.cc', 
    path: opt.path + '?' + qs.stringify(opt.data), // /my/open?' 
    method: opt.method || 'POST',
    headers: {  
      'Content-Type': 'application/json; charset=UTF-8'  
    }   
  }
  function test () {
    return new Promise((resolve,reject) => {
      var req = http.request(options, function (res) {  
        console.log('STATUS: ' + res.statusCode);  
        console.log('HEADERS: ' + JSON.stringify(res.headers));  
        res.setEncoding('utf8');  
        var callback = (chunk) => chunk;
        res.on('data', function (chunk) {
          resolve(chunk)  
          console.log('BODY: ' + chunk)
        });  
      });  
      req.on('error', function (e) {  
        console.log('problem with request: ' + e.message);  
      });  
      req.end(); 
    })
  }
  let aab = await test()
  return aab
}