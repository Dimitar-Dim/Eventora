"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { SeatStatus, ISeatState } from "@/types/seat"

export type SeatingLayoutType = "NONE" | "FLOOR" | "FLOOR_BALCONY"

interface VenueMapProps {
  hasSeating: boolean
  seatingLayout: SeatingLayoutType
  seatedCapacity: number
  standingCapacity: number
  onSeatSelect?: (info: { sector: string; seat: number } | null) => void
  onToggleSeat?: (seat: Seat) => void
  selectedSeats?: Array<{ sector: string; seat: number }>
  seatStates?: Map<string, ISeatState>
  reservedSeats?: Set<string>
  purchasedSeats?: Set<string>
}

type Seat = { sector: string; seatNum: number }
type SectorSeatMap = Record<string, Seat[]>

const buildSector = (sector: string, count = 100): Seat[] =>
  Array.from({ length: count }, (_, i) => ({ sector, seatNum: i + 1 }))

function SectorGrid({
  label,
  seats,
  tone,
  selectedKeys,
  onSelect,
  seatStates,
  rows = 5,
  cols = 20,
  className = "",
}: {
  label: string
  seats: Seat[]
  tone: "floor" | "balcony"
  selectedKeys: string[]
  onSelect: (seat: Seat) => void
  seatStates?: Map<string, ISeatState>
  rows?: number
  cols?: number
  className?: string
}) {
  const isFloor = tone === "floor"

  const getSeatClassName = (seat: Seat, selected: boolean): string => {
    const key = `${seat.sector}-${seat.seatNum}`
    const seatState = seatStates?.get(key)

    // Purchased seats - gray and disabled
    if (seatState?.status === "purchased") {
      return "bg-gray-400/40 border border-gray-500/20 cursor-not-allowed opacity-50"
    }

    // Reserved by others - orange/amber and disabled
    if (seatState?.status === "reserved") {
      return "bg-amber-500/60 border border-amber-400/40 cursor-not-allowed"
    }

    // Selected by current user
    if (selected) {
      const base = isFloor
        ? "bg-primary/80 border border-primary-foreground/20"
        : "bg-violet-500/80 border border-violet-200/30"
      return `${base} ring-2 ring-offset-[1px] ring-offset-background ring-amber-300`
    }

    // Available seats
    const base = isFloor
      ? "bg-primary/80 border border-primary-foreground/20"
      : "bg-violet-500/80 border border-violet-200/30"

    const hover = isFloor
      ? "hover:bg-primary hover:shadow-primary/40"
      : "hover:bg-violet-500 hover:shadow-violet-400/40"

    return `${base} ${hover}`
  }

  return (
    <div
      className={`flex w-full max-w-[320px] flex-col items-center gap-1 mx-auto ${className}`}
    >
      <span
        className={`text-[10px] font-bold ${
          isFloor ? "text-primary/80" : "text-violet-300"
        }`}
      >
        {label}
      </span>
      <div
        className="grid w-full gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {seats.map((seat) => {
          const key = `${seat.sector}-${seat.seatNum}`
          const selected = selectedKeys.includes(key)
          const seatState = seatStates?.get(key)
          const isDisabled = seatState?.status === "purchased" || seatState?.status === "reserved"

          return (
            <button
              key={key}
              type="button"
              aria-label={`Sector ${seat.sector}, Seat ${seat.seatNum}`}
              disabled={isDisabled}
              className={`aspect-square w-full rounded-[3px] shadow-sm transition-all duration-150 ${getSeatClassName(seat, selected)}`}
              onClick={() => !isDisabled && onSelect(seat)}
            />
          )
        })}
      </div>
    </div>
  )
}

export function VenueMap({
  hasSeating,
  seatingLayout,
  seatedCapacity,
  standingCapacity,
  onSeatSelect,
  onToggleSeat,
  selectedSeats,
  seatStates,
  reservedSeats,
  purchasedSeats,
}: VenueMapProps) {
  const [internalSelected, setInternalSelected] = useState<Seat[]>([])

  const hasBalcony = seatingLayout === "FLOOR_BALCONY"

  const { floorSectors, balconySectors } = useMemo(() => {
    const floor: SectorSeatMap = {
      A: buildSector("A", 100),
      B: buildSector("B", 100),
      C: buildSector("C", 100),
    }

    const balcony: SectorSeatMap = hasBalcony
      ? {
          D: buildSector("D", 100),
          E: buildSector("E", 100),
          F: buildSector("F", 100),
        }
      : {}

    return { floorSectors: floor, balconySectors: balcony }
  }, [hasBalcony])

  if (!hasSeating) {
    return (
      <div className="rounded-lg border border-border/50 bg-background/50 p-3 text-sm text-muted-foreground">
        <p className="mb-1 font-semibold text-foreground">Standing room only</p>
        <p>
          This venue is configured for standing tickets. Capacity:{" "}
          <span className="font-semibold">{standingCapacity}</span>.
        </p>
      </div>
    )
  }

  const effectiveSelectedSeats: Seat[] = selectedSeats
    ? selectedSeats.map((s) => ({ sector: s.sector, seatNum: s.seat }))
    : internalSelected

  const effectiveSelected = effectiveSelectedSeats.map(
    (s) => `${s.sector}-${s.seatNum}`,
  )

  const standingSelections = effectiveSelectedSeats.filter(
    (s) => s.sector === "Standing",
  )
  const standingSelected = standingSelections.length > 0
  const maxStandingSeat = standingSelections.reduce(
    (max, seat) => Math.max(max, seat.seatNum),
    0,
  )

  const handleSeatSelect = (seat: Seat) => {
    const key = `${seat.sector}-${seat.seatNum}`

    if (onToggleSeat) {
      onToggleSeat(seat)
    } else {
      setInternalSelected((prev) => {
        const exists = prev.some((s) => `${s.sector}-${s.seatNum}` === key)
        if (exists) return prev.filter((s) => `${s.sector}-${s.seatNum}` !== key)
        return [...prev, seat]
      })
    }

    onSeatSelect?.({ sector: seat.sector, seat: seat.seatNum })
  }

  const handleSelectedClick = (seatKey: string) => {
    const [sector, seatNumRaw] = seatKey.split("-")
    const seatNum = Number(seatNumRaw)
    const seat: Seat = { sector, seatNum }
    handleSeatSelect(seat)
  }

  const handleStandingClick = () => {
    if (standingCapacity <= 0) return

    const nextSeatNum =
      standingSelected && standingSelections.length >= standingCapacity
        ? maxStandingSeat
        : maxStandingSeat + 1

    const seat: Seat = { sector: "Standing", seatNum: nextSeatNum }

    if (onToggleSeat) {
      onToggleSeat(seat)
    } else {
      setInternalSelected((prev) => {
        const key = `${seat.sector}-${seat.seatNum}`
        const exists = prev.some((s) => `${s.sector}-${s.seatNum}` === key)

        if (
          standingSelections.length >= standingCapacity &&
          standingSelected
        ) {
          return prev.filter(
            (s) => !(s.sector === "Standing" && s.seatNum === maxStandingSeat),
          )
        }

        if (exists)
          return prev.filter((s) => `${s.sector}-${s.seatNum}` !== key)
        return [...prev, seat]
      })
    }

    onSeatSelect?.({ sector: seat.sector, seat: seat.seatNum })
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-foreground">Venue map</p>
        <Badge
          variant="outline"
          className="border-primary/50 text-xs text-primary"
        >
          {seatingLayout.replace("_", " + ")}
        </Badge>
        <p className="text-xs text-muted-foreground">
          Seated {seatedCapacity} • Standing {standingCapacity}
        </p>
        {effectiveSelected.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            Selected: {effectiveSelected.join(", ")}
          </Badge>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-[2.8fr_1fr]">
        <div className="relative aspect-[5/4] md:aspect-[4/3] min-h-[320px] md:min-h-[380px] lg:min-h-[440px] overflow-hidden rounded-lg border border-border/60 bg-gradient-to-b from-background via-background to-muted/20">
          <div className="absolute inset-x-3 top-2 flex h-8 items-center justify-center rounded border-2 border-primary bg-primary/30">
            <span className="text-xs font-bold text-primary-foreground">
              Stage
            </span>
          </div>

          <div className="absolute inset-x-3 top-14 bottom-4 flex flex-col gap-2">
            <div className="flex flex-1 min-h-[160px] items-stretch gap-2">
              {/* D (balcony left) */}
              {hasBalcony && (
                <div className="flex flex-[0.6] items-start justify-center">
                  <SectorGrid
                    label="D"
                    seats={balconySectors.D}
                    tone="balcony"
                    selectedKeys={effectiveSelected}
                    onSelect={handleSeatSelect}
                    seatStates={seatStates}
                    rows={20}
                    cols={5}
                    className="w-full max-w-[75px]"
                  />
                </div>
              )}

              {/* A (floor left) */}
              <div className="flex flex-[0.6] items-start justify-center">
                <SectorGrid
                  label="A"
                  seats={floorSectors.A}
                  tone="floor"
                  selectedKeys={effectiveSelected}
                  onSelect={handleSeatSelect}
                  seatStates={seatStates}
                  rows={20}
                  cols={5}
                  className="w-full max-w-[75px]"
                />
              </div>

              {/* Standing + B + E in center column */}
              <div className="flex flex-[2.4] flex-col gap-2">
                <div className="flex flex-[1.6] items-stretch justify-center">
                  <button
                    type="button"
                    onClick={handleStandingClick}
                    aria-pressed={standingSelected}
                    className={`flex h-full w-full items-center justify-center rounded border-2 border-amber-500/70 bg-amber-400/20 px-4 py-6 text-center text-[11px] font-semibold text-amber-100 shadow-inner transition-all duration-150 hover:bg-amber-400/30 hover:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1 focus:ring-offset-background ${
                      standingSelected
                        ? "ring-2 ring-amber-300 ring-offset-1 ring-offset-background"
                        : ""
                    }`}
                  >
                    Standing
                  </button>
                </div>
                <div className="flex flex-[0.85] items-start justify-center">
                  <SectorGrid
                    label="B"
                    seats={floorSectors.B}
                    tone="floor"
                    selectedKeys={effectiveSelected}
                    onSelect={handleSeatSelect}
                    seatStates={seatStates}
                    rows={5}
                    cols={20}
                    className="w-full max-w-[550px]"
                  />
                </div>
                {hasBalcony && (
                  <div className="flex flex-[0.85] items-start justify-center">
                    <SectorGrid
                      label="E"
                      seats={balconySectors.E}
                      tone="balcony"
                      selectedKeys={effectiveSelected}
                      onSelect={handleSeatSelect}
                      seatStates={seatStates}
                      rows={5}
                      cols={20}
                      className="w-full max-w-[550px]"
                    />
                  </div>
                )}
              </div>

              {/* C (floor right) */}
              <div className="flex flex-[0.6] items-start justify-center">
                <SectorGrid
                  label="C"
                  seats={floorSectors.C}
                  tone="floor"
                  selectedKeys={effectiveSelected}
                  onSelect={handleSeatSelect}
                  seatStates={seatStates}
                  rows={20}
                  cols={5}
                  className="w-full max-w-[75px]"
                />
              </div>

              {/* F (balcony right) */}
              {hasBalcony && (
                <div className="flex flex-[0.6] items-start justify-center">
                  <SectorGrid
                    label="F"
                    seats={balconySectors.F}
                    tone="balcony"
                    selectedKeys={effectiveSelected}
                    onSelect={handleSeatSelect}
                    seatStates={seatStates}
                    rows={20}
                    cols={5}
                    className="w-full max-w-[75px]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend / capacity */}
        <div className="space-y-2 text-xs">
          <div className="rounded-lg border border-border/50 bg-background/80 p-2.5">
            <p className="mb-1 font-semibold text-foreground">Legend</p>
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-primary/90 border border-primary-foreground/30" />
              <span className="text-[11px] text-muted-foreground">
                Available
              </span>
            </div>
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-amber-500/60 border border-amber-400/40" />
              <span className="text-[11px] text-muted-foreground">
                Reserved (15min)
              </span>
            </div>
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-gray-400/40 border border-gray-500/20" />
              <span className="text-[11px] text-muted-foreground">
                Sold out
              </span>
            </div>
            {hasBalcony && (
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-sm bg-violet-500/80 border border-violet-200/40" />
                <span className="text-[11px] text-muted-foreground">
                  Balcony seats
                </span>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border/50 bg-background/80 p-2.5">
            <p className="mb-1 font-semibold text-foreground">Capacity</p>
            <p className="text-[11px] text-muted-foreground">
              Seated: {seatedCapacity}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Standing: {standingCapacity}
            </p>

            {effectiveSelectedSeats.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {effectiveSelectedSeats.map((s) => {
                  const key = `${s.sector}-${s.seatNum}`
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectedClick(key)}
                      className="rounded border border-primary/50 bg-primary/10 px-2 py-1 text-[10px] text-primary hover:bg-primary/20 transition-colors"
                    >
                      {key} ✕
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
