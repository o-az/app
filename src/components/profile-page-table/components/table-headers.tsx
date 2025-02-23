import Image from 'next/image'
import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { IoClose } from 'react-icons/io5'
import { useTranslation } from 'react-i18next'
import { IoIosArrowDown } from 'react-icons/io'
import { useClickAway } from '@uidotdev/usehooks'

import { cn } from '#/lib/utilities'
import { formatNumber } from '#/utils/format/format-number'
import LoadingCell from '#/components/loaders/loading-cell'
import type { ProfileTableTitleType } from '#/types/common'
import GreenCheck from 'public/assets/icons/check-green.svg'
import type { FollowSortType, TagCountType } from '#/types/requests'
import { QUERY_BLOCK_TAGS } from '#/components/blocked-muted/hooks/use-blocked-muted'
import { BLOCKED_MUTED_TABS, BLOCKED_MUTED_TAGS, SORT_OPTIONS } from '#/lib/constants'

interface TableHeaderProps {
  title: ProfileTableTitleType
  search: string
  showTags: boolean
  setShowTags: (input: boolean) => void
  setSearch: (input: string) => void
  allTags?: TagCountType[]
  tagsLoading?: boolean
  selectedTags?: string[]
  sort: FollowSortType
  setSort: (option: FollowSortType) => void
  toggleSelectedTags: (title: ProfileTableTitleType, tag: string) => void
  isShowingBlocked?: boolean
  setActiveTab?: (tab: ProfileTableTitleType) => void
}

const TableHeader: React.FC<TableHeaderProps> = ({
  title,
  showTags,
  setShowTags,
  search,
  setSearch,
  allTags,
  tagsLoading,
  selectedTags,
  toggleSelectedTags,
  sort,
  setSort,
  isShowingBlocked,
  setActiveTab
}) => {
  const [showSort, setShowSort] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const clickAwaySortRef = useClickAway<HTMLDivElement>(() => {
    setShowSort(false)
  })
  const clickAwaySearchRef = useClickAway<HTMLDivElement>(() => {
    setShowSearch(false)
  })

  const { t } = useTranslation()

  const displayedTags = allTags?.filter(tag =>
    isShowingBlocked ? true : !QUERY_BLOCK_TAGS.includes(tag.tag)
  )
  const tagsEmpty = !tagsLoading && (!displayedTags || displayedTags.length === 0)

  return (
    <div className='flex flex-col gap-4 px-4 z-40 sm:px-2 w-full'>
      <div className='flex justify-between w-full'>
        <div className='flex gap-3 flex-wrap justify-between sm:justify-start sm:flex-nowrap items-center w-full'>
          <div className='flex gap-3 w-full sm:w-fit items-center'>
            {BLOCKED_MUTED_TABS.includes(title) ? (
              <h2 className='capitalize text-lg sm:text-3xl hidden xl:block font-bold text-nowrap'>
                {t(title)}
              </h2>
            ) : (
              <div className='flex items-center bg-grey w-full sm:w-fit relative rounded-xl'>
                <div
                  className={cn(
                    'w-1/2 sm:w-32 h-full absolute transition-all duration-200 border-[3px] border-grey bg-neutral rounded-xl',
                    title === 'following' ? 'left-0' : 'left-1/2 sm:left-32'
                  )}
                />
                <p
                  className={cn(
                    'w-1/2 sm:w-32 font-bold py-2 text-lg text-center text-text z-10 cursor-pointer hover:scale-110 transition-transform',
                    title === 'following' ? 'text-text' : 'text-text/60'
                  )}
                  onClick={() => setActiveTab?.('following')}
                >
                  {t('following')}
                </p>
                <p
                  className={cn(
                    'w-1/2 sm:w-32 font-bold py-2 text-lg text-center text-text z-10 cursor-pointer hover:scale-110 transition-transform',
                    title === 'followers' ? 'text-text' : 'text-text/60'
                  )}
                  onClick={() => setActiveTab?.('followers')}
                >
                  {t('followers')}
                </p>
              </div>
            )}
          </div>
          {!BLOCKED_MUTED_TABS.includes(title) && (
            <div ref={clickAwaySearchRef} className='relative flex gap-1 sm:gap-3 z-50'>
              <div
                className={cn(
                  'cursor-pointer max-w-40 flex items-center h-6 transition-all gap-2 hover:opacity-75',
                  search ? 'hover:scale-[1.15]' : 'hover:scale-125'
                )}
                onClick={() => setShowSearch(!showSearch)}
              >
                <FiSearch className='opacity-50 text-2xl hover:opacity-100 transition-opacity' />
                <p className='font-medium text-sm truncate hidden sm:block md:hidden lg:block xl:hidden 2xl:block'>
                  {search}
                </p>
              </div>
              {search && (
                <IoClose
                  onClick={() => {
                    setSearch('')
                    setShowSearch(false)
                  }}
                  className='opacity-50 text-xl hover:opacity-60 hover:scale-125 p-0.5 mt-0.5 text-darkGrey bg-zinc-300 cursor-pointer rounded-full transition-all'
                />
              )}
              {showSearch && (
                <div className='absolute glass-card flex items-center border-[3px] bg-neutral border-grey -top-4 gap-1 left-0 xl:-left-10 w-64 h-fit rounded-xl shadow-md'>
                  <input
                    type='text'
                    spellCheck={false}
                    autoFocus={true}
                    autoComplete='off'
                    placeholder={t('search placeholder')}
                    onChange={e => {
                      setSearch(e.target.value.toLowerCase().trim())
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === 'Escape') {
                        e.preventDefault()
                        setShowSearch(false)
                      }
                    }}
                    value={search}
                    className='font-medium py-3 block w-full rounded-lg border-0 border-transparent pl-3 pr-10 sm:text-sm bg-neutral/50'
                  />
                  <div
                    className='pointer-events-none absolute inset-y-0 right-0 flex items-center pl-3'
                    aria-hidden='true'
                  >
                    <FiSearch
                      className='mr-3 text-xl dark:text-white/90 text-zinc-400'
                      aria-hidden='true'
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <div className='flex sm:w-full justify-end gap-4'>
            <div
              onClick={() => setShowTags(!showTags)}
              className='cursor-pointer flex items-center hover:scale-110 transition-transform gap-1'
            >
              <p className='text-sm font-bold'>{t('tags')}</p>
              <IoIosArrowDown className={`transition-transform ${showTags ? 'rotate-180' : ''}`} />
            </div>
            <div
              ref={clickAwaySortRef}
              onClick={() => setShowSort(!showSort)}
              className='cursor-pointer flex relative items-center gap-1'
            >
              <div className='flex gap-1 hover:scale-110 items-center transition-transform'>
                <p className='text-sm capitalize font-bold'>{t(sort)}</p>
                <IoIosArrowDown
                  className={`transition-transform ${showSort ? 'rotate-180' : ''}`}
                />
              </div>
              {showSort && (
                <div className='bg-neutral glass-card p-1 gap-1 z-50 shadow-md border-[3px] rounded-md border-grey absolute top-[120%] flex flex-col items-center -right-2'>
                  {SORT_OPTIONS.map(option => (
                    <div
                      className='font-bold capitalize w-full text-nowrap relative rounded-md hover:bg-navItem transition-colors p-3 pl-8'
                      key={option}
                      onClick={() => setSort(option)}
                    >
                      {sort === option && (
                        <Image
                          src={GreenCheck}
                          alt='List selected'
                          width={16}
                          className='absolute left-2 top-[17px]'
                        />
                      )}
                      <p>{t(option)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showTags && tagsEmpty && (
        <p className='text-center w-full font-bold text-text/40 italic'>{t('no tags')}</p>
      )}
      {showTags && (
        <div className='flex flex-wrap w-full gap-2'>
          {tagsLoading
            ? new Array(4)
                .fill(1)
                .map((_, i) => <LoadingCell key={i} className='w-20 h-7 md:h-9 rounded-full' />)
            : displayedTags?.map((tag, i) => (
                <button
                  key={tag.tag + i}
                  className={`text-sm flex gap-1.5 px-4 py-2 font-bold items-center max-w-[33%] hover:scale-110 transition-transform ${
                    selectedTags?.includes(tag.tag)
                      ? 'text-darkGrey bg-zinc-100 shadow-inner shadow-black/10'
                      : 'text-zinc-500 bg-zinc-300/80'
                  } rounded-full`}
                  name={tag.tag.toLowerCase()}
                  onClick={() => toggleSelectedTags(title, tag.tag)}
                >
                  <p className='max-w-[95%] truncate'>
                    {BLOCKED_MUTED_TAGS.includes(tag.tag) ? t(tag.tag) : tag.tag}
                  </p>
                  <p className='text-darkGrey/50'>{formatNumber(tag.count)}</p>
                </button>
              ))}
        </div>
      )}
    </div>
  )
}

export default TableHeader
