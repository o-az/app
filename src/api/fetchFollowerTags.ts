import type { FollowingTagsResponse } from '#/types/requests'

export const nullFollowerTags = {
  token_id: 0,
  tags: [],
  tagCounts: [],
  taggedAddresses: []
}

export const fetchFollowerTags = async (addressOrName: string, list?: number | string) => {
  try {
    const url = list
      ? `https://development.api.ethfollow.xyz/api/v1/lists/${list}/taggedAs`
      : `https://development.api.ethfollow.xyz/api/v1/users/${addressOrName}/taggedAs`
    const response = await fetch(url, {
      cache: 'default',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })

    const data = (await response.json()) as FollowingTagsResponse
    return data
  } catch (err: unknown) {
    return nullFollowerTags
  }
}
