"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Image from "next/image"

interface WeatherData {
  name: string
  main: {
    temp: number
    humidity: number
    feels_like: number
  }
  weather: Array<{
    main: string
    description: string
  }>
  wind: {
    speed: number
  }
}

export default function LocationPermissionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
      )
      const data: WeatherData = await res.json()

      sessionStorage.setItem("weatherData", JSON.stringify(data))
      sessionStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }))
      return data
    } catch (error) {
      throw new Error("Failed to fetch weather data")
    }
  }

  const handleLocationPermission = () => {
    setLoading(true)
    setError(null)

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            await fetchWeatherData(latitude, longitude)
            router.push("/welcome")
          } catch (error) {
            setError("Failed to fetch weather data. Please try again.")
            setLoading(false)
          }
        },
        (error) => {
          let errorMessage
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location services to continue."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable."
              break
            case error.TIMEOUT:
              errorMessage = "Location request timed out."
              break
            default:
              errorMessage = "An unknown error occurred."
          }
          setError(errorMessage)
          setLoading(false)
        }
      )
    } else {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
    }
  }

return (
  <main className="relative min-h-screen flex items-center justify-center p-6 
      bg-gradient-to-b from-[#FCEACC] via-[#F7D7A8] to-[#F5C88A] overflow-hidden">

    {/* Subtle background glow */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent_70%)] pointer-events-none"></div>

    {/* Logo with soft glow */}
    <div className="absolute top-10 z-20 animate-fadeInSlow flex flex-col items-center">
      <div className="absolute blur-2xl bg-[#F5A623]/40 rounded-full w-40 h-40"></div>
      <Image
        src="/disha-logo.png"
        alt="DISHA Logo"
        width={135}
        height={135}
        className="relative drop-shadow-xl"
      />
    </div>

    {/* Main Card */}
    <div className="
        relative z-10 w-full max-w-lg p-10 pt-32 rounded-3xl
        bg-white/80 backdrop-blur-xl
        shadow-[0_20px_50px_rgba(0,0,0,0.12)]
        border border-white/50
        animate-fadeUp text-center
      "
    >
      <h1 className="text-3xl md:text-4xl font-extrabold text-[#000000] mb-4 tracking-tight">
        Location Permission
      </h1>

      <p className="text-[#000000] text-[17px] leading-relaxed font-medium">
        Please enable precise location access for this app to enhance its functionality. 
        This allows us to monitor your location during emergencies. If you go offline, 
        we will provide your last known location to first responders, ensuring they can 
        locate and assist you quickly.
      </p>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg animate-shake shadow-sm">
          {error}
        </div>
      )}

      {/* CTA Button */}
      <Button
        onClick={handleLocationPermission}
        disabled={loading}
        className="
          w-full mt-8 text-lg font-bold py-5 rounded-xl
          bg-gradient-to-r from-[#F5A623] to-[#D97706]
          text-white shadow-lg hover:opacity-95 transition-all
        "
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Getting Location...
          </>
        ) : (
          "Grant location access"
        )}
      </Button>
    </div>

    {/* Animations */}
    <style jsx global>{`
      @keyframes fadeUp {
        0% { transform: translateY(25px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      .animate-fadeUp {
        animation: fadeUp 0.8s ease-out forwards;
      }

      @keyframes fadeInSlow {
        0% { opacity: 0; transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1); }
      }
      .animate-fadeInSlow {
        animation: fadeInSlow 1s ease-out forwards;
      }

      @keyframes shake {
        10%, 90% { transform: translateX(-1px); }
        20%, 80% { transform: translateX(2px); }
        30%, 50%, 70% { transform: translateX(-3px); }
        40%, 60% { transform: translateX(3px); }
      }
      .animate-shake {
        animation: shake 0.4s ease-in-out;
      }
    `}</style>

  </main>
);
}