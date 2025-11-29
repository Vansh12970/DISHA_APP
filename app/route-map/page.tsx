"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

export default function RouteMapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const routeDataStr = searchParams.get("routeData")
    const startName = searchParams.get("startName") || "Start"
    const destName = searchParams.get("destName") || "Destination"

    if (!routeDataStr) {
      console.error("Route data is missing")
      return
    }

    const routeData = JSON.parse(decodeURIComponent(routeDataStr))

    // Initialize map with a light style
    const map = L.map(mapRef.current)
    mapInstanceRef.current = map

    // Add a light-styled base map
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap contributors, © CARTO",
    }).addTo(map)

    const displayRoute = () => {
      try {
        if (routeData.route && routeData.route.coordinates) {
          // Draw the route with a blue line
          const routeLine = L.polyline(routeData.route.coordinates, {
            color: "#2196F3",
            weight: 4,
            opacity: 0.8,
            lineJoin: "round",
          }).addTo(map)

          // Add markers for start and end points
          const createMarker = (position: [number, number], title: string, color: string) => {
            const icon = L.divIcon({
              className: "custom-div-icon",
              html: `
                <div style="
                  background-color: ${color};
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })

            return L.marker(position, { icon }).addTo(map).bindPopup(title)
          }

          // Add start and end markers
          createMarker(routeData.route.coordinates[0], startName, "#FF4444")
          createMarker(routeData.route.coordinates[routeData.route.coordinates.length - 1], destName, "#FF4444")

          // Add hazard markers if available
          if (routeData.hazards) {
            routeData.hazards.forEach((hazard: any) => {
              createMarker([hazard.latitude, hazard.longitude], hazard.type, "#FDB813")
            })
          }

          // Add rescue points if available
          if (routeData.rescuePoints) {
            routeData.rescuePoints.forEach((point: any) => {
              createMarker([point.latitude, point.longitude], point.name, "#4CAF50")
            })
          }

          // Fit map to show the entire route
          map.fitBounds(routeLine.getBounds(), {
            padding: [50, 50],
            maxZoom: 12,
          })

          // Add route information
          const info = new L.Control({ position: "bottomleft" })
          info.onAdd = () => {
            const div = L.DomUtil.create("div", "route-info")
            div.innerHTML = `
              <div style="
                background: white;
                padding: 12px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                font-family: system-ui, sans-serif;
              ">
                <h3 style="margin: 0 0 8px; font-weight: 600; font-size: 14px;">Route Details</h3>
                <p style="margin: 0; font-size: 13px; color: #666;">
                  <strong>Distance:</strong> ${routeData.route.distance} km<br>
                  <strong>Est. Time:</strong> ${routeData.route.duration} mins<br>
                  ${routeData.hazards ? `<strong>Hazards:</strong> ${routeData.hazards.length}<br>` : ""}
                  ${routeData.rescuePoints ? `<strong>Rescue Points:</strong> ${routeData.rescuePoints.length}` : ""}
                </p>
              </div>
            `
            return div
          }
          info.addTo(map)
        }
      } catch (error) {
        console.error("Error displaying route:", error)
      }
    }
    displayRoute()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [searchParams])

  return (
    <div className="h-screen w-full relative">
      <div className="absolute top-4 left-4 z-10">
        <Button asChild variant="ghost" className="bg-white hover:bg-white/90">
          <Link href="/safe-route">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      <div ref={mapRef} className="h-full w-full" />
    </div>
  )
}

