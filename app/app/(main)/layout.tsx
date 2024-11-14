import Navigation from "@/components/navigation/navbar"
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="container mx-auto p-4">
      <Navigation />
      {children}
      <Toaster />
    </div>
  )
}
