import { isElectron } from './platform'

export function getNostrConnectClientMetadata(): { name: string; url?: string } {
  if (isElectron()) {
    return {
      name: 'Nostr!moe Desktop',
      url: 'https://nostr.moe'
    }
  }

  return {
    name: document.location.host,
    url: document.location.origin
  }
}
