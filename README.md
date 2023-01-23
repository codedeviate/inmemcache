# InMemCache
InMemCache is a memory based local cache.

Its primary usage is for simple storage of key/value-data whem there is no Redis, or alike, available.

## Functions

### get(namespace: string, key: string): any
Get a key from a namespace. If the key isn't found in this namespace this function will return null.

### set(namespace: string, key: string, value: any, timeout: number = 300000): any
Set a value for a key in a namespace. This value will also have a timeout set. The default value for the timeout is 300 seconds (timeout is given i milliseconds).

### on(event: string, listener: (...args: any[]) => void): this
Jack in on the internal eventhandler.

The following events will be emitted:
* expired
* overflow
* status
* delete
* set
* clear
* clear-all

### once(event: string, listener: (...args: any[]) => void): this

### off(event: string, listener: (...args: any[]) => void): this

### removeListener(event: string, listener: (...args: any[]) => void): this

### removeAllListeners(event?: string): this

### emit(event: string, ...args: any[]): boolean
Force an event to be emitted.

### size(namespace?: string): number
The number of elements stored.

If a namespace is given then the function will return the number of elements stored in that namespace otherwise it will return the total amount of elements.

### memoryUsage(namespace?: string): number
***EXPERIMENTAL FUNCTION***

This function will return an approximation if the memory used to store this data.

But since data can be stored in different formats this function may return a faulty value.

Do not use this in production.

### has(namespace: string, key: string): boolean
Returns true if the key in the namespace is set. Otherwise it will return false.

### delete(namespace: string, key: string): boolean
Remove the data for the key in the namspace.

### clear(namespace: string): void
Remove all data for all keys in a namespace.

### clearAll(): void
Remove all data for all keys in all namespaces.

### init(maxCount: number = 100): void
Initialize the cache. This is automatically done when the cache object is created.

But if you for some reason wishes to make a prooper reinitailization then you'll have to call the kill function first. Otherwise it will just fall thru and do nothing.

### kill(): void
Stops the interval handler that manages overflows and autmatic deletion of timed out values.

### status(): string
Returns "alive" if the interval handler is active. Otherwise it returnes "dead".

## Usage

### Simple example
examples/simple.ts
```typescript
import { InMemCache } from '..'

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
```
Output
```bash
# npm run example-simple

> inmemcache@x.x.x build
> tsc

Size is 8
Size is 5
Size is 1

# 
```
Directly after the eight items has been added the size will be 8.

When the clean-up job is run (which is once every second) it will delete those who is set to expire first.

So the second output will say that the size is 5 which is correct since the clecn-up job has been run.

The last output says that the size is 1 since the rest of the items added had a shorter timeout and has been deleted by the clean-up job.