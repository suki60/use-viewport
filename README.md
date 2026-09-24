# @suki60/use-viewport

A lightweight React context and hook for responsive breakpoint detection, with SSR support. Provides MUI-style `up`/`down`/`is` helpers driven by `matchMedia`.

## Install

```bash
npm install @suki60/use-viewport
```

React `>=16.8` is required as a peer dependency.

## Usage

```tsx
import { ViewportProvider, useViewport } from '@suki60/use-viewport'

function App() {
  return (
    <ViewportProvider ssrViewport="lg">
      <Navbar />
    </ViewportProvider>
  )
}

function Navbar() {
  const { up } = useViewport()

  return up('md') ? <DesktopNav /> : <MobileNav />
}
```

`useViewport()` returns:

- `viewport` — the current breakpoint key (e.g. `'md'`).
- `is(breakpoint)` — true if the current breakpoint exactly matches.
- `up(breakpoint)` — true if the current breakpoint is at or above the given one.
- `down(breakpoint)` — true if the current breakpoint is at or below the given one.

`useViewport` throws if called outside a `ViewportProvider`.

## Breakpoints

Breakpoints match MUI's and are currently fixed (not configurable):

```ts
{ xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 }
```

## SSR

`matchMedia` isn't available during server rendering, so `ViewportProvider` requires an `ssrViewport` prop with your best guess for the initial breakpoint (e.g. from a `User-Agent` sniff) to avoid a layout flash / hydration mismatch. How you obtain that `User-Agent` differs between Next.js's two routers.

Shared helper for both examples below:

```ts
// getSSRViewport.ts
import UAParser from 'ua-parser-js'

export const getSSRViewport = (userAgent?: string) => {
  const { device } = UAParser(userAgent)
  if (device.type === 'mobile') return 'xs'
  if (device.type === 'tablet') return 'sm'
  return 'lg'
}
```

### Pages Router

The request is available via `getInitialProps`'s `ctx.req`, so the `User-Agent` is read once per request in `_app.tsx` and passed down as a prop:

```tsx
// pages/_app.tsx
import { getSSRViewport } from '../getSSRViewport'

MyApp.getInitialProps = async (appContext) => {
  const props = await App.getInitialProps(appContext)
  const userAgent =
    typeof window !== 'undefined'
      ? window.navigator.userAgent
      : appContext.ctx.req?.headers['user-agent']

  props.pageProps.ssrViewport = getSSRViewport(userAgent)
  return props
}

const MyApp = ({ Component, pageProps }) => (
  <ViewportProvider ssrViewport={pageProps.ssrViewport}>
    <Component {...pageProps} />
  </ViewportProvider>
)
```

### App Router

There's no `getInitialProps`/`req` here — instead, read the incoming `User-Agent` header with `next/headers` in a Server Component (typically the root `layout.tsx`) and pass it down to a small Client Component wrapper, since `ViewportProvider` itself uses hooks and must run on the client:

```tsx
// app/layout.tsx (Server Component)
import { headers } from 'next/headers'
import { getSSRViewport } from '../getSSRViewport'
import { Providers } from './providers'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const userAgent = (await headers()).get('user-agent') ?? undefined
  const ssrViewport = getSSRViewport(userAgent)

  return (
    <html lang="en">
      <body>
        <Providers ssrViewport={ssrViewport}>{children}</Providers>
      </body>
    </html>
  )
}
```

```tsx
// app/providers.tsx
'use client'

import { ViewportProvider } from '@suki60/use-viewport'
import type { Viewport } from '@suki60/use-viewport'

export function Providers({ ssrViewport, children }: { ssrViewport: Viewport; children: React.ReactNode }) {
  return <ViewportProvider ssrViewport={ssrViewport}>{children}</ViewportProvider>
}
```

Once mounted client-side, the provider re-evaluates the real breakpoint via `matchMedia` and updates on viewport changes, in both routers.

## License

MIT
