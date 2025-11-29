"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface AirQualityData {
  datetime: string
  pm1: number
  pm2p5: number
  pm10: number
  o3: number
  no2: number
  so2: number
  co: number
  aqius: number
  aqieur: number
}

interface WindData {
  datetime: string
  temp: number
  windspeed50: number
  winddir50: number
  windspeed80: number
  winddir80: number
  windspeed100: number
  winddir100: number
}

interface SolarData {
  datetime: string
  ghiradiation: number
  dniradiation: number
  difradiation: number
  gtiradiation: number
  sunazimuth: number
  sunelevation: number
}

interface Alert {
  type: string
  severity: "high" | "medium" | "low"
  description: string
}

type Severity = "low" | "medium" | "high"

interface NationwideWeatherItem {
  state: string
  condition: string
  severity: Severity
  temperature: string
  rainfall: string
  windSpeed: string
  alertMessage: string
}

const GEMINI_ENDPOINT_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models"
const GEMINI_MODEL = "gemini-2.5-flash" // per your instruction
const TEN_MIN_MS = 10 * 60 * 1000
const LS_KEY = "nationwideWeatherV1"

export default function AlertsPage() {
  const [location, setLocation] = useState<string>("")
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null)
  const [windData, setWindData] = useState<WindData | null>(null)
  const [solarData, setSolarData] = useState<SolarData | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [nationwide, setNationwide] = useState<NationwideWeatherItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const refreshingRef = useRef(false)

  // --------- Helpers ----------
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-300 bg-red-50 text-red-800"
      case "medium":
        return "border-yellow-300 bg-yellow-50 text-yellow-800"
      case "low":
        return "border-green-300 bg-green-50 text-green-800"
      default:
        return "border-gray-300 bg-gray-50 text-gray-800"
    }
  }

  const getWindSpeedColor = (speed: number) => {
    if (speed > 50) return "text-red-600"
    if (speed > 30) return "text-yellow-600"
    return "text-green-600"
  }

  const geminiPrompt = useMemo(
    () =>
      `Return ONLY a VALID JSON array. 
No text. No explanation. And only INDIA-WIDE weather information. And only for present time.
Format example:
[
  {
    "state": "string",
    "condition": "string",
    "severity": "low | medium | high",
    "temperature": "string",
    "rainfall": "string",
    "windSpeed": "string",
    "alertMessage": "string"
  }
]`,
    []
  )

  // Strip code fences and trailing text; parse safe JSON
  const safeParseGeminiJSON = (raw: string): NationwideWeatherItem[] | null => {
    try {
      const cleaned = raw
        .replace(/```json/g, "")
  .replace(/```/g, "")
  .replace(/\n/g, "")
  .replace(/,\s*}/g, "}")
  .replace(/,\s*]/g, "]")
  .trim()
.replace(/^```(?:json)?/i, "")
.replace(/```$/i, "")

      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) {
        // Basic validation/coercion
        return parsed
          .map((it) => ({
            state: String(it.state || ""),
            condition: String(it.condition || ""),
            severity: (String(it.severity || "low").toLowerCase() as Severity) || "low",
            temperature: String(it.temperature || ""),
            rainfall: String(it.rainfall || ""),
            windSpeed: String(it.windSpeed || ""),
            alertMessage: String(it.alertMessage || ""),
          }))
          .filter((it) => it.state)
      }
      return null
    } catch {
      return null
    }
  }

  const saveNationwideToLS = (items: NationwideWeatherItem[]) => {
    try {
      const payload = { ts: Date.now(), items }
      localStorage.setItem(LS_KEY, JSON.stringify(payload))
    } catch {
      // ignore quota issues
    }
  }

  const loadNationwideFromLS = (): { ts: number; items: NationwideWeatherItem[] } | null => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return null
      const obj = JSON.parse(raw)
      if (!obj?.items) return null
      return obj
    } catch {
      return null
    }
  }

  // --------- Data fetchers ----------
  const getUserLocation = (): Promise<string> => {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              )
              const data = await response.json()
              resolve(data.display_name)
            } catch {
              resolve("Unknown Location")
            }
          },
          () => resolve("New Delhi, India")
        )
      } else {
        resolve("New Delhi, India")
      }
    })
  }

  const generateAlerts = (airQuality: AirQualityData, wind: WindData): Alert[] => {
    const alerts: Alert[] = []
    if (airQuality.aqius > 100) {
      alerts.push({
        type: "Air Quality",
        severity: "high",
        description: "Air quality is unhealthy. Consider staying indoors.",
      })
    }
    if (wind.windspeed100 > 50) {
      alerts.push({
        type: "High Winds",
        severity: "high",
        description: "Extremely strong winds expected. Take necessary precautions.",
      })
    } else if (wind.windspeed100 > 30) {
      alerts.push({
        type: "High Winds",
        severity: "medium",
        description: "Strong winds expected. Secure loose objects outdoors.",
      })
    }
    return alerts
  }

  const fetchNationwideFromGemini = async (): Promise<NationwideWeatherItem[] | null> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        console.warn("Gemini API key missing: set NEXT_PUBLIC_GEMINI_API_KEY")
        return null
      }

      const res = await fetch(
        `${GEMINI_ENDPOINT_BASE}/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: geminiPrompt }],
              },
            ],
            generationConfig: {
              // keep it simple and fast
              temperature: 0.2,
              maxOutputTokens: 2048,
              response_mime_type: "application/json" 
            },
          }),
        }
      )
      //console.log(" Gemini response status:", res.status);
      //console.log(" Gemini raw output:", await res.clone().text());


      if (!res.ok) {
        console.error("Gemini API error:", res.status, await res.text())
        return null
      }

      const data = await res.json()
      // Response shape: candidates[0].content.parts[0].text
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join("\n") ??
        ""

      const parsed = safeParseGeminiJSON(text)
      if (!parsed) {
        console.warn("Gemini response could not be parsed as JSON.")
      }
      return parsed
    } catch (e) {
      console.error("Error calling Gemini:", e)
      return null
    }
  }

  const bootstrapNationwide = async () => {
    // 1) Load cached immediately (so user sees data as soon as they arrive)
    const cached = loadNationwideFromLS()
    if (cached?.items) setNationwide(cached.items)

    // 2) If no cache or too old, fetch fresh now
    const tooOld = !cached || Date.now() - cached.ts > TEN_MIN_MS
    if (tooOld && !refreshingRef.current) {
      refreshingRef.current = true
      const fresh = await fetchNationwideFromGemini()
      if (fresh && fresh.length) {
        setNationwide(fresh)
        saveNationwideToLS(fresh)
      }
      refreshingRef.current = false
    }
  }

  // --------- Effects ----------
  useEffect(() => {
    const fetchLocalData = async () => {
      try {
        const userLocation = await getUserLocation()
        setLocation(userLocation)

        // Air quality
        const aqResp = await fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
            userLocation
          )}?unitGroup=metric&key=${
            process.env.NEXT_PUBLIC_VISUAL_CROSSING_API_KEY
          }&contentType=json&elements=datetime,pm1,pm2p5,pm10,o3,no2,so2,co,aqius,aqieur`
        )
        const aqData = await aqResp.json()
        setAirQualityData(aqData.days?.[0])

        // Wind
        const windResp = await fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
            userLocation
          )}?unitGroup=metric&key=${
            process.env.NEXT_PUBLIC_VISUAL_CROSSING_API_KEY
          }&contentType=json&include=days&elements=datetime,temp,windspeed50,winddir50,windspeed80,winddir80,windspeed100,winddir100`
        )
        const windJson = await windResp.json()
        setWindData(windJson.days?.[0])

        // Solar
        const solarResp = await fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
            userLocation
          )}?unitGroup=metric&key=${
            process.env.NEXT_PUBLIC_VISUAL_CROSSING_API_KEY
          }&contentType=json&elements=datetime,ghiradiation,dniradiation,difradiation,gtiradiation,sunazimuth,sunelevation&solarTiltAngle=45`
        )
        const solarJson = await solarResp.json()
        setSolarData(solarJson.days?.[0])

        // Local alerts (derived)
        const newAlerts = generateAlerts(aqData.days?.[0], windJson.days?.[0])
        setAlerts(newAlerts)
      } catch (e) {
        console.error("Error fetching local weather data:", e)
      } finally {
        setLoading(false)
      }
    }

    // Start both tracks: local data + nationwide bootstrap (from cache/Gemini)
    fetchLocalData()
    bootstrapNationwide()

    // Scheduled nationwide refresh every 10 minutes
    const id = setInterval(async () => {
      const fresh = await fetchNationwideFromGemini()
      if (fresh && fresh.length) {
        setNationwide(fresh)
        saveNationwideToLS(fresh)
      }
    }, TEN_MIN_MS)

    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If any state has high severity, show a banner
  const hasHighSeverity = useMemo(
    () => (nationwide || []).some((n) => n.severity === "high"),
    [nationwide]
  )

  return (
  <div className="min-h-screen bg-gradient-to-b from-[#FCEACC] via-[#F7D7A8] to-[#F5C88A] p-4">
    {/* HEADER */}
    <div className="flex items-center gap-3 mb-6">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="rounded-full bg-white/70 backdrop-blur-md shadow-md hover:bg-white"
      >
        <Link href="/dashboard">
            <ArrowLeft className="h-6 w-6 text-[#00000]" />
        </Link>
      </Button>

        <h1 className="text-3xl font-bold text-[#0000 tracking-tight">
        Alerts
      </h1>
    </div>

    {loading ? (
      <Card className="p-6 glass-card text-center rounded-2xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E4156] mx-auto"></div>
        <p className="mt-3 text-[#2E4156] font-medium">Loading data...</p>
      </Card>
    ) : (
      <>
        {/* CURRENT LOCATION CARD */}
        <Card className="p-5 mb-6 rounded-2xl glass-card border border-white/40 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-[#D97706]" />
              <h2 className="text-xl font-semibold text-[#00000]
">
              Current Location
            </h2>
          </div>
            <p className="text-[#00000] text-sm">{location}</p>
        </Card>

        {/* LOCAL ALERTS */}
        <div className="mb-8">
            <h2 className="text-xl font-bold text-[#00000] mb-3">
            Local Alerts
          </h2>

          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <Card
                  key={index}
                  className={`p-5 rounded-2xl border-2 shadow-md ${getSeverityColor(
                    alert.severity
                  )}`}
                >
                    <h3 className="font-bold text-lg text-[#00000]">
                    {alert.type}
                  </h3>
                    <p className="text-sm mt-2 text-[#00000]">
                    {alert.description}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
              <Card className="p-5 text-center rounded-2xl glass-card border-black text-[#00000]
 font-medium">
              <p>No active alerts in your area</p>
            </Card>
          )}
        </div>

        {/* NATIONWIDE WEATHER SECTION */}
          <h2 className="text-xl font-bold text-[#00000 mb-4">
          Nation-Wide Weather Information
        </h2>

        {hasHighSeverity && (
          <Card className="p-4 mb-4 rounded-2xl bg-red-50 border border-red-300 text-red-700 flex gap-3 shadow-sm">
            <TriangleAlert className="h-5 w-5 mt-1" />
            <div>
              <p className="font-bold">High severity alerts detected</p>
              <p className="text-sm">
                Some states report severe conditions. Review details below.
              </p>
            </div>
          </Card>
        )}

        {nationwide && nationwide.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {nationwide.map((item, idx) => (
              <Card
                key={idx}
                className={`p-5 rounded-2xl glass-card border ${
                  getSeverityColor(item.severity)
                }`}    >
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[#00000]">
                    {item.state}
                  </h3>
                    <span className="text-xs px-3 py-1 rounded-full bg-white/70 border text-[#00000]">
                    Severity: {item.severity.toUpperCase()}
                  </span>
                </div>

                  <div className="text-sm text-[#00000]space-y-1">
                  <p>
                    <b>Condition:</b> {item.condition || "—"}
                  </p>
                  <p>
                    <b>Temperature:</b> {item.temperature || "—"}
                  </p>
                  <p>
                    <b>Rainfall:</b> {item.rainfall || "—"}
                  </p>
                  <p>
                    <b>Wind Speed:</b> {item.windSpeed || "—"}
                  </p>

                  {item.alertMessage && (
                    <p className="mt-2">
                      <b>Alert:</b> {item.alertMessage}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
            <Card className="p-5 rounded-2xl text-center glass-card text-[#00000]">
            <p>Nation-wide weather details will appear soon.</p>
          </Card>
        )}

        <Separator className="my-8 border-[#D9C5A3]" />

        {/* AIR QUALITY INDEX */}
          <h2 className="text-xl font-bold text-[#00000 mb-4">
          Air Quality Index
        </h2>

        <Card className="p-5 rounded-2xl glass-card border-black">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-black-600">US AQI</p>
                <p className="text-3xl font-bold text-[#00000]">
                {airQualityData?.aqius}
              </p>
            </div>
            <div>
              <p className="text-sm text-black-600">EU AQI</p>
                <p className="text-3xl font-bold text-[#00000]">
                {airQualityData?.aqieur}
              </p>
            </div>
          </div>
        </Card>

        {/* WIND */}
          <h2 className="text-xl font-bold text-[#00000 mt-8 mb-4">
          Wind Speed
        </h2>

        <Card className="p-5 rounded-2xl glass-card border-black">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-black-600">50m Height</p>
              <p
                className={`text-xl font-semibold ${getWindSpeedColor(
                  windData?.windspeed50 || 0
                )}`}
              >
                {windData?.windspeed50?.toFixed(1)} m/s
              </p>
            </div>
            <div>
              <p className="text-sm text-black-600">100m Height</p>
              <p
                className={`text-xl font-semibold ${getWindSpeedColor(
                  windData?.windspeed100 || 0
                )}`}
              >
                {windData?.windspeed100?.toFixed(1)} m/s
              </p>
            </div>
          </div>
        </Card>

        {/* SOLAR */}
          <h2 className="text-xl font-bold text-[#00000] mt-8 mb-4">
          Solar Radiation
        </h2>

        <Card className="p-5 rounded-2xl glass-card border-black">
          <p className="text-sm text-black-600">
            Global Horizontal Irradiance
          </p>
            <p className="text-xl font-semibold text-[#00000]">
            {solarData?.ghiradiation?.toFixed(1)} W/m²
          </p>
        </Card>
      </>
    )}
  </div>
);
}