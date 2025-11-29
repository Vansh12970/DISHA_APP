"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Edit2, Bell, Home, AlertTriangle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface UserData {
  name: string
  age: string
  contact: string
  email: string
  bloodGroup: string
  [key: string]: string
}

const menuItems = [
  { icon: Bell, label: "Alerts", href: "/alerts" },
  { icon: AlertTriangle, label: "Report Incident", href: "/report" },
  { icon: Home, label: "Weather Updates", href: "/dashboard" },
]

export default function AccountPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if(typeof window !== "undefined") {
    // Try to get user data from localStorage
    const storedUserData = localStorage.getItem("userData")
    console.log("Stored userData:", localStorage.getItem("userData"))

    if (storedUserData) {
      setUserData(JSON.parse(storedUserData))
      setIsLoading(false)
    } else {
      // If not in localStorage, try to fetch from backend using the token
      const fetchUserData = async () => {
        try {
          const accessToken = localStorage.getItem("accessToken")

          if (!accessToken) {
            throw new Error("No access token found")
          }

          console.log("Access token:", accessToken)

          const response = await fetch("http://localhost:8080/api/v1/users/current-user", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json", 
            },
          })

          if (!response.ok) {
            throw new Error("Failed to fetch user data")
          }

          const data = await response.json()

          // Extract user data from response
          const userDetails = data.user || data

          // Create a standardized user data object
          const formattedUserData = {
            name: userDetails.name || userDetails.fullName || "Not provided",
            age: userDetails.age || "Not provided",
            contact: userDetails.contact || "Not provided",
            email: userDetails.email || "Not provided",
            bloodGroup: userDetails.bloodGroup || "Not provided",
          }

          setUserData(formattedUserData)

          // Save to localStorage for future use
          localStorage.setItem("userData", JSON.stringify(formattedUserData))
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchUserData()
    }
  }
  }, [])

// ========== LOADING SCREEN ==========
if (isLoading) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCEACC] via-[#F7D7A8] to-[#F5C88A] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-[#2E4156]"></div>
    </div>
  );
}

// ========== USER NOT LOGGED IN ==========
if (!userData) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCEACC] via-[#F7D7A8] to-[#F5C88A] p-4">
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
          Profile
        </h1>
      </div>

      <Card className="p-6 text-center bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl">
        <p className="text-[#2E3E4E] text-lg">User information not available.</p>
        <p className="text-gray-600 text-sm mb-4">Please sign in again.</p>

        <Button
          asChild
          className="w-full bg-[#FDB813] text-black font-bold text-lg hover:bg-[#e5a20f] rounded-xl py-4 shadow-lg"
        >
          <Link href="/signin">Sign In</Link>
        </Button>
      </Card>
    </div>
  );
}

// ========== FORMAT DISPLAY DATA ==========
const displayData = {
  name: userData.name || userData.fullName || "Not provided",
  age: userData.age || "Not provided",
  contact: userData.contact || "Not provided",
  email: userData.email || "Not provided",
  bloodGroup: userData.bloodGroup || "Not provided",
  language: "English",
};

// ========== MAIN PROFILE PAGE UI ==========
return (
  <div className="min-h-screen bg-gradient-to-b from-[#FCEACC] via-[#F7D7A8] to-[#F5C88A]">
    <div className="p-4">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
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
          Profile
        </h1>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-32 h-32 rounded-full bg-[#2E4156] shadow-xl flex items-center justify-center">
          <div className="absolute inset-0 blur-2xl bg-orange-300/40 rounded-full scale-125"></div>
          <User className="h-14 w-14 text-[#FFE6BF] relative" />
        </div>
      </div>

      {/* User Information */}
      <Card className="p-6 mb-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-black shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#000000]">Personal Information</h2>

          <Button variant="ghost" size="icon" className="hover:bg-white rounded-full">
            <Edit2 className="h-5 w-5 text-[#2E3E4E]" />
          </Button>
        </div>

        <div className="space-y-4">
          {Object.entries(displayData).map(([key, value], index) => (
            <div key={key}>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black-600 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="text-sm font-semibold text-[#2E3E4E]">{value}</span>
              </div>

              {index !== Object.entries(displayData).length - 1 && (
                <Separator className="my-3 bg-gray-300/40" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <Button
              variant="ghost"
              className="w-full flex justify-start items-centre gap-2 p-4 rounded-xl bg-white/60 hover:bg-white shadow-sm text-[#000000] font-medium border border-black mb-2"
            >
              <item.icon className="h-5 w-5 text-[#000000] border-black" />
              {item.label}
            </Button>
          </Link>
        ))}
      </div>

    </div>
  </div>
);
}


