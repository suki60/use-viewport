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
    <ViewportProvider>
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

- `viewport` — the current breakpoint key (e.g. `'md'`), or `null` before the first client render if no `ssrViewport` was provided.
- `is(breakpoint)` — true if the current breakpoint exactly matches.
- `up(breakpoint)` — true if the current breakpoint is at or above the given one.
- `down(breakpoint)` — true if the current breakpoint is at or below the given one.

`useViewport` throws if called outside a `ViewportProvider`.

## Custom breakpoints

By default, breakpoints match MUI's:

```ts
{ xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 }
```

Override them with any `{ [name]: minWidthPx }` map:

```tsx
<ViewportProvider breakpoints={{ mobile: 0, tablet: 768, desktop: 1280 }}>
  <App />
</ViewportProvider>
```

Breakpoint order is inferred from the min-width values, not object key order.

## SSR

`matchMedia` isn't available during server rendering, so pass `ssrViewport` with your best guess for the initial breakpoint (e.g. from a `User-Agent` sniff) to avoid a layout flash / hydration mismatch:

```tsx
// pages/_app.tsx (Next.js Pages Router example)
import UAParser from 'ua-parser-js'

const getSSRViewport = (userAgent?: string) => {
  const { device } = UAParser(userAgent)
  if (device.type === 'mobile') return 'xs'
  if (device.type === 'tablet') return 'sm'
  return 'lg'
}

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

Once mounted client-side, the provider re-evaluates the real breakpoint via `matchMedia` and updates on viewport changes.

## License

MIT
