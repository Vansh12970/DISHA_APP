"use client"

import Link from "next/link"
import { ArrowLeft, Phone, MessageSquare, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const emergencyContacts = [
  {
    name: "Disaster Management Authority",
    phone: "1070",
    sms: "1070",
  },
  {
    name: "National Disaster Response Force (NDRF)",
    phone: "011-24363260",
    sms: "9711077372",
  },
  {
    name: "Police Emergency",
    phone: "100",
    sms: "100",
  },
  {
    name: "Fire Emergency",
    phone: "101",
    sms: "101",
  },
  {
    name: "Ambulance",
    phone: "102",
    sms: "102",
  },
  {
    name: "Medical Assistance",
    phone: "108",
    sms: "108",
  },
  {
    name: "Women Helpline",
    phone: "1091",
    sms: "1091",
  },
  {
    name: "Child Helpline",
    phone: "1098",
    sms: "1098",
  },
]

export default function ServicesPage() {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`
  }

  const handleSMS = (number: string) => {
    window.location.href = `sms:${number}`
  }

  return (
  <main className="flex min-h-screen flex-col p-4 bg-gradient-to-b from-[#FCEACC] via-[#F7D7A8] to-[#F5C88A]">

    {/* HEADER */}
    <div className="flex items-center gap-3 mb-6">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="rounded-full bg-white/70 backdrop-blur-md shadow-md hover:bg-white"
      >
        <Link href="/dashboard">
          <ArrowLeft className="h-6 w-6 text-[#2E3E4E]" />
        </Link>
      </Button>

      <h1 className="text-3xl font-bold text-[#000000] tracking-tight">
        Helpline
      </h1>
    </div>

    {/* CONTACT LIST */}
    <div className="space-y-5">
      {emergencyContacts.map((contact, index) => (
        <Card
          key={index}
          className="p-5 rounded-3xl glass-card border border-black shadow-md"
        >
          {/* Contact Name */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center shadow-md">
              <User className="h-6 w-6 text-[#2E3E4E]" />
            </div>

            <span className="font-semibold text-lg text-[#2E3E4E]">
              {contact.name}
            </span>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              className="w-full bg-[#FF7373] hover:bg-[#e96868] text-white font-bold py-4 rounded-xl shadow-lg transition"
              onClick={() => handleCall(contact.phone)}
            >
              <Phone className="mr-2 h-5 w-5" />
              CALL
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#FFE29F] hover:bg-[#f8d584] text-black border-[#FFE29F] font-bold py-4 rounded-xl shadow-lg transition"
              onClick={() => handleSMS(contact.sms)}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              SMS
            </Button>
          </div>
        </Card>
      ))}
    </div>
  </main>
)
}

