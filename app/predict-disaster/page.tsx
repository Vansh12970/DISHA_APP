"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Phone, Sun, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface DisasterPrediction {
  type: string
  probability: number
  timeframe: number
  location: string
  coordinates: string
  impactZone: string
  weatherConditions: string
  safetyTips: string[]
}

// Initialize Google Generative AI with the provided API key
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY as string
)
const openWeatherApiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY 

export default function PredictDisasterPage() {
  const [predictions, setPredictions] = useState<DisasterPrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterPrediction | null>(null)
  const [location, setLocation] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getUserLocation = () => {
      return new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser"))
          return
        }

        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
    }

    const fetchWeatherData = async (lat: number, lon: number) => {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${openWeatherApiKey}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }

      return await response.json()
    }

    const fetchLocationName = async (lat: number, lon: number) => {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${openWeatherApiKey}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch location data")
      }

      const data = await response.json()
      return data[0]?.name || "Unknown Location"
    }

   /*
    // Mock Weather data for testing 
    const mockWeatherData = {
      "coord": { "lon": 76.6181, "lat": 30.7563 },
      "weather": [{ "id": 502, "main": "Rain", "description": "heavy rain", "icon": "10n" }],
      "main": {
        "temp": 32,
        "humidity": 94,
        "pressure": 998,
        "sea_level": 998,
        "grnd_level": 960
      },
      "wind": { "speed": 18, "deg": 180, "gust": 25 },
      "clouds": { "all": 100 },
      "visibility": 500,
      "name": "Test City"
    };
    
    const locationData = {
      "name": "Test Area",
      "lat": 30.7563,
      "lon": 76.6181
    };
    
    const prompt = `
      Based on the following weather and location data, predict if there are any potential secondary disasters that might occur in the next 72 hours.
      If there are no risks, clearly state that there is 0% chance of any secondary disaster.
    
      Weather data: ${JSON.stringify(mockWeatherData)}
      Location: ${JSON.stringify(locationData)}
    
      For each potential secondary disaster, provide:
      1. Type of disaster (e.g., Flood, Landslide, Wildfire, etc.)
      2. Probability percentage (0-100%)
      3. Expected timeframe in hours
      4. Impact zone description
      5. Current weather conditions
      6. At least 4 safety tips specific to this disaster
    
        Format your response as a JSON array of disaster objects. If there are no risks, return an empty array.
        Example format:
        [
          {
            "type": "Flash Flood",
            "probability": 65,
            "timeframe": 24,
            "impactZone": "Low-lying areas near rivers",
            "weatherConditions": "Heavy rainfall",
            "safetyTips": ["Move to higher ground", "Avoid walking in water", "Don't drive through floods", "Follow evacuation orders"]
          }
        ]
    `;*/
    
   
    const predictSecondaryDisasters = async (weatherData: any, locationInfo: any) => {
      try {
        // Access the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        // Create a prompt for the AI model
        const prompt = `
        Based on the following weather and location data, predict if there are any potential secondary disasters that might occur in the next 72 hours, along with that check 50Km surrounding area of location data. 
        If there are no risks, clearly state that there is 0% chance of any secondary disaster.
        
        Weather data: ${JSON.stringify(weatherData)}
        Location: ${JSON.stringify(locationInfo)}
        
        For each potential secondary disaster, provide:
        1. Type of disaster (e.g., Flood, Landslide, Wildfire, etc.)
        2. Probability percentage (0-100%)
        3. Expected timeframe in hours
        4. Impact zone description
        5. Current weather conditions
        6. At least 4 safety tips specific to this disaster
        
        Format your response as a JSON array of disaster objects. If there are no risks, return an empty array.
        Example format:
        [
          {
            "type": "Flash Flood",
            "probability": 65,
            "timeframe": 24,
            "impactZone": "Low-lying areas near rivers",
            "weatherConditions": "Heavy rainfall",
            "safetyTips": ["Move to higher ground", "Avoid walking in water", "Don't drive through floods", "Follow evacuation orders"]
          }
        ]
        `
        //console.log("Prompt to Gemini API:", prompt);

        // Generate content
        const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: prompt }] }],
})

const response = result.response
const text = response.text()

if (!text) {
  console.warn("Gemini returned empty response")
  return []
}


        console.log("Generated text from Gemini API:", text)

      
        // Extract JSON from the response
        const jsonMatch = text.match(/\[[\s\S]*\]/m)
        if (!jsonMatch) {
          console.error("Failed to extract JSON from AI response:", text)
          return []
        }

        const jsonStr = jsonMatch[0]
        const predictions = JSON.parse(jsonStr)

        // Add location information to each prediction
        return predictions.map((pred: any) => ({
          ...pred,
          location: locationInfo.name,
          coordinates: `Lat: ${locationInfo.lat.toFixed(2)}° Lon: ${locationInfo.lon.toFixed(2)}°`,
        }))
      } catch (error) {
        console.error("Error predicting disasters:", error)
        return []
      }
    }

    const fetchData = async () => {
      try {
        // Get user's location
        const position = await getUserLocation()
        const { latitude, longitude } = position.coords

        // Save location to session storage
        sessionStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }))

        // Fetch location name
        const locationName = await fetchLocationName(latitude, longitude)

        // Create location object
        const locationInfo = {
          name: locationName,
          lat: latitude,
          lon: longitude,
        }
        setLocation(locationInfo)

        // Fetch weather data
        const weatherData = await fetchWeatherData(latitude, longitude)

        // Predict disasters using AI
        const disasterPredictions = await predictSecondaryDisasters(weatherData, locationInfo)
        setPredictions(disasterPredictions)

        if (disasterPredictions.length > 0) {
          setSelectedDisaster(disasterPredictions[0])
        }
      } catch (error) {
        console.error("Error:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  /*if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF2DF]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }*/

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF2DF] p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-center">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  // Create a default "No Disaster" prediction when predictions array is empty
  const noDisasterPrediction: DisasterPrediction = {
    type: "No Secondary Disaster",
    probability: 0,
    timeframe: 0,
    location: location?.name || "Your location",
    coordinates: location ? `Lat: ${location.lat.toFixed(2)}° Lon: ${location.lon.toFixed(2)}°` : "",
    impactZone: "None",
    weatherConditions: "Normal conditions",
    safetyTips: [
      "Continue normal activities",
      "Stay informed about weather changes",
      "Keep emergency contacts handy",
      "Maintain awareness of your surroundings",
    ],
  }

  // If no predictions, use the noDisasterPrediction
  const displayDisaster = selectedDisaster || (predictions.length === 0 ? noDisasterPrediction : null)

  return (
  <div className="min-h-screen bg-gradient-to-b from-[#F5E9DA] to-[#FFF2DF] p-5">

    {loading && (
  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-5 rounded-2xl shadow-lg flex flex-col items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D35400]"></div>
      <p className="mt-3 text-[#2E4156] font-semibold">Predicting...</p>
    </div>
  </div>
)}


    {/* HEADER */}
    <div className="flex items-center gap-3 mb-6">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="bg-white/70 backdrop-blur-md shadow-sm rounded-full hover:bg-white"
      >
        <Link href="/dashboard">
          <ArrowLeft className="h-6 w-6 text-[#2E4156]" />
        </Link>
      </Button>

      <h1 className="text-2xl font-bold text-[#000000]">
        Secondary Disaster Prediction
      </h1>
    </div>

    {displayDisaster && (
      <div className="space-y-8">

        {/* LOCATION */}
        <div className="px-2">
          <div className="flex items-center gap-2 text-lg font-semibold text-[#000000]">
            <MapPin className="h-5 w-5 text-[#D35400]" />
            <span>{displayDisaster.location}</span>
          </div>
        </div>

        {/* PREDICTION CARDS */}
        <div className="grid grid-cols-2 gap-5">

          {/* PROBABILITY */}
          <Card className="p-6 bg-white/70 backdrop-blur-md shadow-xl rounded-2xl border border-white/50 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={displayDisaster.probability > 0 ? "#A93226" : "#1C6E7D"}
                  strokeWidth="3"
                  strokeDasharray={`${displayDisaster.probability}, 100`}
                />
                <text x="18" y="21.5" className="text-sm" textAnchor="middle" fill="#2E4156">
                  {displayDisaster.probability}%
                </text>
              </svg>
            </div>
            <span className="mt-3 font-bold text-[#000000]">Prediction Probability</span>
          </Card>

          {/* SKY / TIMEFRAME */}
          <Card className="p-6 bg-white/70 backdrop-blur-md shadow-xl rounded-2xl border border-white/50 flex flex-col items-center justify-center">
            {displayDisaster.probability > 0 ? (
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-[#A93226]">
                  {displayDisaster.timeframe} hrs
                </div>
                <span className="mt-3 font-bold text-[#2E4156]">Timeframe</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Sun className="h-16 w-16 text-[#F5A623]" />
                <span className="mt-3 text-lg font-bold text-[#000000]">Clear Sky</span>
              </div>
            )}
          </Card>
        </div>

        {/* STATUS CARDS */}
        <div className="space-y-5">

          {/* MAIN STATUS */}
          <Card
            className={`p-5 rounded-2xl text-white shadow-md ${
              displayDisaster.probability > 0
                ? "bg-gradient-to-r from-[#D35400] to-[#A93226]"
                : "bg-gradient-to-r from-[#1C7D56] to-[#129D77]"
            }`}
          >
            <h3 className="font-bold text-xl">
              {displayDisaster.probability > 0
                ? `Chances of ${displayDisaster.type}`
                : "No Secondary Disaster Expected"}
            </h3>
            <p className="text-lg mt-1">{displayDisaster.probability}%</p>
          </Card>

          {/* IF EXPECTED */}
          {displayDisaster.probability > 0 && (
            <Card className="p-4 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow">
              <h3 className="font-semibold text-[#2E4156]">
                Expected in next {displayDisaster.timeframe} hours
              </h3>
            </Card>
          )}

          {/* IMPACT ZONE */}
          <Card
            className={`p-5 rounded-2xl text-white shadow-md ${
              displayDisaster.probability > 0
                ? "bg-[#A93226]"
                : "bg-[#1C7D56]"
            }`}
          >
            <h3 className="font-bold text-xl">Impact Zone</h3>
            <p className="text-lg mt-1">{displayDisaster.impactZone}</p>
          </Card>

          {/* WEATHER CONDITIONS */}
          <Card
            className={`p-5 rounded-2xl text-white shadow-md ${
              displayDisaster.probability > 0
                ? "bg-[#A93226]"
                : "bg-[#1C7D56]"
            }`}
          >
            <h3 className="font-bold text-xl">Weather Conditions</h3>
            <p className="text-lg mt-1">{displayDisaster.weatherConditions}</p>
          </Card>

          {/* SAFETY TIPS */}
          <Card
            className={`p-5 rounded-2xl text-white shadow-md ${
              displayDisaster.probability > 0
                ? "bg-[#A93226]"
                : "bg-[#1C7D56]"
            }`}
          >
            <h3 className="text-xl font-bold">Safety Tips</h3>
            <ul className="mt-3 list-disc pl-4 text-base space-y-1">
              {displayDisaster.safetyTips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </Card>
        </div>

        {/* EMERGENCY BUTTON */}
        <Button
          className={`w-full py-5 rounded-xl text-white text-lg font-bold shadow-lg
            ${
              displayDisaster.probability > 0
                ? "bg-gradient-to-r from-[#D35400] to-[#A93226] hover:opacity-95"
                : "bg-gradient-to-r from-[#1C7D56] to-[#129D77] hover:opacity-95"
            }`}
          onClick={() => (window.location.href = "tel:112")}
        >
          <Phone className="mr-2 h-6 w-6" />
          Emergency Services
        </Button>
      </div>
    )}

    {/* DISASTER TYPE SELECTOR */}
    <div className="mt-8 flex gap-3 overflow-x-auto pb-4">
      {predictions.length > 0 ? (
        predictions.map((prediction) => (
          <Button
            key={prediction.type}
            variant={selectedDisaster?.type === prediction.type ? "default" : "outline"}
            onClick={() => setSelectedDisaster(prediction)}
            className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md
              ${
                selectedDisaster?.type === prediction.type
                  ? "bg-gradient-to-r from-[#F5A623] to-[#D35400] text-white border-none"
                  : "bg-white text-[#2E4156] border border-[#E5D3B3]"
              }`}
          >
            {prediction.type}
          </Button>
        ))
      ) : (
        <Button className="bg-gradient-to-r from-[#1C7D56] to-[#129D77] text-white rounded-full shadow-md">
          No Secondary Disasters
        </Button>
      )}
    </div>
  </div>
);
}