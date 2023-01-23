# InMemCache
InMemCache is a memory based local cache.

Its primary usage is for simple storage of key/value-data whem there is no Redis, or alike, available.

## Functions

### get(namespace: string, key: string): any

### set(namespace: string, key: string, value: any, timeout: number = 300): any

### on(event: string, listener: (...args: any[]) => void): this

### once(event: string, listener: (...args: any[]) => void): this

### off(event: string, listener: (...args: any[]) => void): this

### removeListener(event: string, listener: (...args: any[]) => void): this

### removeAllListeners(event?: string): this

### emit(event: string, ...args: any[]): boolean

### size(namespace?: string): number

### memoryUsage(namespace?: string): number

### has(namespace: string, key: string): boolean

### delete(namespace: string, key: string): boolean

### clear(namespace: string): void

### clearAll(): void

### init(maxCount: number = 100): void

### kill(): void

### status(): string

## Usage

### Simple example
```typescript
import { InMemCache } from 'inmemcache'

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