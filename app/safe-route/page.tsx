"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { MapPin } from "lucide-react"

export default function SafeRoutePage() {
  const [startLocation, setStartLocation] = useState("")
  const [destination, setDestination] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const getCurrentLocation = () => {
    setIsLoading(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
       async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            const data = await response.json()

            if (data.display_name) {
              setStartLocation(data.display_name)
            } else {
              setStartLocation(`${latitude},${longitude}`)
              toast.warning("Could not fetch location name, using coordinates instead.")
            }
          } catch (error) {
            console.error("Error fetching location name:", error)
            toast.error("Failed to get location name. Please enter manually.")
            setStartLocation(`${latitude},${longitude}`)
          }

          setIsLoading(false)
        },
      )
    } else {
      toast.error("Geolocation is not supported by your browser")
      setIsLoading(false)
    }
  }

  const handleOpenGoogleMaps = () => {
    if (!startLocation || !destination) {
      toast.error("Please enter both start location and destination")
      return
    }

    // Store the current URL to return to
    sessionStorage.setItem("returnToSafeRoute", "true")

    const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(startLocation)}/${encodeURIComponent(
      destination,
    )}`
    window.open(mapsUrl, "_blank")
  }


  if (typeof window !== "undefined") {
    const shouldShowWelcome = sessionStorage.getItem("returnToSafeRoute")
    if (shouldShowWelcome) {
      sessionStorage.removeItem("returnToSafeRoute")
      toast.success("Welcome back to DISHA Safe Route")
    }
  }

 return (
  <main className="flex min-h-screen flex-col p-4 bg-[#FFF2DF]">
    
    {/* Header */}
    <div className="flex items-center gap-2 mb-6">
      <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/70 backdrop-blur-md shadow-md hover:bg-white"
            >
        <Link href="/dashboard">
          <ArrowLeft className="h-6 w-6 text-[#000000]" />
        </Link>
      </Button>
      <h1 className="text-2xl font-bold text-[#000000]">Find Safe Route</h1>
    </div>

    <div className="mx-auto w-full max-w-md space-y-8">

      {/* Glass Card */}
      <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/30 shadow-lg space-y-4">
        
        {/* Start Location */}
        <div className="relative">
          <Input
            placeholder="Enter starting point"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="text-black placeholder:text-black/60 bg-white/80 border border-black rounded-xl h-12 px-4"
          />

          <Button
            variant="ghost"
            size="sm"
            className="
              absolute right-2 top-2 bg-[#FFE0B2] 
              hover:bg-[#f5c77f] text-black 
              rounded-lg px-3 h-8 border border-black
            "
            onClick={getCurrentLocation}
            disabled={isLoading}
          >
            <MapPin className="mr-1 h-4 w-4" />
            {isLoading ? "Loading..." : "Current"}
          </Button>
        </div>

        {/* Destination */}
        <Input
          placeholder="Enter your destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="text-black placeholder:text-black/60 bg-white/80 border border-black rounded-xl h-12 px-4"
        />
      </div>

      {/* Button */}
      <Button
        className="w-full bg-[#FDB813] text-white font-bold text-lg py-5 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#D35400] shadow-lg hover:opacity-95 transition"
        size="lg"
        onClick={handleOpenGoogleMaps}
      >
        SAFE ROUTE
      </Button>

    </div>
  </main>
)
}
