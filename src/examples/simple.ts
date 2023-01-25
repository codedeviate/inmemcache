import { InMemCache } from '../index'

const cache = new InMemCache(5)

cache.set("test", "key1", "value1", cache.timeout5s)
cache.set("test", "key2", "value2", cache.timeout5s)
cache.set("test", "key3", "value3", cache.timeout5s)
cache.set("test", "key4", "value4", cache.timeout5s)
cache.set("test", "key5", "value5", cache.timeout5s)
cache.set("test", "key6", "value6", cache.timeout5s)
cache.set("test", "key7", "value7", cache.timeout5s)
cache.set("test", "key8", "value8", cache.timeout10s)

console.log("Size is", cache.size())

setTimeout(() => {
    console.log("Size is", cache.size())
}, 2000)

setTimeout(() => {
    console.log("Size is", cache.size())
}, 7500)

setTimeout(() => {
    cache.kill()
}, 12500)