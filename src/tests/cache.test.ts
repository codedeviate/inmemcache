import chai from 'chai'
import {InMemCache} from '../index'

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

describe('InMemCache', async () => {

    it('should create a cache', () => {
        const cache = new InMemCache()
        chai.expect(cache).to.be.an('object')
        cache.kill()
    })

    it('should set a value', () => {
        const cache = new InMemCache(5)
        cache.set('test', 'key1', 'value1', 5000)
        chai.expect(cache.get('test', 'key1')).to.equal('value1')
        cache.kill()
    })

    it('should set a value with a default ttl', () => {
        const cache = new InMemCache(5)
        cache.set('test', 'key1', 'value1')
        chai.expect(cache.get('test', 'key1')).to.equal('value1')
        cache.kill()
    })

    it('should set a value that times out', async () => {
        const cache = new InMemCache(5, 100)
        cache.set('test', 'key1', 'value1', 300)
        chai.expect(cache.get('test', 'key1')).to.equal('value1')
        await sleep(600)
        chai.expect(cache.get('test', 'key1')).to.equal(undefined)
        cache.kill()
    })

    it('should set five values nut limit the max count to two', async () => {
        const cache = new InMemCache(2, 100)
        cache.set('test', 'key1', 'value1', 1000)
        cache.set('test', 'key2', 'value2', 1000)
        cache.set('test', 'key3', 'value3', 1000)
        cache.set('test', 'key4', 'value4', 1000)
        cache.set('test', 'key5', 'value5', 1000)
        chai.expect(cache.size()).to.equal(5)
        await sleep(300)
        chai.expect(cache.size()).to.equal(2)
        cache.kill()
    })

    it('should reinit the cache', async() => {
        const cache = new InMemCache(5, 100)
        cache.init();
        chai.expect(cache.status()).to.equal('alive')
        cache.kill()
    })

    it('should kill the cache', async() => {
        const cache = new InMemCache(5, 100)
        cache.kill();
        chai.expect(cache.status()).to.equal('dead')
    })

    it('should get a value that has expired', async () => {
        const cache = new InMemCache(5, 2000)
        cache.set('test', 'key1', 'value1', 100)
        await sleep(300)
        chai.expect(cache.get('test', 'key1')).to.equal(undefined)
        cache.kill()
    })

    it('should delete a value', async () => {
        const cache = new InMemCache(5, 2000)
        cache.set('test', 'key1', 'value1', 1000)
        cache.delete('test', 'key1')
        chai.expect(cache.get('test', 'key1')).to.equal(undefined)
        cache.kill()
    })

    it('should register a status event', async () => {
        const cache = new InMemCache(5, 2000)
        cache.on('status', (status) => {
            chai.expect(status).to.equal('reinit')
        })
        cache.init()
        cache.removeAllListeners('status')
        cache.kill()
    })

    it('should register a once status event', async () => {
        const cache = new InMemCache(5, 2000)
        cache.once('status', (status) => {
            chai.expect(status).to.equal('reinit')
        })
        cache.init()
        cache.kill()
    })

    it('should turn off a status event', async () => {
        const listener = (status: string) => {
            chai.expect.fail('listener should not be called')
        }
        const cache = new InMemCache(5, 2000)
        cache.on('status', listener)
        cache.off('status', listener)
        cache.init()
        cache.kill()
    })

    it('should remove a status event listener', async () => {
        const listener = (status: string) => {
            chai.expect.fail('listener should not be called')
        }
        const listener2 = (status: string) => {
            chai.expect(status).to.equal('reinit')
        }
        const cache = new InMemCache(5, 2000)
        cache.on('status', listener)
        cache.on('status', listener2)
        cache.removeListener('status', listener)
        cache.init()
        cache.removeListener('status', listener2)
        cache.kill()
    })

    it('should remove all status event listeners', async () => {
        const listener = (status: string) => {
            chai.expect.fail('listener should not be called')
        }
        const listener2 = (status: string) => {
            chai.expect.fail('listener should not be called')
        }
        const cache = new InMemCache(5, 2000)
        cache.on('status', listener)
        cache.on('status', listener2)
        cache.removeAllListeners('status')
        cache.init()
        cache.kill()
    })

    it('should calculate the size of the cache', async () => {
        const cache = new InMemCache(5, 2000)
        cache.set('test', 'key1', 'value1', 1000)
        cache.set('test', 'key2', 'value2', 1000)
        cache.set('test', 'key3', 'value3', 1000)
        cache.set('test2', 'key4', 'value4', 1000)
        cache.set('test2', 'key5', 'value5', 1000)
        chai.expect(cache.size()).to.equal(5)
        chai.expect(cache.size('test')).to.equal(3)
        chai.expect(cache.size('test2')).to.equal(2)
        chai.expect(cache.size('test3')).to.equal(0)
        cache.kill()
    })

    it('should find if a key exists', async () => {
        const cache = new InMemCache(5, 2000)
        cache.set('test', 'key1', 'value1', 1000)
        chai.expect(cache.has('test', 'key1')).to.equal(true)
        chai.expect(cache.has('test', 'key2')).to.equal(false)
        chai.expect(cache.has('test2', 'key1')).to.equal(false)
        cache.kill()
    })
    
    it('should delete a key', async () => {
        const cache = new InMemCache(5, 2000)
        cache.set('test', 'key1', 'value1', 1000)
        chai.expect(cache.delete('test', 'key2')).to.equal(false)
        chai.expect(cache.delete('test2', 'key1')).to.equal(false)
        chai.expect(cache.delete('test', 'key1')).to.equal(true)
        cache.kill()
    })
    
    it('should clear a namespace', async () => {
        const cache = new InMemCache(5, 2000)
        cache.set('test1', 'key1', 'value1', 1000)
        cache.set('test2', 'key2', 'value2', 1000)
        chai.expect(cache.size('test1')).to.equal(1)
        cache.clear('test1')
        chai.expect(cache.size('test1')).to.equal(0)
        chai.expect(cache.size('test2')).to.equal(1)
        cache.clear('test2')
        chai.expect(cache.size('test1')).to.equal(0)
        chai.expect(cache.size('test2')).to.equal(0)
        cache.kill()
    })
    
    it('should clear all namespaces', async () => {
        const cache = new InMemCache(5, 2000)
        cache.set('test1', 'key1', 'value1', 1000)
        cache.set('test2', 'key2', 'value2', 1000)
        chai.expect(cache.size('test1')).to.equal(1)
        chai.expect(cache.size('test2')).to.equal(1)
        cache.clearAll()
        chai.expect(cache.size('test1')).to.equal(0)
        chai.expect(cache.size('test2')).to.equal(0)
        cache.kill()
    })

    it("should calculate timeouts", async () => {
        const cache = new InMemCache(5, 2000)
        chai.expect(cache.calcTimeout(1, 1, 1, 1)).to.equal(InMemCache.timeout1D + InMemCache.timeout1h + InMemCache.timeout1m + InMemCache.timeout1s)
        chai.expect(cache.calcTimeout(1, 1, 1)).to.equal(InMemCache.timeout1D + InMemCache.timeout1h + InMemCache.timeout1m)
        chai.expect(cache.calcTimeout(1, 1)).to.equal(InMemCache.timeout1D + InMemCache.timeout1h)
        chai.expect(cache.calcTimeout(1)).to.equal(InMemCache.timeout1D)
        chai.expect(cache.calcTimeout()).to.equal(0)
        cache.kill()
    })
    
    it("should get default timeout for a namespace", async () => {
        const cache = new InMemCache(5, 1000, 2000)
        chai.expect(cache.getNamespaceTimeout('test')).to.equal(2000)
        chai.expect(cache.getNamespaceTimeout('test2')).to.equal(2000)
        cache.setNamespaceTimeout('test', 1000)
        chai.expect(cache.getNamespaceTimeout('test')).to.equal(1000)
        chai.expect(cache.getNamespaceTimeout('test2')).to.equal(2000)
        cache.kill()
    })

    it("should get default maxCount for a namespace", async () => {
        const cache = new InMemCache(5, 1000, 2000)
        chai.expect(cache.getNamespaceMaxCount('test')).to.equal(5)
        chai.expect(cache.getNamespaceMaxCount('test2')).to.equal(5)
        cache.setNamespaceMaxCount('test', 10)
        chai.expect(cache.getNamespaceMaxCount('test')).to.equal(10)
        chai.expect(cache.getNamespaceMaxCount('test2')).to.equal(5)
        cache.kill()
    })

    it("should get all namespaces", async () => {
        const cache = new InMemCache(5, 1000, 2000)
        chai.expect(cache.getNamespaceKeys()).to.deep.equal([])
        cache.set('test', 'key1', 'value1', 1000)
        chai.expect(cache.getNamespaceKeys()).to.deep.equal(['test'])
        cache.kill()
    })

    it("should test cleaning", async () => {
        const cache = new InMemCache(1, 50, 2000)
        cache.set('xtest', 'key1', 'value1', 10000)
        cache.set('xtest', 'key2', 'value2', 10000)
        await sleep(300)
        chai.expect(cache.size()).to.equal(1)
        chai.expect(cache.size('xtest')).to.equal(1)

        const cache2 = new InMemCache(0, 50, 2000)
        cache2.setNamespaceMaxCount('xtest2', 1)
        cache2.set('xtest2', 'key1', 'value1', 10000)
        cache2.set('xtest2', 'key2', 'value2', 10000)
        await sleep(300)
        chai.expect(cache2.size()).to.equal(1)
        chai.expect(cache2.size('xtest2')).to.equal(1)

        const cache3 = new InMemCache(0, 50, 2000)
        cache3.set('ytest3', 'key1', 'value1', 10000)
        cache3.set('ytest3', 'key2', 'value2', 10000)
        await sleep(300)
        chai.expect(cache3.size()).to.equal(2)
        chai.expect(cache3.size('ytest3')).to.equal(2)
        cache.kill()
    })

})