import DataLoader from 'dataloader'

export interface TrustScoreData {
  percentile: number
}

class TrustScoreService {
  static instance: TrustScoreService

  private trustScoreDataLoader = new DataLoader<string, TrustScoreData | null>(async (userIds) => {
    return await Promise.all(
      userIds.map(async (userId) => {
        try {
          const res = await fetch(`https://fayan.jumble.social/${userId}`)
          if (!res.ok) {
            if (res.status === 404) {
              return { percentile: 0 }
            }
            return null
          }
          const data = await res.json()
          if (typeof data.percentile === 'number') {
            return { percentile: data.percentile }
          }
          return null
        } catch {
          return null
        }
      })
    )
  })

  constructor() {
    if (!TrustScoreService.instance) {
      TrustScoreService.instance = this
    }
    return TrustScoreService.instance
  }

  async fetchTrustScore(userId: string): Promise<TrustScoreData | null> {
    return await this.trustScoreDataLoader.load(userId)
  }
}

const instance = new TrustScoreService()

export default instance
