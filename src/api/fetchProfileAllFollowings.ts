import type { Address } from 'viem'

export const fetchProfileAllFollowings = async (list: number) => {
  try {
    const response = await fetch(
      `https://development.api.ethfollow.xyz/api/v1/lists/${list}/allFollowingAddresses`,
      {
        cache: 'default',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    )

    const data = (await response.json()) as Address[]
    return data.map(addr => addr.toLowerCase()) as Address[]
  } catch (err: unknown) {
    return [] as Address[]
  }
}
