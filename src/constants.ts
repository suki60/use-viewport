const DEFAULT_SCREENS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

type Screens = typeof DEFAULT_SCREENS
type Viewport = keyof Screens

export { DEFAULT_SCREENS }

export type { Viewport, Screens }
