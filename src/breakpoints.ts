export type Breakpoints = Record<string, number>

export const defaultBreakpoints: Breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}

export const sortedKeys = (breakpoints: Breakpoints): string[] =>
  Object.keys(breakpoints).sort((a, b) => breakpoints[a] - breakpoints[b])

export const getMinWidthMediaQuery = (width: number): string => `(min-width: ${width}px)`

export interface BreakpointHelpers {
  is: (breakpoint: string) => boolean
  up: (breakpoint: string) => boolean
  down: (breakpoint: string) => boolean
}

export const createBreakpointHelpers = (
  selectedViewport: string | null,
  keys: string[],
): BreakpointHelpers => {
  const is = (breakpoint: string): boolean => selectedViewport === breakpoint

  const up = (breakpoint: string): boolean => {
    const breakpointIndex = keys.indexOf(breakpoint)
    return breakpointIndex !== -1 && keys.slice(breakpointIndex).includes(selectedViewport ?? '')
  }

  const down = (breakpoint: string): boolean => {
    const breakpointIndex = keys.indexOf(breakpoint)
    return breakpointIndex !== -1 && keys.slice(0, breakpointIndex + 1).includes(selectedViewport ?? '')
  }

  return { is, up, down }
}

export const selectViewport = (breakpoints: Breakpoints, keys: string[]): string | null => {
  let selected: string | null = null

  for (const key of keys) {
    if (window.matchMedia(getMinWidthMediaQuery(breakpoints[key])).matches) {
      selected = key
    }
  }

  return selected
}
