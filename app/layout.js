export const metadata = {
  title: 'Kingshot Gear Gap Analyzer V2',
  description: 'PvP gear comparison, battle simulator, and cost calculator for Kingshot',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #06080d; color: #e2e8f0; font-family: 'Oxanium', sans-serif; min-height: 100vh; }
          input, select, button { font-family: 'Oxanium', sans-serif; }
          input[type="number"] { background: #0f1520; border: 1px solid #1e2840; border-radius: 6px; color: #e2e8f0; padding: 6px 10px; font-size: 13px; font-family: 'IBM Plex Mono', monospace; width: 100%; outline: none; }
          input[type="number"]:focus { border-color: #f59e0b; }
          select { background: #0f1520; border: 1px solid #1e2840; border-radius: 6px; color: #e2e8f0; padding: 6px 10px; font-size: 13px; width: 100%; outline: none; cursor: pointer; }
          select:focus { border-color: #f59e0b; }
          input[type="text"], input[type="password"], input[type="search"] { background: #0f1520; border: 1px solid #1e2840; border-radius: 6px; color: #e2e8f0; padding: 6px 10px; font-size: 13px; width: 100%; outline: none; }
          a { color: #f59e0b; }
        `}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
