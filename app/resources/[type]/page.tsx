import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

const disasterInfo = {
  earthquake: {
    title: "Earthquake Safety",
    image: "/earthquake-safety.jpg",
    tips: [ 
      "Drop, Cover, and Hold On.",
      "Stay away from windows and falling objects.",
      "If outdoors, move to an open area.",
      "Be prepared for aftershocks.",
    ],
  },
  tsunami: {
    title: "Tsunami Safety",
    image: "/tsunami-safety.jpg",
    tips: [
      "Move to higher ground immediately.",
      "Follow evacuation orders.",
      "Stay away from the coast.",
      "Wait for official all-clear before returning.",
    ],
  },
  flood: {
    title: "Flood Safety",
    image: "/flood-safety.jpg",
    tips: [
      "Move to higher ground.",
      "Avoid walking or driving through flood waters.",
      "Be prepared to evacuate.",
      "Follow official instructions.",
    ],
  },
  wildfire: {
    title: "Wildfire Safety",
    image: "/wildfire-safety.jpg",
    tips: [
      "Evacuate immediately if ordered.",
      "Create a defensible space around your home.",
      "Have an emergency kit ready.",
      "Stay informed about fire conditions.",
    ],
  },
  hurricane: {
    title: "Hurricane Safety",
    image: "/hurricane-safety.jpg",
    tips: [
      "Prepare an emergency kit.",
      "Board up windows and secure outdoor items.",
      "Follow evacuation orders.",
      "Stay indoors during the storm.",
    ],
  },
  "heavy-rainfall" : {
    title: "Heavy Rainfall Safety",
    image: "/heavy-rainfall-safety.jpg",
    tips: [
      "Stay indoors if possible.",
      "Avoid flooded areas.",
      "Be cautious of landslides.",
      "Have emergency supplies ready.",
    ],
  },
  thunderstorm: {
    title: "Thunderstorm Safety",
    image: "/thunderstorm-safety.jpg",
    tips: [
      "Seek shelter indoors.",
      "Stay away from windows and electrical equipment.",
      "Avoid using corded phones.",
      "Wait 30 minutes after the last thunder before going outside.",
    ],
  },
  "health-kit": {
    title: "Emergency Health Kit",
    image: "/health-kit.jpg",
    tips: [
      "Include first-aid supplies.",
      "Pack essential medications.",
      "Include personal hygiene items.",
      "Don't forget important medical documents.",
    ],
  },
}

export default function DisasterInfoPage({ params }: { params: { type: string } }) {
  const info = disasterInfo[params.type as keyof typeof disasterInfo]

  if (!info) {
    return <div>Information not found</div>
  }

  return (
    <main className="flex min-h-screen flex-col p-4">
      <div className="flex items-center gap-2 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/resources">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{info.title}</h1>
      </div>

      <div className="space-y-4">
      <div className="relative w-full h-[440px]">
  <Image src={info.image || "/placeholder.svg"} alt={info.title} fill className="object-contain rounded-lg" />
</div>
<div className="bg-yellow-300 p-4 rounded-lg font-bold text-lg">
          <h2 className="text-xl font-semibold">Safety Tips:-</h2>
          <ul className="list-disc pl-5 space-y-2">
            {info.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div> 
      </div>
    </main>
  )
}

