import { simplifyUrl } from '@/lib/url'
import dayjs from 'dayjs'
import { kinds } from 'nostr-tools'
import { z } from 'zod'
import client from './client.service'
import storage from './local-storage.service'

class MediaUploadService {
  static instance: MediaUploadService

  private service: string = storage.getMediaUploadService()
  private serviceUploadUrlMap = new Map<string, string | undefined>()
  private imetaTagMap = new Map<string, string[]>()

  constructor() {
    if (!MediaUploadService.instance) {
      MediaUploadService.instance = this
    }
    return MediaUploadService.instance
  }

  getService() {
    return this.service
  }

  setService(service: string) {
    this.service = service
    storage.setMediaUploadService(service)
  }

  async upload(file: File) {
    let uploadUrl = this.serviceUploadUrlMap.get(this.service)
    if (!uploadUrl) {
      const response = await fetch(`${this.service}/.well-known/nostr/nip96.json`)
      if (!response.ok) {
        throw new Error(
          `${simplifyUrl(this.service)} does not work, please try another service in your settings`
        )
      }
      const data = await response.json()
      uploadUrl = data?.api_url
      if (!uploadUrl) {
        throw new Error(
          `${simplifyUrl(this.service)} does not work, please try another service in your settings`
        )
      }
      this.serviceUploadUrlMap.set(this.service, uploadUrl)
    }

    const formData = new FormData()
    formData.append('file', file)

    const auth = await this.signHttpAuth(uploadUrl, 'POST')
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: auth
      }
    })

    if (!response.ok) {
      throw new Error(response.status.toString() + ' ' + response.statusText)
    }

    const data = await response.json()
    const tags = z.array(z.array(z.string())).parse(data.nip94_event?.tags ?? [])
    const url = tags.find(([tagName]) => tagName === 'url')?.[1]
    if (url) {
      this.imetaTagMap.set(url, ['imeta', ...tags.map(([n, v]) => `${n} ${v}`)])
      return { url: url, tags }
    } else {
      throw new Error('No url found')
    }
  }

  getImetaTagByUrl(url: string) {
    return this.imetaTagMap.get(url)
  }

  async signHttpAuth(url: string, method: string) {
    if (!client.signer) {
      throw new Error('No signer found')
    }
    const event = await client.signer.signEvent({
      content: '',
      kind: kinds.HTTPAuth,
      created_at: dayjs().unix(),
      tags: [
        ['u', url],
        ['method', method]
      ]
    })
    return 'Nostr ' + btoa(JSON.stringify(event))
  }
}

const instance = new MediaUploadService()
export default instance
