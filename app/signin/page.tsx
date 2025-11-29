"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  // Update the handleSubmit function to store user data from the response
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("handleSubmit called")
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8080/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      body: JSON.stringify(formData),
      })

      const data = await response.json()

      console.log("Response data:", data)

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Save tokens to localStorage
      localStorage.setItem("accessToken", data.data.accessToken)
      localStorage.setItem("refreshToken", data.data.refreshToken)

      // Save user data to localStorage for account page
      if (data.data.user) {
        // Create a standardized user data object
        console.log("User data:", data.data.user)

        const userDetails = data.data.user
        const formattedUserData = {
          name: userDetails.name || userDetails.fullName || "Not provided",
          age: userDetails.age || "Not provided",
          contact: userDetails.contact || "Not provided",
          email: userDetails.email || "Not provided",
          bloodGroup: userDetails.bloodGroup || "Not provided",
        }

        localStorage.setItem("userData", JSON.stringify(formattedUserData))
      }

      console.log("Stored access token:", localStorage.getItem("accessToken"))
      console.log("Stored refresh token:", localStorage.getItem("refreshToken"))

      toast.success("Login successful!")
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Failed to login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

return (
  <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#F5E9DA] to-[#FFF2DF] px-4">
    <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-[#F5E9DA]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1B1B1B]">Login</h1>
        <p className="text-sm text-[#000000] mt-1">
          Access your DISHA account securely
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
            <p>{error}</p>
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-[#1B1B1B]">
            Email
          </label>
          <input
            id="email"
            placeholder="Enter your email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-[#E8E8E8] bg-[#F9FBFF] px-3 py-2 text-[#000000] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-[#000000]">
            Password
          </label>
          <input
            id="password"
            placeholder="Enter your password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-[#E8E8E8] bg-[#F9FBFF] px-3 py-2 text-[#1B1B1B] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent"
          />
        </div>

        {/* Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 accent-[#F5A623] border-[#D35400] rounded-md focus:ring-[#F5A623]"
          />
          <label htmlFor="terms" className="text-sm text-[#1B1B1B]/90">
            I agree to share this information.
          </label>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 font-semibold text-white rounded-lg shadow-md bg-gradient-to-r from-[#F5A623] to-[#D35400] hover:opacity-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Forgot Password */}
      <div className="text-center mt-6">
        <Link
          href="/forgot-password"
          className="text-sm text-[#000000] underline underline-offset-4 hover:text-[#144F59] transition-colors"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  </main>
);
}