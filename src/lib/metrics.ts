import NodeCache from 'node-cache'
import logger from '../utils/logger'

type Status = {
  cacheHits: Buffer
  requests: Buffer
}

export class Metrics {
  private status: Status
  private readonly cache?: NodeCache
  private readonly interval: number
  private lastHitsCount: number
  private lastStats: NodeCache.Stats & { datetime: Date }
  private readonly periods: number
  private readonly jobs?: NodeJS.Timeout[] = []
  private methodsCount: Record<string, number> = {}

  constructor(cache?: NodeCache, interval?: number, period?: number) {
    this.interval = (interval || 3600) * 1000
    this.cache = cache
    this.lastHitsCount = 0
    this.status = {} as any
    this.lastStats = {
      datetime: new Date(),
      hits: 0,
      keys: 0,
      ksize: 0,
      misses: 0,
      vsize: 0,
    }

    // period = 24*60*60 => 1 day
    // period = 24*60*60*30 => 30 days
    const totalMilliseconds = (period || 24 * 60 * 60) * 1000
    this.periods = Math.floor(totalMilliseconds / this.interval)

    if (this.cache) {
      // Alloc buffer for the number of hours (each int will consume 4 bytes)
      this.status['cacheHits'] = Buffer.alloc(this.periods * 4, 0)
    }
    this.status['requests'] = Buffer.alloc(this.periods * 4, 0)

    this.jobs.push(
      setInterval(() => {
        if (this.cache) {
          this.collectCache()
          this.shiftBuff(this.status.requests)
        }
      }, this.interval),
    )

    // Daily flush the request methods count
    this.jobs.push(
      setInterval(() => {
        logger.debug('FLUSHING METHODS COUNT')
        this.methodsCount = {}
      }, 60 * 60 * 24 * 1000), //One day in milliseconds
    )
  }

  private shiftBuff(buff: Buffer) {
    buff.copy(buff, 0, 4) // Shift the buffer by 4 bytes
    buff.writeInt32LE(0, buff.length - 4)
  }

  private collectCache() {
    logger.debug('Collecting metrics')
    const offset = this.status.cacheHits.length - 4
    logger.debug(
      "this.cache.getStats()['hits'] - last",
      this.cache.getStats()['hits'],
      this.lastHitsCount,
    )

    this.status.cacheHits.writeInt32LE(
      this.cache.getStats()['hits'] - this.lastHitsCount,
      offset,
    )
    this.lastHitsCount = this.cache.getStats()['hits']
    this.shiftBuff(this.status.cacheHits)

    logger.debug('Finishing the metric collect')
  }

  private toArray(buff: Buffer) {
    const arrayBuff = []
    for (let i = 0; i < buff.length / 4; i++) {
      arrayBuff.push(buff.readInt32LE(i * 4))
    }

    return arrayBuff
  }

  public countRequest() {
    const currentOffset = this.status.requests.length - 4

    const current = this.status.requests.readInt32LE(currentOffset)
    this.status.requests.writeInt32LE(current + 1, currentOffset)

    return current + 1
  }

  public countMethod(method: string) {
    if (this.methodsCount.hasOwnProperty(method)) {
      this.methodsCount[method] += 1
    } else {
      this.methodsCount[method] = 1
    }
  }

  public getRequestCount() {
    const requests = this.toArray(this.status.requests)
    const hits = this.toArray(this.status.cacheHits)
    const time = new Date()

    time.setMilliseconds(-this.periods * this.interval)

    const times = [time.toISOString()]
    for (let i = 1; i < this.periods; i++) {
      time.setMilliseconds(this.interval)
      times.push(time.toISOString())
    }

    let totalReq = 0
    let totalHits = 0

    for (let index = 0; index < requests.length; index++) {
      totalReq += requests[index]
      totalHits += hits[index]
    }

    return {
      times,
      requests,
      hits,
      totalReq,
      totalHits,
      countMethods: this.methodsCount,
    }
  }

  public flushMetrics() {
    this.cache.flushStats()
    return true
  }
  public flushAll() {
    this.cache.flushAll()
    return true
  }

  public currentMetrics() {
    let stats = this.cache.getStats()
    let datetime = new Date()
    logger.debug('stats', stats)
    let current = {
      datetime,
      ...stats,
    }
    let diff = {
      hits: current.hits - this.lastStats.hits,
      keys: current.keys - this.lastStats.keys,
      ksize: current.ksize - this.lastStats.ksize,
      vsize: current.vsize - this.lastStats.vsize,
      misses: current.misses - this.lastStats.misses,
      datetime,
    }
    let last = this.lastStats
    this.lastStats = current
    return {
      current,
      last,
      diff,
    }
  }
}
