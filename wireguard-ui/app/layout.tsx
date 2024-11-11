import type { Metadata } from "next"
import Providers from "components/Providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Next-Guard",
  description: "Next-Guard Wireguard Manager",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
