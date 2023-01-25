import {EventEmitter} from 'events'

type CacheItem = {
    value: any
    expires: number
}

const NumberSize = 8

export class InMemCache {
    private cache: Map<string, Map<string, any>> = new Map()
    private intervalHandler: NodeJS.Timeout | null = null
    private emitter: EventEmitter = new EventEmitter()
    public static timeout1Y = 31536000000
    public static timeout6M = 15768000000
    public static timeout3M = 7884000000
    public static timeout2M = 5256000000
    public static timeout1M = 2628000000
    public static timeout1W = 604800000
    public static timeout3D = 259200000
    public static timeout2D = 172800000
    public static timeout1D = 86400000
    public static timeout24h = 86400000
    public static timeout12h = 43200000
    public static timeout6h = 21600000
    public static timeout3h = 10800000
    public static timeout2h = 7200000
    public static timeout1h = 3600000
    public static timeout30m = 1800000
    public static timeout15m = 900000
    public static timeout10m = 600000
    public static timeout5m = 300000
    public static timeout2m = 120000
    public static timeout1m = 60000
    public static timeout30s = 30000
    public static timeout15s = 15000
    public static timeout10s = 10000
    public static timeout5s = 5000
    public static timeout2s = 2000
    public static timeout1s = 1000

    constructor(maxCount: number = 100, cleanUpInterval: number = 1000) {
        this.init(maxCount, cleanUpInterval)
    }

    public init(maxCount: number = 100, cleanUpInterval: number = 1000): void {
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
            }, cleanUpInterval)
            this.emitter.emit("status", "init")
        } else {
            this.emitter.emit("status", "reinit")
        }
    }

    public kill(): void {
        this.emitter.emit("status", "kill")
        clearInterval(this.intervalHandler as NodeJS.Timeout)
        this.intervalHandler = null
    }

    public status(): string {
        return this.intervalHandler ? "alive" : "dead"
    }

    public get(namespace: string, key: string): any {
        const now = Date.now()
        const items = this.cache.get(namespace)
        if (!items) {
            // Cache miss - didn't exist
            return undefined
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
        return undefined
    }
    
    public set(namespace: string, key: string, value: any, timeout: number = 300000): any {
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

    public calcTimeout(days: number = 0, hours: number = 0, minutes: number = 0, seconds: number = 0): number {
        return days * InMemCache.timeout1D + hours * InMemCache.timeout1h + minutes * InMemCache.timeout1m + seconds * InMemCache.timeout1s
    }

}