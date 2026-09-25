import { UAParser } from 'ua-parser-js'

import { type Screens, type Viewport } from './constants'

type MinWidthMediaQuery = `(min-width: ${number}px)`
type BreakpointHelpers = ReturnType<typeof createBreakpointHelpers>

const typedKeys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[]

const getMinWidthMediaQuery = (width: number): MinWidthMediaQuery => `(min-width: ${width}px)`

const createBreakpointHelpers = (selectedViewport: Viewport, keys: string[]) => {
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

const getServerViewport = (userAgent: string): Viewport => {
  const ua = UAParser(userAgent)
  const deviceType = ua.device.type

  if (deviceType === 'mobile') return 'sm'
  if (deviceType === 'tablet') return 'md'
  return 'lg'
}

const getClientViewport = (screens: Screens): Viewport => {
  const viewports = typedKeys(screens)
  const viewport = viewports.reverse().find((v) => window.matchMedia(getMinWidthMediaQuery(screens[v])).matches)
  return viewport ?? 'sm'
}

export { getMinWidthMediaQuery, createBreakpointHelpers, getServerViewport, getClientViewport, typedKeys }
export type { BreakpointHelpers }
