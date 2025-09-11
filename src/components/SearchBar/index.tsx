import SearchInput from '@/components/SearchInput'
import { useSearchProfiles } from '@/hooks'
import { toNote } from '@/lib/link'
import { randomString } from '@/lib/random'
import { normalizeUrl } from '@/lib/url'
import { cn } from '@/lib/utils'
import { useSecondaryPage } from '@/PageManager'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import modalManager from '@/services/modal-manager.service'
import { TProfile, TSearchParams } from '@/types'
import { Hash, Notebook, Search, Server, UserRound } from 'lucide-react'
import { nip19 } from 'nostr-tools'
import {
  forwardRef,
  HTMLAttributes,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import UserItem, { UserItemSkeleton } from '../UserItem'

const SearchBar = forwardRef<
  TSearchBarRef,
  {
    input: string
    setInput: (input: string) => void
    onSearch: (params: TSearchParams | null) => void
  }
>(({ input, setInput, onSearch }, ref) => {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()
  const { isSmallScreen } = useScreenSize()
  const [debouncedInput, setDebouncedInput] = useState(input)
  const { profiles, isFetching: isFetchingProfiles } = useSearchProfiles(debouncedInput, 5)
  const [searching, setSearching] = useState(false)
  const [displayList, setDisplayList] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const normalizedUrl = useMemo(() => {
    if (['w', 'ws', 'ws:', 'ws:/', 'wss', 'wss:', 'wss:/'].includes(input)) {
      return undefined
    }
    try {
      return normalizeUrl(input)
    } catch {
      return undefined
    }
  }, [input])
  const id = useMemo(() => `search-${randomString()}`, [])

  useImperativeHandle(ref, () => ({
    focus: () => {
      searchInputRef.current?.focus()
    },
    blur: () => {
      searchInputRef.current?.blur()
    }
  }))

  useEffect(() => {
    if (!input) {
      onSearch(null)
    }
  }, [input])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInput(input)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [input])

  const blur = () => {
    setSearching(false)
    searchInputRef.current?.blur()
  }

  const list = useMemo(() => {
    const search = input.trim()
    if (!search) return null

    const updateSearch = (params: TSearchParams) => {
      blur()
      onSearch(params)
    }

    if (/^[0-9a-f]{64}$/.test(search)) {
      return (
        <>
          <NoteItem
            id={search}
            onClick={() => {
              blur()
              push(toNote(search))
            }}
          />
          <ProfileIdItem id={search} onClick={() => updateSearch({ type: 'profile', search })} />
        </>
      )
    }

    try {
      let id = search
      if (id.startsWith('nostr:')) {
        id = id.slice(6)
      }
      const { type } = nip19.decode(id)
      if (['nprofile', 'npub'].includes(type)) {
        return (
          <ProfileIdItem id={id} onClick={() => updateSearch({ type: 'profile', search: id })} />
        )
      }
      if (['nevent', 'naddr', 'note'].includes(type)) {
        return (
          <NoteItem
            id={id}
            onClick={() => {
              blur()
              push(toNote(id))
            }}
          />
        )
      }
    } catch {
      // ignore
    }

    return (
      <>
        <NormalItem search={search} onClick={() => updateSearch({ type: 'notes', search })} />
        <HashtagItem
          search={search}
          onClick={() => updateSearch({ type: 'hashtag', search, input: `#${search}` })}
        />
        {!!normalizedUrl && (
          <RelayItem
            url={normalizedUrl}
            onClick={() => updateSearch({ type: 'relay', search, input: normalizedUrl })}
          />
        )}
        {profiles.map((profile) => (
          <ProfileItem
            key={profile.pubkey}
            profile={profile}
            onClick={() =>
              updateSearch({ type: 'profile', search: profile.npub, input: profile.username })
            }
          />
        ))}
        {isFetchingProfiles && profiles.length < 5 && (
          <div className="px-2">
            <UserItemSkeleton hideFollowButton />
          </div>
        )}
        {profiles.length >= 5 && (
          <Item onClick={() => updateSearch({ type: 'profiles', search })}>
            <div className="font-semibold">{t('Show more...')}</div>
          </Item>
        )}
      </>
    )
  }, [input, debouncedInput, profiles])

  useEffect(() => {
    if (list) {
      modalManager.register(id, () => {
        setDisplayList(false)
      })
    } else {
      modalManager.unregister(id)
    }
  }, [list])

  useEffect(() => {
    setDisplayList(searching && !!input)
  }, [searching, input])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.stopPropagation()
        onSearch({ type: 'notes', search: input.trim() })
        blur()
      }
    },
    [input, onSearch]
  )

  return (
    <div className="relative flex gap-1 items-center h-full w-full">
      {displayList && list && (
        <>
          <div
            className={cn(
              'bg-surface-background rounded-b-lg shadow-lg z-50',
              isSmallScreen
                ? 'fixed top-12 inset-x-0'
                : 'absolute top-full -translate-y-1 inset-x-0 pt-1 '
            )}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="h-fit">{list}</div>
          </div>
          <div className="fixed inset-0 w-full h-full" onClick={() => blur()} />
        </>
      )}
      <SearchInput
        ref={searchInputRef}
        className={cn(
          'bg-surface-background shadow-inner h-full border-none',
          searching ? 'z-50' : ''
        )}
        placeholder={t('Type searching for people, keywords, or relays')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setSearching(true)}
        onBlur={() => setSearching(false)}
      />
    </div>
  )
})
SearchBar.displayName = 'SearchBar'
export default SearchBar

export type TSearchBarRef = {
  focus: () => void
  blur: () => void
}

function NormalItem({ search, onClick }: { search: string; onClick?: () => void }) {
  return (
    <Item onClick={onClick}>
      <Search className="text-muted-foreground" />
      <div className="font-semibold truncate">{search}</div>
    </Item>
  )
}

function HashtagItem({ search, onClick }: { search: string; onClick?: () => void }) {
  const hashtag = search.match(/[\p{L}\p{N}\p{M}]+/u)?.[0].toLowerCase()
  return (
    <Item onClick={onClick}>
      <Hash className="text-muted-foreground" />
      <div className="font-semibold truncate">{hashtag}</div>
    </Item>
  )
}

function NoteItem({ id, onClick }: { id: string; onClick?: () => void }) {
  return (
    <Item onClick={onClick}>
      <Notebook className="text-muted-foreground" />
      <div className="font-semibold truncate">{id}</div>
    </Item>
  )
}

function ProfileIdItem({ id, onClick }: { id: string; onClick?: () => void }) {
  return (
    <Item onClick={onClick}>
      <UserRound className="text-muted-foreground" />
      <div className="font-semibold truncate">{id}</div>
    </Item>
  )
}

function ProfileItem({ profile, onClick }: { profile: TProfile; onClick?: () => void }) {
  return (
    <div className="px-2 hover:bg-accent rounded-md cursor-pointer" onClick={onClick}>
      <UserItem pubkey={profile.pubkey} hideFollowButton className="pointer-events-none" />
    </div>
  )
}

function RelayItem({ url, onClick }: { url: string; onClick?: () => void }) {
  return (
    <Item onClick={onClick}>
      <Server className="text-muted-foreground" />
      <div className="font-semibold truncate">{url}</div>
    </Item>
  )
}

function Item({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex gap-2 items-center px-2 py-3 hover:bg-accent rounded-md cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
