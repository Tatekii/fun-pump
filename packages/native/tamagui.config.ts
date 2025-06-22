import { createTamagui } from '@tamagui/core'
import { defaultConfig } from '@tamagui/config/v4'

// you usually export this from a tamagui.config.ts file
export const tamaguiConfig = createTamagui(defaultConfig)

type CustomConfig = typeof tamaguiConfig

// make imports typed
declare module 'tamagui' {
  interface TamaguiCustomConfig extends CustomConfig {}
}
