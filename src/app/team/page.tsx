import * as React from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Avatar, Badge, Box, Button, Card, Flex, IconButton, Section, Text } from '@radix-ui/themes'
import clsx from 'clsx'

const efpTeam = [
  {
    ens: 'brantly.eth',
    address: '0x983110309620D911731Ac0932219af06091b6744',
    x: 'https://x.com/BrantlyMillegan',
    github: 'https://github.com/BrantlyMillegan',
    efp: ''
  },
  {
    ens: 'cory.eth',
    address: '0xBdB41BfF7E828E2DC2d15EB67257455db818F1DC',
    x: 'https://x.com/cory_eth',
    github: 'https://github.com/stoooops',
    efp: ''
  },
  {
    ens: 'esm.eth',
    address: '0xf4212614C7Fe0B3feef75057E88b2E77a7E23e83',
    x: 'https://x.com/awkroot',
    github: 'https://github.com/o-az',
    efp: ''
  }
] satisfies Array<TeamMember>

interface TeamMember {
  ens: string
  address: string
  x: string
  github: string
  efp: string
}

export default async function TeamPage() {
  return (
    <main className='mx-auto flex h-full min-h-full w-full flex-col items-center overflow-scroll mb-12 px-4 pt-6 text-center'>
      <Text size='7' className='font-bold' mb='5'>
        Team
      </Text>
      <Flex
        mx='auto'
        className='flex-col lg:flex-row lg:gap-y-0 gap-y-6 space-x-0 lg:space-x-12 align-middle justify-center items-center'
      >
        {efpTeam.map(({ ens, address, efp, x, github }) => (
          <div key={ens}>
            <TeamCard ens={ens} address={address} github={github} x={x} efp={efp} />
          </div>
        ))}
      </Flex>
    </main>
  )
}

function TeamCard(props: TeamMember) {
  const { ens, address, efp, x, github } = props
  return (
    <Flex direction='column'>
      <Flex mx='auto' className='bg-white/70 border-0 w-80 min-w-60 rounded-xl p-3'>
        <Flex direction='column' align='start' width='100%' height='100%' justify='center'>
          <Badge>#132</Badge>
          <Flex direction='column' justify='center' align='center' mx='auto' mt='3'>
            <Avatar
              src={`https://metadata.ens.domains/mainnet/avatar/${ens}`}
              radius='full'
              size='7'
              fallback=''
            />
            <Text size='5' className='font-bold' my='2'>
              {ens}
            </Text>
            <Badge color='blue' radius='full' className='px-3' size='1'>
              Follows you
            </Badge>
            <Flex gap='3' className='ml-12' my='3'>
              <Button
                my='1'
                size='2'
                className={clsx([
                  'text-black rounded-lg px-4 shaddow font-bold',
                  // follows ? 'bg-[#ffe065]' : 'bg-white'
                  'bg-[#ffe065]'
                ])}
              >
                <svg
                  width='15'
                  height='20'
                  viewBox='0 0 15 20'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M0 8.90625L5.35156 0L10.6641 8.90625L5.35156 12.1484L0 8.90625Z'
                    fill='#333333'
                  />
                  <path
                    d='M5.35156 13.125L0 9.88281L5.35156 17.4219L10.6641 9.88281L5.35156 13.125Z'
                    fill='#333333'
                  />
                  <path
                    d='M12.1875 13.9844H10.6641V16.25H8.55469V17.6562H10.6641V20H12.1875V17.6562H14.2578V16.25H12.1875V13.9844Z'
                    fill='#333333'
                  />
                </svg>
                Follow
              </Button>
              <IconButton
                className='bg-white text-black align-middle my-auto py-0 h-5 font-bold'
                radius='full'
              >
                <DotsHorizontalIcon />
              </IconButton>
            </Flex>
          </Flex>
          <Flex justify='center' mx='auto' className='text-center' gap='8'>
            <Box>
              <Text size='5' className='font-bold' as='div'>
                203
              </Text>
              <Text size='2' className='font-bold text-gray-400' as='div'>
                Following
              </Text>
            </Box>
            <Box>
              <Text size='5' className='font-bold' as='div'>
                1.1k
              </Text>
              <Text size='2' className='font-bold text-gray-400' as='div'>
                Followers
              </Text>
            </Box>
          </Flex>
          <Flex justify='center' mx='auto' mt='5' mb='4' className='text-center'>
            <Box>
              <Text size='5' className='font-bold' as='div'>
                #53
              </Text>
              <Text size='2' className='font-bold text-gray-400' as='div'>
                Leaderboard
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Flex>
      <Box mt='4' className='space-x-6'>
        <a href={x} target='_blank' rel='noreferrer' className='my-auto'>
          <button type='button' className='bg-white invert rounded-full p-2'>
            <img className='' src='/assets/x.svg' alt='x.com icon' />
          </button>
        </a>
        <a href={github} target='_blank' rel='noreferrer' className='my-auto'>
          <button type='button' className='bg-white invert rounded-full p-2'>
            <img src='/assets/github.svg' alt='github icon' />
          </button>
        </a>
      </Box>
    </Flex>
  )
}