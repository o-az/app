interface EnvironmentVariables {
  readonly NODE_ENV: 'development' | 'production' | 'test'
  readonly WALLET_CONNECT_PROJECT_ID: string
  readonly NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: string
  readonly ALCHEMY_ID: string
  readonly NEXT_PUBLIC_ALCHEMY_ID: string
  readonly LLAMAFOLIO_ID: string
  readonly NEXT_PUBLIC_LLAMAFOLIO_ID: string
  readonly INFURA_ID: string
  readonly NEXT_PUBLIC_INFURA_ID: string
}

declare module NodeJS {
  interface ProcessEnv extends EnvironmentVariables {}
}