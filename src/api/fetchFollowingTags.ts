import type { FollowingTagsResponse } from '#/types/requests'

export const nullFollowingTags = {
  token_id: 0,
  tags: [],
  tagCounts: [],
  taggedAddresses: []
}

export const fetchFollowingTags = async (addressOrName: string, list?: number | string) => {
  try {
    const url =
      list !== undefined
        ? `$https://development.api.ethfollow.xyz//lists/${list}/tags`
        : `$https://development.api.ethfollow.xyz//users/${addressOrName}/tags`
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
    return nullFollowingTags
  }
}
