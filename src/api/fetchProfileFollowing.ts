import { formatQueryParams } from '#/utils/formatQueryParams'
import type { FollowingResponse, InfiniteProfileQueryProps } from '#/types/requests'

export const fetchProfileFollowing = async ({
  addressOrName,
  list,
  limit,
  sort,
  tags,
  pageParam,
  search,
  allResults
}: InfiniteProfileQueryProps) => {
  try {
    const queryParams = formatQueryParams({
      limit,
      offset: pageParam * limit,
      tags,
      term: search,
      sort: sort
        ? {
            'earliest first': 'earliest',
            'latest first': 'latest',
            'follower count': 'followers'
          }[sort]
        : undefined
    })

    const url =
      list !== undefined
        ? `https://development.api.ethfollow.xyz/api/v1/lists/${list}/${
            allResults
              ? 'allFollowing'
              : search && search?.length >= 3
                ? 'searchFollowing'
                : 'following'
          }?${queryParams}`
        : `https://development.api.ethfollow.xyz/api/v1/users/${addressOrName}/${
            allResults
              ? 'allFollowing'
              : search && search?.length >= 3
                ? 'searchFollowing'
                : 'following'
          }?${queryParams}`

    const response = await fetch(url, {
      cache: 'default',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })

    const data = (await response.json()).following as FollowingResponse[]
    return {
      following: data ?? [],
      nextPageParam: pageParam + 1
    }
  } catch (err: unknown) {
    return {
      following: [],
      nextPageParam: pageParam + 1
    }
  }
}
