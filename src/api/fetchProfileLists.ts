import type { ProfileListsResponse } from '#/types/requests'

export const fetchProfileLists = async (addressOrName: string) => {
  try {
    const response = await fetch(
      `https://development.api.ethfollow.xyz/api/v1/users/${addressOrName}/lists`,
      {
        cache: 'default',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    )

    const data = (await response.json()) as ProfileListsResponse
    return data
  } catch (err: unknown) {
    return {
      primary_list: null,
      lists: []
    } as ProfileListsResponse
  }
}
