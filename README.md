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

Breakpoints match Tailwind's defaults:

```ts
{ sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }
```

They're configurable via the `screens` prop on `ViewportProvider`, using the same shape (a map of breakpoint name to min-width in px):

```tsx
<ViewportProvider ssrViewport="lg" screens={{ sm: 480, md: 768, lg: 1024, xl: 1440 }}>
  <Navbar />
</ViewportProvider>
```

## SSR

`matchMedia` isn't available during server rendering, so `ViewportProvider` requires an `ssrViewport` prop with your best guess for the initial breakpoint (e.g. from a `User-Agent` sniff) to avoid a layout flash / hydration mismatch. The package exports a `getServerViewport(userAgent)` helper (backed by `ua-parser-js`) for this. How you obtain that `User-Agent` differs between Next.js's two routers.

### Pages Router

The request is available via `getInitialProps`'s `ctx.req`, so the `User-Agent` is read once per request in `_app.tsx` and passed down as a prop:

```tsx
// pages/_app.tsx
import { getServerViewport } from '@suki60/use-viewport'

MyApp.getInitialProps = async (appContext) => {
  const props = await App.getInitialProps(appContext)
  const userAgent =
    typeof window !== 'undefined'
      ? window.navigator.userAgent
      : appContext.ctx.req?.headers['user-agent']

  props.pageProps.ssrViewport = getServerViewport(userAgent ?? '')
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
import { getServerViewport } from '@suki60/use-viewport'
import { Providers } from './providers'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const userAgent = (await headers()).get('user-agent') ?? ''
  const ssrViewport = getServerViewport(userAgent)

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

import { ViewportProvider, getServerViewport } from '@suki60/use-viewport'

type Viewport = ReturnType<typeof getServerViewport>

export function Providers({ ssrViewport, children }: { ssrViewport: Viewport; children: React.ReactNode }) {
  return <ViewportProvider ssrViewport={ssrViewport}>{children}</ViewportProvider>
}
```

Once mounted client-side, the provider re-evaluates the real breakpoint via `matchMedia` and updates on viewport changes, in both routers.

## License

MIT
