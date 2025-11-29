"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const donationTypes = [
  { name: "Blood", icon: "blood.png", href: "/aid/blood" },
  { name: "Food", icon: "food.png", href: "/aid/food" },
  { name: "Money", icon: "money.png", href: "/aid/money" },
  { name: "Clothing", icon: "clothing.png", href: "/aid/clothing" },
  { name: "Shelter", icon: "shelter.png", href: "/aid/shelter" },
  { name: "Medical", icon: "medical.png", href: "/aid/medical" },
]

export default function AidPage() {
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
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-[#000000]">Make Donation</h1>
      </div>

      {/* DONATION OPTIONS */}
      <div className="space-y-4">
        {donationTypes.map((type) => (
          <Link href={type.href} key={type.name}>
            <Card
              className="
                bg-white/70 
                backdrop-blur-xl 
                border border-black 
                shadow-md 
                rounded-2xl 
                p-5 
                hover:bg-white/90 
                transition-all
                mb-3
              "
            >
              <div className="flex items-center justify-between">

                {/* ICON + TITLE */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl overflow-hidden shadow-sm bg-white">
                    <img
                      src={type.icon}
                      alt={type.name}
                      className="object-contain w-full h-full"
                    />
                  </div>

                  <span className="text-lg font-semibold text-[#000000]">
                    {type.name} Donation
                  </span>
                </div>

                {/* ARROW */}
                <ArrowLeft className="h-5 w-5 rotate-180 text-[#000000]" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
      
    </main>
  );
}
