const value = {a:1, b:2}
const handler = {
  get (obj, prop) {
    const value = obj[prop];
    console.log(`GET ${prop} = ${value}`)
    return value 
  }
}
const proxy = new Proxy(values, handler)
console.log(proxy.a)
console.log(proxy.c)