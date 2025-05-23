import { Content } from '@tiptap/react'
import { Event } from 'nostr-tools'

class PostContentCacheService {
  static instance: PostContentCacheService

  private normalPostCache: Map<string, Content> = new Map()

  constructor() {
    if (!PostContentCacheService.instance) {
      PostContentCacheService.instance = this
    }
    return PostContentCacheService.instance
  }

  getPostCache({
    defaultContent,
    parentEvent
  }: { defaultContent?: string; parentEvent?: Event } = {}) {
    return (
      this.normalPostCache.get(this.generateCacheKey(defaultContent, parentEvent)) ?? defaultContent
    )
  }

  setPostCache(
    { defaultContent, parentEvent }: { defaultContent?: string; parentEvent?: Event },
    content: Content
  ) {
    this.normalPostCache.set(this.generateCacheKey(defaultContent, parentEvent), content)
  }

  clearPostCache({
    defaultContent,
    parentEvent
  }: {
    defaultContent?: string
    parentEvent?: Event
  }) {
    this.normalPostCache.delete(this.generateCacheKey(defaultContent, parentEvent))
  }

  generateCacheKey(defaultContent: string = '', parentEvent?: Event): string {
    return parentEvent ? parentEvent.id : defaultContent
  }
}

const instance = new PostContentCacheService()
export default instance
