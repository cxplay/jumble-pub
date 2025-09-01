import SearchBar, { TSearchBarRef } from '@/components/SearchBar'
import SearchResult from '@/components/SearchResult'
import PrimaryPageLayout from '@/layouts/PrimaryPageLayout'
import { usePrimaryPage } from '@/PageManager'
import { TSearchParams } from '@/types'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'

const SearchPage = forwardRef((_, ref) => {
  const { current, display } = usePrimaryPage()
  const [input, setInput] = useState('')
  const [searchParams, setSearchParams] = useState<TSearchParams | null>(null)
  const searchBarRef = useRef<TSearchBarRef>(null)
  const isActive = useMemo(() => current === 'search' && display, [current, display])

  useEffect(() => {
    if (isActive && !searchParams) {
      searchBarRef.current?.focus()
    }
  }, [isActive, searchParams])

  const onSearch = (params: TSearchParams | null) => {
    setSearchParams(params)
    if (params?.input) {
      setInput(params.input)
    }
  }

  return (
    <PrimaryPageLayout
      ref={ref}
      pageName="search"
      titlebar={
        <SearchBar ref={searchBarRef} onSearch={onSearch} input={input} setInput={setInput} />
      }
      displayScrollToTopButton
    >
      <SearchResult searchParams={searchParams} />
    </PrimaryPageLayout>
  )
})
SearchPage.displayName = 'SearchPage'
export default SearchPage
