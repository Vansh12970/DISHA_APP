export default function Loading() {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="inline-grid grid-cols-2 gap-1">
            <div className="h-8 w-8 bg-[#2E7D32]"></div>
            <div className="h-8 w-8 bg-[#FDB813]"></div>
            <div className="h-8 w-8 bg-[#FDB813]"></div>
            <div className="h-8 w-8 bg-[#2E7D32]"></div>
          </div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }
  
  