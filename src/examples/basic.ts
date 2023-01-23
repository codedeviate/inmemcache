import { InMemCache } from ".."

const cache = new InMemCache(5)

cache.on("status", (status) => {
    console.log("status", status)
})

cache.on("expired", (namespace, key) => {
    console.log("expired", namespace, key)
})

cache.on("delete", (namespace, key) => {
    console.log("delete", namespace, key)
})

cache.on("clear", (namespace) => {
    console.log("clear", namespace)
})

cache.on("clear-all", () => {
    console.log("clear-all")
})

cache.on("set", (namespace, key, value) => {
    console.log("set", namespace, key, value)
})

cache.on("overflow", (namespace, key) => {
    console.log("overflow", namespace, key)
})

cache.set("test", "key1", "value1", 5000)
cache.set("test", "key2", "value2", 5000)
cache.set("test", "key3", "value3", 5000)
cache.set("test", "key4", "value4", 5000)
cache.set("test", "key5", "value5", 5000)
cache.set("test", "key6", "value6", 5000)
cache.set("test", "key7", "value7", 5000)
cache.set("test", "key8", "value8", 6000)

console.log(cache.get("test", "key1"))

setTimeout(() => {
    cache.delete("test", "key5")
    console.log("Cache is", cache.status())
}, 2000)

setTimeout(() => {
    console.log("Items in cache", cache.size())
    console.log("Cache is", cache.status())
}, 5100)

setTimeout(() => {
    cache.kill()
    console.log("Cache is", cache.status())
}, 6100)

setTimeout(() => {
    console.log("Cache is", cache.status())
}, 7100)