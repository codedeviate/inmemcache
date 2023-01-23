import { InMemCache } from '../index'

const cache = new InMemCache(5)

cache.set("test", "key1", "value1", 5000)
cache.set("test", "key2", "value2", 5000)
cache.set("test", "key3", "value3", 5000)
cache.set("test", "key4", "value4", 5000)
cache.set("test", "key5", "value5", 5000)
cache.set("test", "key6", "value6", 5000)
cache.set("test", "key7", "value7", 5000)
cache.set("test", "key8", "value8", 6000)

console.log("Size is", cache.size())

setTimeout(() => {
    console.log("Size is", cache.size())
}, 2000)

setTimeout(() => {
    console.log("Size is", cache.size())
}, 5500)

setTimeout(() => {
    cache.kill()
}, 7500)