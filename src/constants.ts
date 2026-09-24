const typedKeys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[]
const typedValues = <T extends object>(obj: T) => Object.values(obj) as T[keyof T][]

const SCREEN = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const

const VIEWPORTS = typedKeys(SCREEN)
const BREAKPOINTS = typedValues(SCREEN)

type Screen = typeof SCREEN
type Viewport = keyof typeof SCREEN
type Breakpoint = Screen[Viewport]

export {
  SCREEN,
  VIEWPORTS,
  BREAKPOINTS,
}

export type { Breakpoint, Viewport, Screen }
