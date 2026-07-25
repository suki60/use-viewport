import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import {
  createBreakpointHelpers,
  defaultBreakpoints,
  getMinWidthMediaQuery,
  selectViewport,
  sortedKeys,
  type BreakpointHelpers,
  type Breakpoints,
} from './breakpoints'

export interface ViewportContextValue extends BreakpointHelpers {
  viewport: string | null
}

const ViewportContext = createContext<ViewportContextValue | undefined>(undefined)

export const useViewport = (): ViewportContextValue => {
  const context = useContext(ViewportContext)

  if (!context) {
    throw new Error('useViewport must be used within a ViewportProvider')
  }

  return context
}

export interface ViewportProviderProps {
  children: ReactNode
  /** Map of breakpoint name -> min-width in px. Defaults to MUI-style breakpoints. */
  breakpoints?: Breakpoints
  /** Breakpoint to use for the first server-rendered pass, before matchMedia can run client-side. */
  ssrViewport?: string | null
}

export const ViewportProvider = ({
  children,
  breakpoints = defaultBreakpoints,
  ssrViewport = null,
}: ViewportProviderProps) => {
  const keys = sortedKeys(breakpoints)

  const [viewport, setViewport] = useState<string | null>(() =>
    typeof window === 'undefined' ? ssrViewport : selectViewport(breakpoints, keys),
  )

  useEffect(() => {
    const update = () => setViewport(selectViewport(breakpoints, keys))
    update()

    const mediaQueryLists = keys.map((key) =>
      window.matchMedia(getMinWidthMediaQuery(breakpoints[key])),
    )

    mediaQueryLists.forEach((mql) => mql.addEventListener('change', update))

    return () => {
      mediaQueryLists.forEach((mql) => mql.removeEventListener('change', update))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(breakpoints)])

  const value: ViewportContextValue = {
    viewport,
    ...createBreakpointHelpers(viewport, keys),
  }

  return <ViewportContext.Provider value={value}>{children}</ViewportContext.Provider>
}
