import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { DEFAULT_SCREENS, type Screens, type Viewport } from './constants'
import { createBreakpointHelpers, getClientViewport, getMinWidthMediaQuery, typedKeys, type BreakpointHelpers } from './helpers'

type ViewportContextValue = {
  viewport: Viewport
} & BreakpointHelpers

const ViewportContext = createContext<ViewportContextValue | undefined>(undefined)

const useViewport = (): ViewportContextValue => {
  const context = useContext(ViewportContext)

  if (!context) {
    throw new Error('useViewport must be used within a ViewportProvider')
  }

  return context
}

type ViewportProviderProps = {
  children: ReactNode
  ssrViewport: Viewport
  screens?: Screens
}

const ViewportProvider = ({ children, ssrViewport, screens = DEFAULT_SCREENS }: ViewportProviderProps) => {
  const [viewport, setViewport] = useState(ssrViewport)
  const viewports = typedKeys(screens)

  useEffect(() => {
    const update = () => {
      const viewport = getClientViewport(screens)
      setViewport(viewport)
    }

    // update viewport in case server viewport !== client viewport
    update()

    const mediaQueryLists = viewports.map(key => window.matchMedia(getMinWidthMediaQuery(screens[key])))
    mediaQueryLists.forEach(mql => mql.addEventListener('change', update))

    return () => {
      mediaQueryLists.forEach(mql => mql.removeEventListener('change', update))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ViewportContext.Provider
      value={{
        viewport,
        ...createBreakpointHelpers(viewport, viewports),
      }}
    >
      {children}
    </ViewportContext.Provider>
  )
}

export { useViewport, ViewportProvider }
export type { ViewportContextValue, ViewportProviderProps }
