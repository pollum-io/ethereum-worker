export class Metrics {
  private requestCount: number[]
  private oldHour: number
  constructor() {
    this.requestCount = Array.from({ length: 24 }, () => 0)

    this.oldHour = 0
  }

  public countRequest() {
    const startTime = new Date()

    const h = startTime.getHours()

    if (h > this.oldHour) {
      this.oldHour = h
    }
    if (this.oldHour > h) {
      this.oldHour = h
      this.requestCount[h] = 0
    }
    this.requestCount[h] += 1
  }

  public getRequestCount() {
    return this.requestCount
  }
}
