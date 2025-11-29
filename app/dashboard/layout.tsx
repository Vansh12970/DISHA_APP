import type React from "react"

// Check if user is authenticated by looking for access token
const isAuthenticated = () => {
  // This will only run on the client side
  if (typeof window !== "undefined") {
    return !!localStorage.getItem("accessToken")
  }
  return false
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This is a server component, so we can't directly access localStorage
  // We'll handle the actual redirect in the dashboard page component
  return <>{children}</>
}

