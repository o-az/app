import { formatQueryParams } from '#/utils/formatQueryParams'
import type { InfiniteLeaderboardQueryProps, LeaderboardResponse } from '#/types/requests'

export const fetchleaderboard = async ({
  limit,
  search,
  filter,
  pageParam,
  direction
}: InfiniteLeaderboardQueryProps) => {
  try {
    const queryParams = formatQueryParams({
      limit,
      offset: pageParam * limit,
      sort: filter,
      direction
    })

    const url =
      search && search.length > 2
        ? `$https://development.api.ethfollow.xyz//leaderboard/search?term=${search}`
        : `$https://development.api.ethfollow.xyz//leaderboard/ranked?${queryParams}`
    const response = await fetch(url, {
      cache: 'default',
      headers: {
        'Content-Type': 'application/json',
        cors: 'no-cors'
      }
    })

    const data = (await response.json()) as LeaderboardResponse
    return {
      results: data ?? [],
      nextPageParam: pageParam + 1,
      prevPageParam: pageParam > 0 ? pageParam - 1 : 0
    }
  } catch (err: unknown) {
    return {
      results: {
        last_updated: 0,
        results: []
      },
      nextPageParam: pageParam + 1,
      prevPageParam: pageParam > 0 ? pageParam - 1 : 0
    }
  }
}
