"use client"

import Image from "next/image"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StartPage() {
  const router = useRouter()

  // Auto redirect after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/location-permission")
    }, 2500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/map-background.png"
          alt="Map Background"
          fill
          className="object-cover opacity-80 animate-fadeIn"
          priority
        />
      </div>

      {/* Logo + App Name Container */}
      <div className="relative z-10 flex flex-col items-center animate-splashFade">
        <div className="w-72 h-72 relative">
          <Image 
            src="/disha-logo.png" 
            alt="DISHA Logo" 
            fill 
            className="object-contain" 
            priority 
          />
        </div>

        <h1 className="text-5xl font-bold text-black mt-4 tracking-wide">
          DISHA
        </h1>
      </div>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes splashFade {
          0% { opacity: 0; transform: scale(0.9); }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: scale(1.03); }
        }

        .animate-splashFade {
          animation: splashFade 3.0s ease-in-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0.6; }
          to { opacity: 0.8; }
        }

        .animate-fadeIn {
          animation: fadeIn 1.5s ease-in-out forwards;
        }
      `}</style>
    </main>
  )
}
