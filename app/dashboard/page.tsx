"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { AlertTriangle, Home, Bell, PenSquare, Layout, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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

export default function DashboardPage() {
  const router = useRouter()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [alerts, setAlerts] = useState<string[]>([])

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      router.push("/signin")
      return
    }
  }, [router])
  
  useEffect(() => {
    // Try to get cached weather data
    const cachedWeather = sessionStorage.getItem("weatherData")
    const userLocation = sessionStorage.getItem("userLocation")

    if (!cachedWeather || !userLocation) {
      // If no cached data, redirect to location permission page
      router.push("/location-permission")
      return
    }

    // Use cached weather data
    const weatherData = JSON.parse(cachedWeather)
    setWeather(weatherData)

    // Generate alerts based on weather
    const newAlerts = []
    if (weatherData.main.temp >= 35) newAlerts.push("Extreme Heat Warning")
    if (weatherData.main.temp <= 0) newAlerts.push("Freezing Temperature Alert")
    if (weatherData.wind.speed >= 10) newAlerts.push("Strong Wind Advisory")
    if (weatherData.weather[0].main === "Thunderstorm") newAlerts.push("Severe Thunderstorm Warning")
    if (weatherData.weather[0].main === "Rain" && weatherData.rain?.["1h"] > 10) newAlerts.push("Heavy Rainfall Alert")
    setAlerts(newAlerts)

    // Refresh weather data
    const refreshWeather = async () => {
      try {
        const { latitude, longitude } = JSON.parse(userLocation)
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`,
        )
        const newData = await res.json()
        setWeather(newData)
        sessionStorage.setItem("weatherData", JSON.stringify(newData))
      } catch (error) {
        console.error("Failed to refresh weather data:", error)
      }
    }

    refreshWeather()
  }, [router])

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 6) return "night"
    if (hour < 12) return "morning"
    if (hour < 18) return "afternoon"
    return "evening"
  }

  const getWeatherBackground = () => {
    if (!weather) return "bg-gradient-to-b from-blue-400 to-blue-100"
    const condition = weather?.weather[0].main.toLowerCase()
    const timeOfDay = getTimeOfDay()

    if (condition?.includes("clear") && timeOfDay === "morning") return "bg-gradient-to-b from-orange-400 to-yellow-200"
    if (condition?.includes("clear") && timeOfDay === "night") return "bg-gradient-to-b from-[#34729C]/100 to-[#D1ECFF]/50"
    if (condition?.includes("cloud")) return "bg-gradient-to-b from-gray-500 to-gray-200"
    if (condition?.includes("rain")) return "bg-gradient-to-b from-gray-600 to-gray-400"
    return "bg-gradient-to-b from-blue-400 to-blue-100"
  }

return (
  <div className="flex min-h-screen flex-col pb-20 bg-gradient-to-b from-[#F5E9DA] to-[#FFF2DF]">

    {/* Emergency Alert Banner */}
    <div className="px-4 py-5 bg-gradient-to-r from-[#D35400] to-[#A93226] text-white shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-[#FFE0B2]" />
          <span className="font-bold text-lg tracking-wide">EMERGENCY ALERT</span>
        </div>

        <Button
          size="sm"
          className="bg-[#FFE0B2] text-[#7A2E19] hover:bg-[#FFE0B2]/90 font-bold rounded-lg shadow-md"
          asChild
        >
          <Link href="/report">Report Disaster</Link>
        </Button>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-1">
          {alerts.map((alert, index) => (
            <p key={index} className="text-sm font-medium text-[#FFE0B2]">
              ⚠️ {alert}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#FFE0B2]">No Active Alert</p>
      )}
    </div>

    {/* Main Content */}
    <main className="flex-1 p-4 space-y-8">

      {/* Weather Card */}
      <div className="rounded-3xl overflow-hidden shadow-xl border border-white/40 bg-white/40 backdrop-blur-md">
        {weather && (
          <div
            className={`relative p-6 rounded-3xl bg-gradient-to-b from-[#8BC6FF] to-[#C7E1FF] text-[#1B1B1B]`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold">{weather.name}</h2>
                <p className="text-sm opacity-80">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>

              <p className="text-4xl font-extrabold">
                {Math.round(weather.main.temp)}°C
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[17px]">
              <div className="space-y-2">
                <p className="text-xl font-bold capitalize">
                  {weather.weather[0].description}
                </p>
                <p className="opacity-90">Feels like: {Math.round(weather.main.feels_like)}°C</p>
              </div>

              <div className="font-semibold space-y-2">
                <p>Humidity: {weather.main.humidity}%</p>
                <p>Wind: {weather.wind.speed} m/s</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 gap-6">

        <Link href="/safe-route">
          <Card className="p-4 h-40 text-center rounded-2xl bg-white/70 backdrop-blur-md shadow-lg hover:shadow-xl transition-all border border-[#F5E9DA]">
            <div className="flex justify-center mb-3">
              <Image src="/safe-route.png" width={48} height={48} alt="Safe Route" />
            </div>
            <h3 className="font-bold text-[#1B1B1B] text-lg">Safe Route</h3>
            <p className="text-sm text-[#444]">Search for Safe Route</p>
          </Card>
        </Link>

        <Link href="/volunteer">
          <Card className="p-4 h-40 text-center rounded-2xl bg-white/70 backdrop-blur-md shadow-lg hover:shadow-xl transition-all border border-[#F5E9DA]">
            <div className="flex justify-center mb-3">
              <Image src="/volunteer.png" width={48} height={48} alt="Volunteer" />
            </div>
            <h3 className="font-bold text-[#1B1B1B] text-lg">Volunteer</h3>
            <p className="text-sm text-[#444]">Raise Hand As A Volunteer</p>
          </Card>
        </Link>

        <Link href="/aid">
          <Card className="p-4 h-40 text-center rounded-2xl bg-white/70 backdrop-blur-md shadow-lg hover:shadow-xl transition-all border border-[#F5E9DA]">
            <div className="flex justify-center mb-3">
              <Image src="/donation.png" width={48} height={48} alt="Donate" />
            </div>
            <h3 className="font-bold text-[#1B1B1B] text-lg">Donate</h3>
            <p className="text-sm text-[#444]">Make A Donation</p>
          </Card>
        </Link>

        <Link href="/resources">
          <Card className="p-4 h-40 text-center rounded-2xl bg-white/70 backdrop-blur-md shadow-lg hover:shadow-xl transition-all border border-[#F5E9DA]">
            <div className="flex justify-center mb-3">
              <Image src="/information.png" width={48} height={48} alt="Survival Guides" />
            </div>
            <h3 className="font-bold text-[#1B1B1B] text-lg">Survival Guides</h3>
            <p className="text-sm text-[#444]">Learn To Be Safe</p>
          </Card>
        </Link>
      </div>

      {/* Predict Button */}
      <Button
        asChild
        className="w-full py-4 rounded-2xl text-white text-lg font-bold 
          bg-gradient-to-r from-[#F5A623] to-[#D35400] shadow-lg hover:opacity-95 transition"
      >
        <Link href="/predict-disaster">Predict Secondary Disasters</Link>
      </Button>
    </main>

    {/* Bottom Navigation */}
    <nav className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-[#000000] shadow-inner">
      <div className="flex justify-around py-3 text-[#1B1B1B] font-medium">

        <Link href="/dashboard" className="flex flex-col items-center">
          <Home className="h-6 w-6" />
          <span className="text-xs">Home</span>
        </Link>

        <Link href="/alerts" className="flex flex-col items-center">
          <Bell className="h-6 w-6" />
          <span className="text-xs">Alerts</span>
        </Link>

        <Link href="/report" className="flex flex-col items-center">
          <PenSquare className="h-6 w-6" />
          <span className="text-xs">Report</span>
        </Link>

        <Link href="/services" className="flex flex-col items-center">
          <Layout className="h-6 w-6" />
          <span className="text-xs">Emergency</span>
        </Link>

        <Link href="/account" className="flex flex-col items-center">
          <User className="h-6 w-6" />
          <span className="text-xs">Account</span>
        </Link>

      </div>
    </nav>
  </div>
);
}

