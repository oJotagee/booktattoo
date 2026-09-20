"use client"

import * as React from "react"
import { cn } from "cn"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"

import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  canScrollPrev: boolean
  canScrollNext: boolean
  selectedIndex: number
  scrollSnaps: number[]
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
    setSelectedIndex(api.selectedScrollSnap())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api]
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    setScrollSnaps(api.scrollSnapList())
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("reInit", (api) => setScrollSnaps(api.scrollSnapList()))
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollSnaps,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "inset-y-0 -left-12 my-auto"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "inset-y-0 -right-12 my-auto"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

function CarouselSlider({ className, ...props }: React.ComponentProps<"div">) {
  const { api, orientation, selectedIndex, scrollSnaps, scrollTo } =
    useCarousel()
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [progress, setProgress] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)

  React.useEffect(() => {
    if (!api) return

    const onScroll = () => {
      setProgress(Math.min(1, Math.max(0, api.scrollProgress())))
    }

    onScroll()
    api.on("scroll", onScroll)
    api.on("reInit", onScroll)

    return () => {
      api.off("scroll", onScroll)
      api.off("reInit", onScroll)
    }
  }, [api])

  const thumbWidthPercent = scrollSnaps.length
    ? Math.min(40, Math.max(12, 100 / scrollSnaps.length))
    : 20

  const scrollToRatio = React.useCallback(
    (ratio: number) => {
      if (!scrollSnaps.length) return
      const clamped = Math.min(1, Math.max(0, ratio))
      const targetIndex = Math.round(clamped * (scrollSnaps.length - 1))
      scrollTo(targetIndex)
    },
    [scrollSnaps, scrollTo]
  )

  const ratioFromPointer = React.useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    if (rect.width <= 0) return 0
    const ratio = (clientX - rect.left) / rect.width
    return Math.min(1, Math.max(0, ratio))
  }, [])

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Pointer capture isn't critical; ignore if unsupported.
      }
      setIsDragging(true)
      scrollToRatio(ratioFromPointer(event.clientX))
    },
    [ratioFromPointer, scrollToRatio]
  )

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return
      scrollToRatio(ratioFromPointer(event.clientX))
    },
    [isDragging, ratioFromPointer, scrollToRatio]
  )

  const handlePointerUp = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        // No-op: capture may already be released.
      }
      setIsDragging(false)
    },
    []
  )

  if (orientation !== "horizontal") return null
  if (scrollSnaps.length <= 1) return null

  const thumbLeft = progress * (100 - thumbWidthPercent)

  return (
    <div
      ref={trackRef}
      data-slot="carousel-slider"
      role="slider"
      aria-label="Navegar pelo carrossel"
      aria-valuenow={selectedIndex + 1}
      aria-valuemin={1}
      aria-valuemax={scrollSnaps.length || 1}
      tabIndex={0}
      className={cn(
        "relative mt-4 h-1.5 w-full cursor-pointer touch-none rounded-full bg-white/10",
        className
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      {...props}
    >
      <div
        data-slot="carousel-slider-thumb"
        className={cn(
          "absolute inset-y-0 rounded-full bg-orange-600/80",
          !isDragging && "transition-[left] duration-150 ease-out"
        )}
        style={{ width: `${thumbWidthPercent}%`, left: `${thumbLeft}%` }}
      />
    </div>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselSlider,
  useCarousel,
}
