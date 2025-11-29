"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if we have location and weather data
    const weatherData = sessionStorage.getItem("weatherData")
    const userLocation = sessionStorage.getItem("userLocation")

    if (!weatherData || !userLocation) {
      router.push("/location-permission")
    }
  }, [router])

 return (
  <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10 
    bg-gradient-to-b from-[#F5A623]/20 to-[#FFF2DF]">

    <div className="flex w-full max-w-sm flex-col items-center space-y-8 
      bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-[#F5E9DA]">

      {/* Welcome Heading */}
      <h1 className="text-4xl font-bold text-[#1B1B1B]">Welcome</h1>

      {/* Logo */}
      <div className="relative">
        <Image
          src="/disha-logo.png"
          alt="DISHA Logo"
          width={180}
          height={180}
          priority
          className="drop-shadow-md"
        />
      </div>

      {/* App Name */}
      <h2 className="text-3xl font-extrabold tracking-wide text-[#1B1B1B]">DISHA</h2>

      {/* Buttons */}
      <div className="flex w-full gap-4 mt-2">
        <Button
          asChild
          className="flex-1 py-3 rounded-lg text-white font-semibold 
          bg-gradient-to-r from-[#F5A623] to-[#D35400] 
          hover:opacity-90 transition-all shadow-md"
        >
          <Link href="/signin">Sign In</Link>
        </Button>

        <Button
          asChild
          className="flex-1 py-3 rounded-lg text-white font-semibold 
          bg-gradient-to-r from-[#F5A623] to-[#D35400] 
          hover:opacity-90 transition-all shadow-md"
        >
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>

      {/* Motivation Text */}
      <div className="text-center font-semibold text-[#1B1B1B] pt-2 leading-relaxed">
        <p>Stay informed</p>
        <p>Stay prepared</p>
        <p>
          Stay connected with <span className="text-[#F5A623] font-bold">DISHA</span>.
        </p>
        <p className="mt-2">Together, we can make a difference!</p>
      </div>
    </div>
  </main>
);
}