"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ChevronsUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ImageIcon, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
//import debounce from 'lodash.debounce';
const debounce: any = require('lodash.debounce');

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024 // 20MB

export default function ReportPage() {
  //const [lat, setLat] = useState(null)
  // const [lon, setLon] = useState(null)
  const [location, setLocation] = useState("")
  const [humanReadableLocation, setHumanReadableLocation] = useState("")
  const [locationError, setLocationError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string }[]>([])
  const [locationType, setLocationType] = useState("current")
  const abortControllerRef = useRef<AbortController | null>(null)
  // Update the component to include form submission, loading state, success state, and media preview
  // Add state variables for form data, loading state, and success state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Add this after the other state variables
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const [placeSuggestions, setPlaceSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const autocompleteContainerRef = useRef<HTMLDivElement | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false)

  useEffect(() => {
    if (locationType === "current") {
      getCurrentLocation()
    }
  }, [locationType])

  // Add this useEffect to load the Google Maps API and initialize the Places service
  useEffect(() => {
    if (window.google?.maps?.places) {
      // API already loaded
      autocompleteRef.current = new window.google.maps.places.AutocompleteService()
      const dummyElement = document.createElement("div")
      placesServiceRef.current = new window.google.maps.places.PlacesService(dummyElement)
      return
    }

    const googleMapsScript = document.createElement("script")
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    googleMapsScript.async = true
    googleMapsScript.defer = true

    googleMapsScript.onerror = () => {
      console.error("Failed to load Google Maps API")
      toast.error("Failed to load location search. Please try again later.")
    }

    googleMapsScript.onload = () => {
      if (!window.google?.maps?.places) {
        console.error("Google Maps Places API not available")
        return
      }

      autocompleteRef.current = new window.google.maps.places.AutocompleteService()
      const dummyElement = document.createElement("div")
      placesServiceRef.current = new window.google.maps.places.PlacesService(dummyElement)
    }

    document.head.appendChild(googleMapsScript)

    return () => {
      if (document.head.contains(googleMapsScript)) {
        document.head.removeChild(googleMapsScript)
      }
    }
  }, [apiKey])

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          setLocationError(null)

          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
            )
            const data = await response.json()
            setHumanReadableLocation(
              data.results[0]?.formatted_address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            )
          } catch (error) {
            console.error("Error fetching address:", error)
            setHumanReadableLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          let errorMessage
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location services."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable."
              break
            case error.TIMEOUT:
              errorMessage = "The request to get location timed out."
              break
            default:
              errorMessage = "An unknown error occurred while getting location."
          }
          setLocationError(errorMessage)
          setLocation("")
        },
      )
    } else {
      setLocationError("Geolocation is not supported by your browser")
    }
  }

  // Replace the handleManualLocationChange function with this updated version
  const handleManualLocationChange = useMemo(
    () =>
      debounce((input: string) => {
        if (!input || input.length < 3 || !autocompleteRef.current) {
          setPlaceSuggestions([])
          setIsLoadingPlaces(false)
          return
        }

        setIsLoadingPlaces(true)

        const request = {
          input,
          componentRestrictions: { country: "IN" },
          types: ["geocode", "establishment"],
        }

        autocompleteRef.current.getPlacePredictions(request, (predictions, status) => {
          setIsLoadingPlaces(false)

          if (status !== (window as any).google.maps.places.PlacesServiceStatus.OK || !predictions) {
            setPlaceSuggestions([])
            return
          }

          setPlaceSuggestions(predictions)
        })
      }, 300),
    [],
  )

  const validateFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error("Image size should be less than 5MB")
        return false
      }
    } else if (file.type.startsWith("video/")) {
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error("Video size should be less than 10MB")
        return false
      }
    } else {
      toast.error("Only image and video files are allowed")
      return false
    }
    return true
  }

  // Add a function to handle file selection with preview
  const handleFileSelect = (files: FileList | null) => {
    if (!files || !files[0]) return

    const file = files[0]
    if (!validateFile(file)) return

    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setFilePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Update the form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error("Please attach an image or video")
      return
    }

    if (!location) {
      toast.error("Location is required")
      return
    }

    setIsSubmitting(true)

    try {
      // Create FormData
      const formDataToSend = new FormData()

      // Add the file with the appropriate field name based on type
      if (selectedFile.type.startsWith("image/")) {
        formDataToSend.append("imageFile", selectedFile)
      } else if (selectedFile.type.startsWith("video/")) {
        formDataToSend.append("videoFile", selectedFile)
      }

      // Add other required fields
      formDataToSend.append("title", title)
      formDataToSend.append("description", description)

      // Format location as embedded object
      if (location) {
        const [lat, lon] = location.split(",").map((coord) => Number.parseFloat(coord.trim()))
        formDataToSend.append(
          "location",
          JSON.stringify({
            lat: lat,
            lon: lon,
          }),
        )
      }

      // Determine the appropriate endpoint based on file type
      const endpoint = selectedFile.type.startsWith("image/")
        ? "http://localhost:8080/api/v1/images/image-report"
        : "http://localhost:8080/api/v1/videos/video-report"

      // Send the request
      const response = await fetch(endpoint, {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      // Show success state
      setShowSuccess(true)
      setUploadedFiles((prev) => [...prev, { name: selectedFile.name, type: selectedFile.type }])
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload report")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    const file = files[0]
    if (!file || !validateFile(file)) return

    setIsUploading(true)
    setUploadProgress(0)
    abortControllerRef.current = new AbortController()

    try {
      // Create FormData
      const formDataToSend = new FormData()

      // Add the file with the appropriate field name based on type
      if (file.type.startsWith("image/")) {
        formDataToSend.append("imageFile", file)
      } else if (file.type.startsWith("video/")) {
        formDataToSend.append("videoFile", file)
      }

      // Add other required fields
      const titleElement = document.getElementById("post-title") as HTMLInputElement
      const descriptionElement = document.getElementById("post-description") as HTMLInputElement
      formDataToSend.append("title", titleElement?.value || "")
      formDataToSend.append("description", descriptionElement?.value || "")

      // Format location as embedded object
      if (location) {
        const [lat, lon] = location.split(",").map((coord) => Number.parseFloat(coord.trim()))
        formDataToSend.append(
          "location",
          JSON.stringify({
            lat: lat,
            lon: lon,
          }),
        )
      }

      // Determine the appropriate endpoint based on file type
      const endpoint = file.type.startsWith("image/")
        ? "http://localhost:8080/api/v1/images/image-report"
        : "http://localhost:8080/api/v1/videos/video-report"

      // Simulate upload progress
      const totalChunks = 100
      for (let i = 0; i <= totalChunks; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Upload cancelled")
        }
        await new Promise((resolve) => setTimeout(resolve, 50))
        setUploadProgress(i)
      }

      // Send the actual request
      const response = await fetch(endpoint, {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      setUploadedFiles((prev) => [...prev, { name: file.name, type: file.type }])
      toast.success("File uploaded successfully")
    } catch (error) {
      if (error instanceof Error && error.message === "Upload cancelled") {
        toast.info("Upload cancelled")
      } else {
        console.error("Upload error:", error)
        toast.error("Failed to upload file")
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      abortControllerRef.current = null
    }
  }
  const cancelUpload = () => {
    abortControllerRef.current?.abort()
  }

  // Replace the existing form with a proper form element
  // Update the return statement to include the form element and success state
  return (
  <div className="flex min-h-screen flex-col p-4 bg-gradient-to-b from-[#FCEACC] via-[#F7D7A8] to-[#F5C88A]">

    {/* SUBMITTING OVERLAY */}
    {isSubmitting && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
        <Card className="p-8 rounded-3xl glass-card border border-white/40 shadow-xl max-w-sm mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black border-[#FDB813] mx-auto"></div>
          <p className="mt-4 text-xl font-semibold text-[#000000]">Storing your report...</p>
          <p className="text-sm text-gray-600 mt-1">
            Please wait while we process your report
          </p>
        </Card>
      </div>
    )}

    {/* HEADER */}
    <div className="flex items-center gap-3 mb-6">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="rounded-full bg-white/70 backdrop-blur-md shadow-md hover:bg-white"
      >
        <Link href="/dashboard">
          <ArrowLeft className="h-6 w-6 text-[#000000]" />
        </Link>
      </Button>

      <h1 className="text-3xl font-bold text-[#000000] tracking-tight">
        Report Disaster
      </h1>
    </div>

    {/* SUCCESS MESSAGE */}
    {showSuccess ? (
      <Card className="p-8 rounded-3xl glass-card border border-white/40 shadow-xl max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">🙏</div>
        <h2 className="text-2xl font-bold text-[#000000]">Thank You!</h2>
        <p className="text-gray-600 mt-2 border-black">
          Your report helps others stay informed and safe.
        </p>

        <Button
          className="mt-6 bg-[#FDB813] text-black font-bold text-lg hover:bg-[#e3a20d] rounded-xl py-5"
          onClick={() => {
            setShowSuccess(false)
            setTitle("")
            setDescription("")
            setSelectedFile(null)
            setFilePreview(null)
          }}
        >
          Report Another Disaster
        </Button>
      </Card>
    ) : (
      <div className="mx-auto w-full max-w-md space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* LOCATION TYPE */}
          <Card className="p-5 rounded-2xl glass-card border border-black shadow-lg">
            <Label className="text-base font-bold text-[#000000]">
              Select Location Type
            </Label>

            <RadioGroup value={locationType} onValueChange={setLocationType} className="mt-3 space-y-2 border-black">
              <div className="flex items-center space-x-2 border-black">
                <RadioGroupItem value="current" id="current" />
                <Label htmlFor="current" className="text-[#000000]">
                  Use Current Location
                </Label>
              </div>

              <div className="flex items-center space-x-2 border-black">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="text-[#000000]">
                  Enter Location Manually
                </Label>
              </div>
            </RadioGroup>
          </Card>

          {/* LOCATION INPUT */}
          <div className="space-y-2 border-black">
            <label className="text-medium font-bold text-[#000000]">
              Location (Of Affected Area)
            </label>

            {locationType === "current" ? (
              locationError ? (
                <Alert variant="destructive">
                  <AlertDescription>{locationError}</AlertDescription>
                </Alert>
              ) : (
                <Input
                  readOnly
                  value={humanReadableLocation || "Fetching location..."}
                  className="rounded-xl border-black bg-white text-[#000000] border border-gray-300"
                />
              )
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between rounded-xl bg-white text-[#000000] border border-gray-300"
                  >
                    <span className="truncate flex-1 text-left">
                      {humanReadableLocation || "Search for location..."}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[300px] p-0 rounded-xl shadow-xl border border-gray-200">
                  <Input
                    placeholder="Type to search..."
                    className="rounded-none border-0 focus-visible:ring-0"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value)
                      handleManualLocationChange(e.target.value)
                    }}
                  />

                  <div className="max-h-[200px] overflow-y-auto">
                    {isLoadingPlaces ? (
                      <p className="p-4 text-center text-gray-500 text-sm">
                        Loading suggestions...
                      </p>
                    ) : placeSuggestions.length > 0 ? (
                      placeSuggestions.map((prediction) => (
                        <div
                          key={prediction.place_id}
                          className="p-4 hover:bg-gray-100 cursor-pointer border-black"
                          onClick={() => {
                            setHumanReadableLocation(prediction.description)
                            setSearchInput(prediction.description)

                            if (placesServiceRef.current && prediction.place_id) {
                              placesServiceRef.current.getDetails(
                                { placeId: prediction.place_id, fields: ["geometry"] },
                                (place, detailsStatus) => {
                                  if (
                                    detailsStatus === window.google.maps.places.PlacesServiceStatus.OK &&
                                    place?.geometry?.location
                                  ) {
                                    const lat = place.geometry.location.lat()
                                    const lng = place.geometry.location.lng()
                                    setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
                                  }
                                }
                              )
                            }
                          }}
                        >
                          <p className="font-medium text-sm">
                            {prediction.structured_formatting.main_text}
                          </p>
                          <p className="text-xs text-gray-500">
                            {prediction.structured_formatting.secondary_text}
                          </p>
                        </div>
                      ))
                    ) : null}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* TITLE */}
          <div className="space-y-2 border-black">
            <label className="font-bold text-[#000000]">Post Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Subject"
              className="rounded-xl border-black bg-white text-[#000000] placeholder:text-gray-500"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2 border-black">
            <label className="font-bold text-[#000000]">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the situation..."
              className="rounded-xl border-black min-h-[150px] text-[#000000] bg-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* FILE UPLOAD */}
          <div className="space-y-4">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*,video/*"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            <Card
              className="cursor-pointer p-6 rounded-2xl glass-card border border-black hover:bg-white/40 transition"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              {filePreview ? (
                filePreview.startsWith("data:image") ? (
                  <div className="relative w-full h-48 mb-2 border-black">
                    <Image
                      src={filePreview}
                      alt="Selected"
                      fill
                      className="object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <video src={filePreview} controls className="w-full h-48 rounded-xl object-cover mb-2 border-black" />
                )
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <ImageIcon className="h-10 w-10 mb-2 border-black opacity-70" />
                  <p className="text-sm">
                    Click to upload image (max 5MB) or video (max 15MB)
                  </p>
                </div>
              )}
            </Card>

            {/* FILE LIST */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 border-black">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 border-black text-sm text-[#000000]">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button className="w-full bg-[#FDB813] text-white font-bold text-lg py-5 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#D35400] shadow-lg hover:opacity-95 transition">
            Publish Report
          </Button>
        </form>
      </div>
    )}

  </div>
)
}