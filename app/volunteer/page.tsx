"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"

export default function VolunteerPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    contactDetails: "",
    address: "",
    city: "",
    state: "",
  })
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  // Add a loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
      setImageFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true) // Set loading state to true when submission starts

    const formDataToSend = new FormData()
    formDataToSend.append("fullName", formData.fullName)
    formDataToSend.append("contactDetails", formData.contactDetails)
    formDataToSend.append("address", formData.address)
    formDataToSend.append("city", formData.city)
    formDataToSend.append("state", formData.state)
    if (imageFile) {
      formDataToSend.append("avatar", imageFile)
    }

    try {
      const response = await fetch("http://localhost:8080/api/v1/volunteer", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("Failed to register volunteer")
      }

      setShowSuccess(true)
      toast.success("Thank you for volunteering! Your details have been recorded.")
    } catch (error) {
      console.error(error)
      toast.error("There was a problem submitting your registration.")
    } finally {
      setIsSubmitting(false) // Reset loading state when done (success or error)
    }
  }

 return (
  <main className="flex min-h-screen flex-col p-4 bg-[#FFF2DF]">

    {/* Submitting Loader */}
    {isSubmitting && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
        <Card className="p-6 max-w-sm mx-auto bg-white/80 shadow-xl rounded-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDB813]"></div>
            <p className="text-lg text-black font-semibold">Recording your response...</p>
            <p className="text-sm text-gray-600 text-center">Please wait while we process your registration</p>
          </div>
        </Card>
      </div>
    )}

    {/* Header */}
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
      <h1 className="text-2xl font-bold text-[#000000]">Volunteer Registration</h1>
    </div>

    {/* Success Message */}
    {showSuccess ? (
      <Card className="p-6 text-center space-y-4 bg-white/70 backdrop-blur-xl shadow-md rounded-2xl">
        <div className="text-6xl">🤝</div>
        <h2 className="text-2xl font-bold text-[#000000]">Thank You!</h2>
        <p className="text-gray-700">
          Your willingness to help makes our community stronger. We will contact you soon.
        </p>
        <Button
          className="w-full mt-4 bg-[#FDB813] text-black hover:bg-[#e6a40e] text-lg font-bold rounded-xl"
          onClick={() => setShowSuccess(false)}
        >
          Register Another Volunteer
        </Button>
      </Card>
    ) : (
      
      <form onSubmit={handleSubmit} className="space-y-8 max-w-md mx-auto">

        {/* Input Card */}
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/30 shadow-lg space-y-5">

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-lg font-semibold text-[#000000]">Full Name</Label>
            <Input
              id="fullName"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="h-12 rounded-xl bg-white border border-black text-black px-4"
              placeholder="Enter full name"
            />
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <Label htmlFor="contactDetails" className="text-lg font-semibold text-[#000000]">Contact Details</Label>
            <Input
              id="contactDetails"
              required
              value={formData.contactDetails}
              onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })}
              className="h-12 rounded-xl bg-white border border-black text-black px-4"
              placeholder="Phone number or email"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-lg font-semibold text-[#000000]">Address</Label>
            <Input
              id="address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="h-12 rounded-xl bg-white border border-black text-black px-4"
              placeholder="Street address"
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-lg font-semibold text-[#000000]">City</Label>
            <Input
              id="city"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="h-12 rounded-xl bg-white border border-black text-black px-4"
              placeholder="City name"
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state" className="text-lg font-semibold text-[#000000]">State</Label>
            <Input
              id="state"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="h-12 rounded-xl bg-white border border-black text-black px-4"
              placeholder="State name"
            />
          </div>

          {/* Profile Photo */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-[#000000]">Profile Photo</Label>
            <Card className="p-4 bg-white/70 rounded-xl border border-black shadow-sm">
              <div className="flex items-center justify-center">
                {image ? (
                  <div className="relative w-32 h-32">
                    <Image
                      src={image}
                      alt="Preview"
                      fill
                      className="rounded-full object-cover shadow-md"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center shadow-inner">
                    <Upload className="h-8 w-8 text-gray-500" />
                  </div>
                )}
              </div>

              <input type="file" id="photo" accept="image/*" className="hidden" onChange={handleImageChange} />

              <Button
                type="button"
                variant="outline"
                className="w-full mt-4 bg-[#FFE0B2] hover:bg-[#f5c77f] text-black font-medium rounded-xl"
                onClick={() => document.getElementById("photo")?.click()}
              >
                Upload Photo
              </Button>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[#FDB813] text-white font-bold text-lg py-5 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#D35400] shadow-lg hover:opacity-95 transition"
        >
          Submit Registration
        </Button>
      </form>
    )}
  </main>
)
}
