import { http, fromHex, getContract, encodePacked, type Address, createPublicClient } from 'viem'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { track } from '@vercel/analytics/react'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useAccount, useChainId, useChains, useSwitchChain, useWalletClient } from 'wagmi'

import { Step } from '#/components/checkout/types'
import type { ChainWithDetails } from '#/lib/wagmi'
import { rpcProviders } from '#/lib/constants/rpc-providers'
import type { FollowingResponse } from '#/types/requests'
import { useEFPProfile } from '#/contexts/efp-profile-context'
import { useCart, type CartItem } from '#/contexts/cart-context'
import { efpListRecordsAbi, efpListRegistryAbi } from '#/lib/abi'
import { useMintEFP } from '../../../hooks/efp-actions/use-mint-efp'
import { DEFAULT_CHAIN, LIST_OP_LIMITS } from '#/lib/constants/chains'
import { coreEfpContracts, ListRecordContracts } from '#/lib/constants/contracts'
import { EFPActionType, useActions, type Action } from '#/contexts/actions-context'

const useCheckout = () => {
  const {
    actions,
    addActions,
    resetActions,
    moveToNextAction,
    currentActionIndex,
    executeActionByIndex
  } = useActions()
  const {
    lists,
    profile,
    refetchLists,
    selectedList,
    refetchStats,
    refetchProfile,
    fetchFreshLists,
    fetchFreshStats,
    refetchFollowing,
    fetchFreshProfile,
    setFetchFreshLists,
    setFetchFreshStats,
    refetchFollowingTags,
    setFetchFreshProfile,
    setIsRefetchingProfile,
    setSetNewListAsSelected,
    setIsRefetchingFollowing
  } = useEFPProfile()
  const chains = useChains()
  const router = useRouter()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { switchChain } = useSwitchChain()
  const initialCurrentChainId = useChainId()
  const { address: userAddress } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { cartItems, resetCart, setCartItems } = useCart()
  const { mint, nonce: mintNonce, listHasBeenMinted } = useMintEFP()

  const [currentChainId, setCurrentChainId] = useState(initialCurrentChainId)
  const getCurrentChain = useCallback(async () => {
    if (!walletClient) return

    const chainId = await walletClient.getChainId()
    setCurrentChainId(chainId)
  }, [walletClient])

  useEffect(() => {
    getCurrentChain()
  }, [walletClient])

  // get contract for selected chain to pull list storage location from
  const listRegistryContract = getContract({
    address: coreEfpContracts.EFPListRegistry,
    abi: efpListRegistryAbi,
    client: createPublicClient({
      chain: DEFAULT_CHAIN,
      transport: http(rpcProviders[DEFAULT_CHAIN.id])
    })
  })

  // Set step to initiating transactions if the user has already created their EFP list
  // Selecting the chain is only an option when creating a new EFP list to select List records location
  const [currentStep, setCurrentStep] = useState(
    selectedList ? Step.InitiateTransactions : Step.SelectChain
  )

  const [listOpsFinished, setListOpsFinished] = useState(false)
  const [selectedChainId, setSelectedChainId] = useState<number>(DEFAULT_CHAIN.id)
  const [setNewListAsPrimary, setSetNewListAsPrimary] = useState(!lists?.primary_list)
  const selectedChain = chains.find(chain => chain.id === selectedChainId) as ChainWithDetails

  const listOpTx = useCallback(
    async (items: CartItem[]) => {
      // const walletClient = await getWalletClient(config)

      // Get list storage location via token ID
      const listStorageLocation = selectedList
        ? await listRegistryContract.read.getListStorageLocation([BigInt(selectedList)])
        : null

      // Get slot, chain, and List Records contract from storage location or use options from the mint
      // const chainId = listStorageLocation
      //   ? fromHex(`0x${listStorageLocation.slice(64, 70)}`, 'number')
      //   : selectedChain?.id
      // const fetchedChain = chains.find(chain => chain.id === chainId)

      const nonce = listStorageLocation ? BigInt(`0x${listStorageLocation.slice(-64)}`) : mintNonce
      const ListRecordsContract = listStorageLocation
        ? (`0x${listStorageLocation.slice(70, 110)}` as Address)
        : selectedChainId
          ? (ListRecordContracts[selectedChainId] as Address)
          : coreEfpContracts.EFPListRecords

      // format list operations
      const operations = items.map(item => {
        const types = ['uint8', 'uint8', 'uint8', 'uint8', 'bytes']
        const data: (string | number)[] = [
          item.listOp.version,
          item.listOp.opcode,
          1,
          1,
          item.listOp.data
        ]

        return encodePacked(types, data)
      })

      // initiate "setMetadataValuesAndApplyListOps" transaction when creating a new EFP list
      // initiate "applyListOps" transaction when updating an existing EFP list
      const hash = await walletClient?.writeContract({
        address: ListRecordsContract,
        abi: efpListRecordsAbi,
        functionName: selectedList ? 'applyListOps' : 'setMetadataValuesAndApplyListOps',
        // @ts-ignore - diff data type handled
        args: selectedList
          ? [nonce, operations]
          : [nonce, [{ key: 'user', value: userAddress }], operations]
      })

      setListOpsFinished(true)

      if (hash) {
        setCartItems(cartItems.filter(item => !items.includes(item)))
        queryClient.invalidateQueries({ queryKey: ['following'] })
        queryClient.invalidateQueries({ queryKey: ['profile'] })
      }

      // return transaction hash to enable following transaction status in transaction details component
      return hash
    },
    [currentChainId, selectedChain, selectedList, walletClient]
  )

  const setActions = useCallback(async () => {
    // getting the chain ID where the list operations will be performed (selected chain ID if EFP list minted before)
    const chainId = selectedList
      ? fromHex(
          `0x${(
            await listRegistryContract.read.getListStorageLocation([BigInt(selectedList)])
          ).slice(64, 70)}`,
          'number'
        )
      : selectedChain?.id

    if (!chainId) return

    const splitListOps: CartItem[][] = []
    const splitSize = LIST_OP_LIMITS[chainId || DEFAULT_CHAIN.id] || 1000

    for (let i = 0; i < cartItems.length; i += splitSize) {
      splitListOps.push(cartItems.slice(i, i + splitSize))
    }

    const cartItemActions: Action[] = splitListOps.map((listOps, i) => ({
      id: `${EFPActionType.UpdateEFPList} ${i}`, // Unique identifier for the action
      type: EFPActionType.UpdateEFPList,
      label: `${listOps.length} ${listOps.length === 1 ? t('list op') : t('list ops')}`,
      chainId,
      execute: async () => await listOpTx(listOps),
      isPendingConfirmation: false
    }))

    const createEFPListAction: Action = {
      id: EFPActionType.CreateEFPList, // Unique identifier for the action
      type: EFPActionType.CreateEFPList,
      label: 'create list',
      chainId: DEFAULT_CHAIN.id, // Chain ID where main contracts are stored at
      execute: async () => await mint({ selectedChainId, setNewListAsPrimary }),
      isPendingConfirmation: false
    }

    // add Create list action if user doesn't have the EFP list yet
    const actionsToExecute = selectedList
      ? [...cartItemActions]
      : listOpsFinished
        ? [createEFPListAction]
        : [...cartItemActions, createEFPListAction]
    addActions(actionsToExecute)
  }, [selectedChainId, setNewListAsPrimary, listOpTx])

  useEffect(() => {
    setActions()
  }, [setActions])

  // Handle selecting a chain
  const handleChainClick = useCallback((chainId: number) => {
    setSelectedChainId(chainId)
  }, [])

  // Move to the next step
  const handleNextStep = useCallback(() => {
    if (!selectedChain) return
    setCurrentStep(Step.InitiateTransactions)
  }, [selectedChain])

  const getRequiredChain = useCallback(
    async (index: number) =>
      actions[index || 0]?.label === 'create list'
        ? DEFAULT_CHAIN.id
        : selectedList
          ? fromHex(
              `0x${(
                await listRegistryContract.read.getListStorageLocation([BigInt(selectedList)])
              ).slice(64, 70)}`,
              'number'
            )
          : selectedChainId,
    [actions, listRegistryContract, profile, selectedChainId]
  )

  // Handle action initiation
  const handleInitiateActions = useCallback(async () => {
    const chainId = await getRequiredChain(currentActionIndex)
    if (!chainId) return
    if (currentChainId !== chainId) {
      switchChain(
        { chainId },
        {
          onSuccess: () => setCurrentChainId(chainId)
        }
      )
      return
    }

    setCurrentStep(Step.TransactionStatus)
    executeActionByIndex(currentActionIndex || 0)
  }, [executeActionByIndex, currentChainId, getRequiredChain])

  const handleNextAction = useCallback(async () => {
    const chainId = await getRequiredChain(currentActionIndex + 1)
    if (!chainId) return
    if (currentChainId !== chainId) {
      switchChain(
        { chainId },
        {
          onSuccess: () => {
            setCurrentChainId(chainId)
            setCurrentStep(Step.InitiateTransactions)
          }
        }
      )
      return
    }

    const nextActionIndex = moveToNextAction()
    executeActionByIndex(nextActionIndex)
  }, [moveToNextAction, executeActionByIndex, getRequiredChain, currentChainId, currentActionIndex])

  const onFinish = useCallback(() => {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    if (regex.test(navigator.userAgent))
      track(`${listHasBeenMinted ? 'Mint' : 'Checkout'} - Mobile`)
    else track(`${listHasBeenMinted ? 'Mint' : 'Checkout'} - Desktop`)

    if (fetchFreshStats) refetchStats()
    else setFetchFreshStats(true)

    setIsRefetchingFollowing(true)
    queryClient.invalidateQueries({ queryKey: ['top8'] })
    queryClient.invalidateQueries({ queryKey: ['follow state'] })
    queryClient.invalidateQueries({ queryKey: ['list state'] })

    if (listHasBeenMinted || selectedList === undefined) {
      if (setNewListAsPrimary)
        queryClient.invalidateQueries({ queryKey: ['profile', userAddress, undefined] })

      setIsRefetchingProfile(true)
      setSetNewListAsSelected(true)

      if (fetchFreshLists) refetchLists()
      else setFetchFreshLists(true)

      if (fetchFreshProfile) refetchProfile()
      else setFetchFreshProfile(true)

      router.push('/loading')
      return
    }

    queryClient.setQueryData(
      ['following', userAddress, selectedList],
      (prev: {
        pages: FollowingResponse[][]
        pageParams: number[]
      }) => ({
        pages: prev?.pages?.slice(0, 1),
        pageParams: prev?.pageParams?.slice(0, 1)
      })
    )

    refetchFollowing()
    refetchFollowingTags()

    resetCart()
    resetActions()
    router.push(`/${selectedList ?? userAddress}`)
  }, [resetActions, resetCart, setNewListAsPrimary])

  // Claim POAP logic temporary for beta testing period
  const [claimPoapModalOpen, setClaimPoapModalOpen] = useState(false)
  const [poapLoading, setPoapLoading] = useState(false)
  const [poapLink, setPoapLink] = useState('')
  const openPoapModal = useCallback(async () => {
    if (listHasBeenMinted && lists?.lists?.length === 0 && !!profile?.ens.name) {
      setClaimPoapModalOpen(true)
      setPoapLoading(true)

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_EFP_API_URL}/users/${userAddress}/poap`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        const data = await res.json()
        if (data.link) {
          setPoapLink(data.link)
        }

        setPoapLoading(false)
      } catch (err: unknown) {
        return
      }
    }
  }, [listHasBeenMinted])

  return {
    chains,
    actions,
    onFinish,
    poapLink,
    currentStep,
    poapLoading,
    openPoapModal,
    setCurrentStep,
    selectedChain,
    selectedChainId,
    claimPoapModalOpen,
    setSelectedChainId,
    handleChainClick,
    handleNextStep,
    setClaimPoapModalOpen,
    handleInitiateActions,
    handleNextAction,
    setNewListAsPrimary,
    setSetNewListAsPrimary
  }
}

export default useCheckout
