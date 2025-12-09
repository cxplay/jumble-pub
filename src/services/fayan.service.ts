import DataLoader from 'dataloader'

class FayanService {
  static instance: FayanService

  private userPercentileDataLoader = new DataLoader<string, number | null>(async (userIds) => {
    return await Promise.all(
      userIds.map(async (userId) => {
        try {
          const res = await fetch(`https://fayan.jumble.social/${userId}`)
          if (!res.ok) {
            if (res.status === 404) {
              return 0
            }
            return null
          }
          const data = await res.json()
          if (typeof data.percentile === 'number') {
            return data.percentile
          }
          return null
        } catch {
          return null
        }
      })
    )
  })

  constructor() {
    if (!FayanService.instance) {
      FayanService.instance = this
    }
    return FayanService.instance
  }

  // null means server error
  async fetchUserPercentile(userId: string): Promise<number | null> {
    return await this.userPercentileDataLoader.load(userId)
  }
}

const instance = new FayanService()
export default instance
