import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { SCREEN, VIEWPORTS, type Viewport } from './constants'
import { createBreakpointHelpers, getClientViewport, getMinWidthMediaQuery, type BreakpointHelpers } from './helpers'

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

interface ViewportProviderProps {
  children: ReactNode
  ssrViewport: Viewport
}

const ViewportProvider = ({ children, ssrViewport }: ViewportProviderProps) => {
  const [viewport, setViewport] = useState(ssrViewport)

  useEffect(() => {
    const update = () => {
      const viewport = getClientViewport()
      setViewport(viewport)
    }

    // update viewport in case server viewport !== client viewport
    update()

    const mediaQueryLists = VIEWPORTS.map(key => window.matchMedia(getMinWidthMediaQuery(SCREEN[key])))
    mediaQueryLists.forEach(mql => mql.addEventListener('change', update))

    return () => {
      mediaQueryLists.forEach(mql => mql.removeEventListener('change', update))
    }
  }, [])

  return (
    <ViewportContext.Provider
      value={{
        viewport,
        ...createBreakpointHelpers(viewport, VIEWPORTS),
      }}
    >
      {children}
    </ViewportContext.Provider>
  )
}

export { useViewport, ViewportProvider }
export type { ViewportContextValue, ViewportProviderProps }
