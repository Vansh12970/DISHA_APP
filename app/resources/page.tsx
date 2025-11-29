"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"

const disasterTypes = [
  {
    name: "Earthquake",
    icon: "/earthquake.png",
  },
  { name: "Tsunami",
    icon: "/tsunami.png" },
  {
    name: "Flood",
    icon: "/flood.png",
  },
  {
    name: "Wildfire",
    icon: "/wildfire.png",
  },
  {
    name: "Hurricane",
    icon: "/hurricane.png",
  },
  {
    name: "Heavy Rainfall",
    icon: "/heavy-rainfall.png",
  },
  { name: "Thunderstorm",
    icon: "/thunderstorm.png"
  },
  { name: "Health Kit",
    icon: "/health-kit.png" },
]

export default function ResourcesPage() {
  return (
    <main className="flex min-h-screen flex-col p-4 bg-[#FFF2DF]">
      
      {/* HEADER */}
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
        <h1 className="text-2xl font-bold text-[#000000]">Survival Guide</h1>
      </div>

      {/* LIST */}
      <div className="grid gap-4">
        {disasterTypes.map((disaster) => (
          <Link
            href={`/resources/${disaster.name.toLowerCase().replace(" ", "-")}`}
            key={disaster.name}
          >
            <Card className="p-5 bg-white/80 backdrop-blur-md shadow-sm border border-black rounded-xl hover:bg-[#FFE0B2] transition-all duration-200">
              <div className="flex items-center justify-between">
                
                {/* LEFT */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 relative">
                    <Image
                      src={disaster.icon}
                      alt={disaster.name}
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>

                  <span className="text-lg font-semibold text-black">
                    {disaster.name}
                  </span>
                </div>
                
                {/* RIGHT ARROW */}
                <ArrowLeft className="h-5 w-5 rotate-180 text-black" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
