declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_FACTORY_ADDRESS: `0x${string}`;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
