"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard");
  })

  return null;
}
