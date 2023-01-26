# InMemCache
InMemCache is a memory based local cache.

Its primary usage is for simple storage of key/value-data whem there is no Redis, or alike, available.

Every namespace can have a separate default timeout and a limit on how many items that can be stored.

## Functions

### get(namespace: string, key: string): any
Get a key from a namespace. If the key isn't found in this namespace this function will return null.

### set(namespace: string, key: string, value: any, timeout: number = 300000): any
Set a value for a key in a namespace. This value will also have a timeout set. The default value for the timeout is 300 seconds (timeout is given i milliseconds).

### setNamespaceMaxCount(namespace: string, maxCount: number): void
Set the max number of cached items in a specific namespace

### setNamespaceTimeout(namespace: string, timeout: number): void
Set the timeout for a namespace

### getNamespaceMaxCount(namespace: string): number
Get the max number of cached items in a specific namespace

### getNamespaceTimeout(namespace: string): number
Get the timeout for a namespace

### getNamespaceKeys(): string[]
Get all namespaces currently in the cache

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
Add a one-time listener that will be triggered once.

### off(event: string, listener: (...args: any[]) => void): this
Remove an event listener.

### removeListener(event: string, listener: (...args: any[]) => void): this
Remove an event listener.

### removeAllListeners(event?: string): this
Remove all event listener. If an event is given then only listener for that event will be removed.

### emit(event: string, ...args: any[]): boolean
Force an event to be emitted.

### size(namespace?: string): number
The number of elements stored.

If a namespace is given then the function will return the number of elements stored in that namespace otherwise it will return the total amount of elements.

### has(namespace: string, key: string): boolean
Returns true if the key in the namespace is set. Otherwise it will return false.

### delete(namespace: string, key: string): boolean
Remove the data for the key in the namspace.

### clear(namespace: string): void
Remove all data for all keys in a namespace.

### clearAll(): void
Remove all data for all keys in all namespaces.

### init(maxCount: number = 100, cleanUpInterval: number = 1000): void
Initialize the cache. This is automatically done when the cache object is created.

maxCount defined the maximum number of items within a namespace.

cleanUpInterval defines how many milliseconds there should be between clean-up intervals. The main reason for this property is to make testing smoother.

But if you for some reason wishes to make a prooper reinitailization then you'll have to call the kill function first. Otherwise it will just fall thru and do nothing.

### kill(): void
Stops the interval handler that manages overflows and autmatic deletion of timed out values.

### status(): string
Returns "alive" if the interval handler is active. Otherwise it returnes "dead".

### calcTimeout(days: number = 0, hours: number = 0, minutes: number = 0, minutes: number = 0): number
Will calculate the number of milliseconds there is in the number of days, hours, minutes and seconds given as arguments.

The default values for all arguments is 0.

## Timeout static constants
There are a number of static constants declared for convinience. If the value you need isn't there then there is a function called calcTimeout where you can create your own. An alternative is to calculate the number of microseconds manually.

* timeout1Y - One year
* timeout6M - Six months
* timeout3M - Three months
* timeout2M - Two months
* timeout1M - One month
* timeout1W - One week
* timeout3D - Three days
* timeout2D - Two days
* timeout1D - One day
* timeout24h - Twentyfour hours
* timeout12h - Twelve hours
* timeout6h - Six hours
* timeout3h - Three hours
* timeout2h - Two hours
* timeout1h - One hour
* timeout30m - Thirty minutes
* timeout15m - Fifteen minutes
* timeout10m - Ten minutes
* timeout5m - Five minutes
* timeout2m - Two minutes
* timeout1m - One minute
* timeout30s - Thirty seconds
* timeout15s - Fifteen seconds
* timeout10s - Ten seconds
* timeout5s - Five seconds
* timeout2s - Two seconds
* timeout1s - One second

## Usage

### Simple example
examples/simple.ts
```typescript
import { InMemCache } from '..'

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

So the second output will say that the size is 5 which is correct since the clean-up job has been run.

The last output says that the size is 1 since the rest of the items added had a shorter timeout and has been deleted by the clean-up job.

Since there is an active interval handler in this module node will just keep running. So by calling *cache.kill()* you make node release its hooks and the program terminates.

## npm & nrun


**nrun** is a flexible and extended wrapper for *npm run* built in Go that can be found [here](https://github.com/codedeviate/nrun).

### npm run build | nrun build
Build the code in the dist directory.

### npm run example-basic | nrun example-basic
Build the code and run the basic example.

### npm run example-simple | nrun example-simple
Build the code and run the simple example.

### npm run test | nrun test
Tests the code

### npm run test-coverage | nrun test-coverage
Tests the code with coverage

The goal for coverage is 100% coverage without using *\/\* istanbul ignore next \*\/*