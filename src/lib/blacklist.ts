export class Blacklist {
  private blacklist: string[] = []

  constructor(initial: string[] = []) {
    this.blacklist.push(...initial)
  }

  get getBlacklist() {
    return this.blacklist
  }

  public addToBlacklist(item: string) {
    if (typeof item !== 'string') {
      return false
    }
    this.blacklist.push(item)
    return true
  }

  public removeFromBlacklist(item: string) {
    if (typeof item !== 'string') {
      return false
    }
    const indexToRemove = this.blacklist.indexOf(item, 0)
    if (indexToRemove < 0) {
      return -1
    }

    this.blacklist.splice(indexToRemove, 1)
    return true
  }

  public isBlacklisted(item: string) {
    let blocked = false
    this.blacklist.forEach(function(contract) {
      if (item.toLocaleLowerCase().includes(contract.toLowerCase())) {
        blocked = true
      }
    })

    return blocked
  }
}
