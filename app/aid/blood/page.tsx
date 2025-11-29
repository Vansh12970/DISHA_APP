"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"

interface BloodDonationFormData {
  name: string
  age: string
  bloodGroup: string
  address: string
}

export default function BloodDonationPage() {
  const [formData, setFormData] = useState<BloodDonationFormData>({
    name: "",
    age: "",
    bloodGroup: "",
    address: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Show thank you message immediately
    setShowThankYou(true)

    try {
      // Get access token from localStorage
      const accessToken = localStorage.getItem("accessToken")

      if (!accessToken) {
        toast.error("You need to be logged in to make a donation")
        setShowThankYou(false)
        return
      }

      const response = await fetch("http://localhost:8080/api/v1/blood/make-bloodDonation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await refreshToken()
        if (refreshed) {
          // Retry with new token
          const newAccessToken = localStorage.getItem("accessToken")
          const retryResponse = await fetch("http://localhost:8080/api/v1/blood/make-bloodDonation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newAccessToken}`,
            },
            body: JSON.stringify(formData),
          })

          if (!retryResponse.ok) {
            throw new Error("Failed to submit blood donation request")
          }
        } else {
          throw new Error("Session expired. Please login again.")
        }
      } else if (!response.ok) {
        throw new Error("Failed to submit blood donation request")
      }

      // Reset form after successful submission
      setFormData({
        name: "",
        age: "",
        bloodGroup: "",
        address: "",
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to submit blood donation request. Please try again.")
      console.error("Error:", error)
      setShowThankYou(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to refresh token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) return false

      const response = await fetch("http://localhost:8080/api/v1/users/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) return false

      const data = await response.json()
      localStorage.setItem("accessToken", data.accessToken)
      return true
    } catch (error) {
      console.error("Error refreshing token:", error)
      return false
    }
  }

// THANK YOU SCREEN
if (showThankYou) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#FFF2DF]">
      <Card className="w-full max-w-md p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-black/10">
        <div className="text-center space-y-4">
          
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-[#000000]">Thank You!</h2>

          <p className="text-gray-600 text-lg">
            Your blood donation request has been submitted successfully.
          </p>
          <p className="text-gray-600 text-lg">Your contribution can help save lives. ❤️</p>

          <Button
            onClick={() => setShowThankYou(false)}
            className="w-full mt-4 bg-[#FDB813] text-black font-bold hover:bg-[#e0a40e] rounded-xl py-3"
          >
            Make Another Donation
          </Button>

          <Button
            asChild
            variant="outline"
            className="mt-2 w-full border-[#000000] text-[#000000] font-semibold rounded-xl py-3"
          >
            <Link href="/aid">Return to Donations</Link>
          </Button>
        </div>
      </Card>
    </main>
  )
}

// MAIN FORM SCREEN
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
        <Link href="/aid">
          <ArrowLeft className="h-6 w-6 text-[#000000]" />
        </Link>
      </Button>
      <h1 className="text-2xl font-bold text-[#000000]">Blood Donation</h1>
    </div>

    {/* FORM */}
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md mx-auto">
      
      {/* FULL NAME */}
      <div className="space-y-2">
        <Label className="text-lg font-bold text-[#000000]">Full Name</Label>
        <Input
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-white/80 border border-black rounded-xl text-black placeholder:text-black/60"
        />
      </div>

      {/* AGE */}
      <div className="space-y-2">
        <Label className="text-lg font-bold text-[#000000]">Age</Label>
        <Input
          id="age"
          type="number"
          required
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          className="bg-white/80 border border-black rounded-xl text-black placeholder:text-black/60"
        />
      </div>

      {/* BLOOD GROUP */}
      <div className="space-y-2">
        <Label className="text-lg font-bold text-[#000000]">Blood Group</Label>

        <Select
          value={formData.bloodGroup}
          onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
          required
        >
          <SelectTrigger className="bg-white border border-blackr border-black rounded-xl text-black">
            <SelectValue placeholder="Select blood group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A+">A+</SelectItem>
            <SelectItem value="A-">A-</SelectItem>
            <SelectItem value="B+">B+</SelectItem>
            <SelectItem value="B-">B-</SelectItem>
            <SelectItem value="O+">O+</SelectItem>
            <SelectItem value="O-">O-</SelectItem>
            <SelectItem value="AB+">AB+</SelectItem>
            <SelectItem value="AB-">AB-</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ADDRESS */}
      <div className="space-y-2">
        <Label className="text-lg font-bold text-[#000000]">Address</Label>
        <Input
          id="address"
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="bg-white/80 border border-black rounded-xl text-black placeholder:text-black/60"
        />
      </div>

      {/* SUBMIT BUTTON */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#FDB813] text-white text-lg font-bold py-4 rounded-xl hover:bg-[#e0a40e] shadow-md"
      >
        {isSubmitting ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  </main>
)
}

