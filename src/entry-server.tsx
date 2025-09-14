import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'

export function render(url: string) {
  const helmetContext: { helmet?: any } = {}
  
  return new Promise<{ html: string; head: string }>((resolve, reject) => {
    let html = ''
    const stream = renderToPipeableStream(
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HelmetProvider>,
      {
        onShellReady() {
          const helmet = helmetContext.helmet
          const head = [helmet?.title?.toString() ?? '', helmet?.meta?.toString() ?? '', helmet?.link?.toString() ?? ''].join('\n')
          resolve({ html, head })
        },
        onShellError(error) {
          reject(error)
        },
        onError(error) {
          console.error('SSR Error:', error)
        }
      }
    )
  })
}

