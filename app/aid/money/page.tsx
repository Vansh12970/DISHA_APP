"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"

interface MoneyDonationFormData {
  name: string
  contact: string
}

export default function MoneyDonationPage() {
  const [formData, setFormData] = useState<MoneyDonationFormData>({
    name: "",
    contact: "",
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

      const response = await fetch("http://localhost:8080/api/v1/money/make-moneyDonation", {
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
          const retryResponse = await fetch("http://localhost:8080/api/v1/money/make-moneyDonation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newAccessToken}`,
            },
            body: JSON.stringify(formData),
          })

          if (!retryResponse.ok) {
            throw new Error("Failed to submit money donation request")
          }
        } else {
          throw new Error("Session expired. Please login again.")
        }
      } else if (!response.ok) {
        throw new Error("Failed to submit money donation request")
      }

      // Reset form after successful submission
      setFormData({
        name: "",
        contact: "",
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to submit money donation request. Please try again.")
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/refresh-token`, {
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

  if (showThankYou) {
    return (
      <main className="flex min-h-screen flex-col p-4 bg-[#FFF2DF] items-center justify-center">
        <Card className="w-full max-w-md p-6 bg-white shadow-lg">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black">Thank You!</h2>
            <p className="text-gray-600">Your money donation has been processed successfully.</p>
            <p className="text-gray-600">Your generosity will help those in need.</p>
            <Button
              onClick={() => setShowThankYou(false)}
              className="mt-4 bg-[#FDB813]/70 text-black font-bold hover:bg-[#FDB813]/90"
            >
              Make Another Donation
            </Button>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/aid">Return to Donations</Link>
            </Button>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col p-4 bg-[#FFF2DF]">
      <div className="flex items-center gap-2 mb-6">
        <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/70 backdrop-blur-md shadow-md hover:bg-white"
              >
          <Link href="/aid">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Money Donation</h1>
      </div>

      <div className="space-y-6">
        <div className="aspect-square w-full max-w-sm mx-auto relative">
          <Image
            src="/placeholder.svg?height=400&width=400"
            alt="QR Code for donation"
            fill
            className="object-contain"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg text-black font-semibold">
              Full Name
            </Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="text-black placeholder:text-black/70"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact" className="text-lg text-black font-semibold">
              Contact Number
            </Label>
            <Input
              id="contact"
              type="tel"
              required
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="text-black placeholder:text-black/70"
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#FDB813] text-white text-lg font-bold py-4 rounded-xl hover:bg-[#e0a40e] shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Confirm Donation"}
          </Button>
        </form>
      </div>
    </main>
  )
}

