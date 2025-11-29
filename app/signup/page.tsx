"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const genders = ["Male", "Female", "Other"]

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    password: "",
    username: "",
    address: "",
    pincode: "",
    state: "",
    city: "",
    bloodGroup: "",
    age: "",
    gender: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if all fields are filled
    const requiredFields = Object.entries(formData).filter(([key, value]) => !value)
    if (requiredFields.length > 0) {
      setError(`Please fill all required fields: ${requiredFields.map(([key]) => key).join(", ")}`)
      return
    }

    if (!termsAccepted) {
      setError("Please accept the terms to continue")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8080/api/v1/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to register")
      }

      // Store user data in localStorage for account page
      if (data.user) {
        localStorage.setItem("userData", JSON.stringify(data.user))
      }

      toast.success("Account successfully created! Please sign in to continue.")

      // Redirect to signin page instead of dashboard
      router.push("/signin")
    } catch (error: any) {
      setError(error.message || "Failed to register. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

return (
  <main className="flex min-h-screen items-center justify-center px-4 py-12 
    bg-gradient-to-b from-[#F5E9DA] to-[#FFF2DF]">

    {/* Card Container */}
    <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl 
      shadow-xl border border-[#F5E9DA] p-10 space-y-8 animate-fadeUp">

      {/* Heading */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1B1B1B] tracking-tight">
          Create New Account
        </h1>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-[#000000] font-medium">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            className="bg-[#F9FBFF] border-[#E8E8E8] text-black rounded-lg
              placeholder:text-gray-500 focus:ring-2 focus:ring-[#F5A623]"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#000000] font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            className="bg-[#F9FBFF] border-[#E8E8E8] text-black rounded-lg
              placeholder:text-gray-500 focus:ring-2 focus:ring-[#F5A623]"
          />
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <Label htmlFor="contact" className="text-[#000000] font-medium">Contact</Label>
          <Input
            id="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Enter your contact number"
            required
            className="bg-[#F9FBFF] border-[#E8E8E8] text-black rounded-lg
              placeholder:text-gray-500 focus:ring-2 focus:ring-[#F5A623]"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[#000000] font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            className="bg-[#F9FBFF] border-[#E8E8E8] text-black rounded-lg
              placeholder:text-gray-500 focus:ring-2 focus:ring-[#F5A623]"
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-[#000000] font-medium">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            className="bg-[#F9FBFF] border-[#E8E8E8] text-black rounded-lg
              placeholder:text-gray-500 focus:ring-2 focus:ring-[#F5A623]"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-[#000000] font-medium">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
            required
            className="bg-[#F9FBFF] border-[#E8E8E8] text-black rounded-lg
              placeholder:text-gray-500 focus:ring-2 focus:ring-[#F5A623]"
          />
        </div>

        {/* Pincode */}
        <div className="space-y-2">
          <Label htmlFor="pincode" className="text-[#000000] font-medium">Pincode</Label>
          <Input
            id="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="Enter your pincode"
            required
            className="bg-[#F9FBFF] border-[#E8E8E8] text-black rounded-lg
              placeholder:text-gray-500 focus:ring-2 focus:ring-[#F5A623]"
          />
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label htmlFor="state" className="text-[#000000] font-medium">State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter your state"
            required
            className="bg-[#F9FBFF] border-[#E8E8E8] text-black rounded-lg
              placeholder:text-gray-500 focus:ring-2 focus:ring-[#F5A623]"
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-[#000000] font-medium">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
            required
            className="bg-[#F9FBFF] border-[#E8E8E8] text-black rounded-lg
              placeholder:text-gray-500 focus:ring-2 focus:ring-[#F5A623]"
          />
        </div>

        {/* Blood Group */}
        <div className="space-y-2">
          <Label className="text-[#000000] font-medium">Blood Group</Label>
          <Select
            required
            value={formData.bloodGroup}
            onValueChange={(value) => handleSelectChange("bloodGroup", value)}
          >
            <SelectTrigger className="bg-[#F9FBFF] border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#F5A623]">
              <SelectValue placeholder="Select your blood group" />
            </SelectTrigger>
            <SelectContent>
              {bloodGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age" className="text-[#000000] font-medium">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            placeholder="Enter your age"
            required
            className="bg-[#F9FBFF] border-[#E8E8E8] text-black rounded-lg
              placeholder:text-gray-500 focus:ring-2 focus:ring-[#F5A623]"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="text-[#000000] font-medium">Gender</Label>
          <Select
            required
            value={formData.gender}
            onValueChange={(value) => handleSelectChange("gender", value)}
          >
            <SelectTrigger className="bg-[#F9FBFF] border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#F5A623]">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Terms */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            required
            checked={termsAccepted}
            onCheckedChange={(checked) =>
              setTermsAccepted(checked as boolean)
            }
            className="accent-[#F5A623]"
          />
          <label htmlFor="terms" className="text-sm text-[#000000]/80">
            I agree to share this information with first responders at the time of emergency.
          </label>
        </div>

        {/* Submit */}
        <Button
          className="
            w-full py-3 text-lg font-semibold text-white rounded-lg
            bg-gradient-to-r from-[#F5A623] to-[#D35400]
            hover:opacity-95 shadow-md transition-all
          "
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Button>
      </form>
    </div>
  </main>
);
}
