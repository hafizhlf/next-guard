import Navigation from "@/components/navigation/navbar";
import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Next-Guard",
  description: "Next-Guard Wireguard Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container mx-auto p-4">
      <Navigation />
      {children}
    </div>
  );
}
