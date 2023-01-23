import {EventEmitter} from 'events'

type CacheItem = {
    value: any
    expires: number
}

const NumberSize = 8

export class InMemCache {
    private cache: Map<string, Map<string, any>> = new Map()
    private intervalHandler: number = 0
    private emitter: EventEmitter = new EventEmitter()

    constructor(maxCount: number = 100) {
        this.init(maxCount)
    }

    public init(maxCount: number = 100): void {
        if(!this.intervalHandler) {
            this.intervalHandler = setInterval(() => {
                const now = Date.now()
                this.cache.forEach((items, namespace) => {
                    const itemAge: Map<string, number> = new Map()
                    items.forEach((item, key) => {
                        if (item.expires < now) {
                            items.delete(key)
                            this.emitter.emit("expired", namespace, key)
                        } else {
                            itemAge.set(key, item.expires)
                        }
                    });
                    if (items.size === 0) {
                        this.cache.delete(namespace)
                    }
                    if (items.size > maxCount) {
                        const sorted = [...itemAge.entries()].sort((a, b) => a[1] - b[1])
                        for (let i = 0; i < sorted.length - maxCount; i++) {
                            items.delete(sorted[i][0])
                            this.emitter.emit("overflow", namespace, sorted[i][0])
                        }
                    }
                })
            }, 1000)
            this.emitter.emit("status", "init")
        } else {
            this.emitter.emit("status", "reinit")
        }
    }

    public kill(): void {
        this.emitter.emit("status", "kill")
        clearInterval(this.intervalHandler)
        this.intervalHandler = 0
    }

    public status(): string {
        return this.intervalHandler ? "alive" : "dead"
    }

    public get(namespace: string, key: string): any {
        const now = Date.now()
        const items = this.cache.get(namespace)
        if (!items) {
            // Cache miss - didn't exist
            return null
        }
        const item = items.get(key)
        if (item && item.expires >= now) {
            // Cache hit
            return item.value
        }
        if(item) {
            this.emitter.emit("delete", namespace, key)
        }
        this.cache.delete(key)
        return null
    }
    
    public set(namespace: string, key: string, value: any, timeout: number = 300): any {
        const expires = Date.now() + timeout
        let items = this.cache.get(namespace)
        if(items === undefined) {
            this.cache.set(namespace, new Map())
            items = this.cache.get(namespace)
        }
        (items as Map<string, any>).set(key, {
            value,
            expires
        })
        this.emitter.emit("set", namespace, key, value)
        return value
    }

    public on(event: string, listener: (...args: any[]) => void): this {
        this.emitter.on(event, listener)
        return this;
    }

    public once(event: string, listener: (...args: any[]) => void): this {
        this.emitter.once(event, listener)
        return this;
    }

    public off(event: string, listener: (...args: any[]) => void): this {
        this.emitter.off(event, listener)
        return this;
    }

    public removeListener(event: string, listener: (...args: any[]) => void): this {
        this.emitter.removeListener(event, listener)
        return this;
    }

    public removeAllListeners(event?: string): this {
        this.emitter.removeAllListeners(event)
        return this;
    }

    public emit(event: string, ...args: any[]): boolean {
        return this.emitter.emit(event, ...args)
    }

    public size(namespace?: string): number {
        if (namespace) {
            const items = this.cache.get(namespace)
            if (!items) {
                return 0
            }
            return items.size
        }
        let total = 0
        this.cache.forEach((items) => {
            total += items.size
        })
        return total
    }

    public memoryUsage(namespace?: string): number {
        let total = 0
        if (namespace) {
            total += namespace.length
            const items = this.cache.get(namespace)
            if (items) {
                items.forEach((item, key) => {
                    total += key.length
                    total += item.value.length
                    total += NumberSize
                })
            }
        } else {
            this.cache.forEach((items) => {
                items.forEach((item, key) => {
                    total += key.length
                    total += item.value.length
                    total += NumberSize
                })
            })
        }
        return total
    }

    public has(namespace: string, key: string): boolean {
        const items = this.cache.get(namespace)
        if (!items) {
            return false
        }
        return items.has(key)
    }

    public delete(namespace: string, key: string): boolean {
        const items = this.cache.get(namespace)
        if (!items) {
            return false
        }
        this.emit("delete", namespace, key)
        return items.delete(key)
    }

    public clear(namespace: string): void {
        this.emit("clear", namespace)
        this.cache.delete(namespace)
    }

    public clearAll(): void {
        this.emit("clear-all")
        this.cache.clear()
    }

}