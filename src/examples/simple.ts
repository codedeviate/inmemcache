import { InMemCache } from '../index'

const cache = new InMemCache(5)

cache.set("test", "key1", "value1", InMemCache.timeout5s)
cache.set("test", "key2", "value2", InMemCache.timeout5s)
cache.set("test", "key3", "value3", InMemCache.timeout5s)
cache.set("test", "key4", "value4", InMemCache.timeout5s)
cache.set("test", "key5", "value5", InMemCache.timeout5s)
cache.set("test", "key6", "value6", InMemCache.timeout5s)
cache.set("test", "key7", "value7", InMemCache.timeout5s)
cache.set("test", "key8", "value8", InMemCache.timeout10s)

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