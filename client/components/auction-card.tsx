"use client"

import { Auction, Bid } from "@/lib/types"
import { CountdownTimer } from "@/components/countdown-timer"
import { Button } from "@/components/ui/button"
import { BidDialog } from "@/components/bid-dialog"
import { AuctionDetailsDialog } from "@/components/auction-details-dialog"
import { cn } from "@/lib/utils"
import { FinalizeDialog } from "./finalize-dialog"

interface AuctionCardProps {
  auction: Auction
  variant?: "default" | "compact"
  showBidButton?: boolean
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
  setTransactionHash: (hash: string) => void;
  setTransactionStatus: (status: number) => void;
}

const stateStyles = {
  "Committing Phase": "bg-commit text-commit-foreground",
  "Revealing Phase": "bg-reveal text-reveal-foreground",
  "Finalization Pending": "bg-finished text-finished-foreground",
  "Finished": "bg-finished text-finished-foreground"
}

export function AuctionCard({ auction, variant = "default", showBidButton = false, setRefresh, setTransactionHash, setTransactionStatus}: AuctionCardProps) {
  const getRelevantCountdown = () => {
    switch (auction.state) {
      case "Committing Phase":
        return { date: auction.commitEndTime, label: "Commit ends" }
      case "Revealing Phase":
        return { date: auction.revealEndTime, label: "Reveal ends" }
      default:
        return null
    }
  }

  const countdown = getRelevantCountdown()

  if (variant === "compact") {
    return (
      <div className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{"AUC-ID "+auction.auctionId}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", stateStyles[auction.state])}>
              {auction.state}
            </span>
          </div>
          <p className="truncate text-sm font-medium break-words">{auction.description}</p>
        </div>
        {countdown && (
          <div className="shrink-0 text-right">
            <CountdownTimer targetDate={countdown.date} label={countdown.label} onExpire={() => {setRefresh(r => r + 1)}} compact />
          </div>
        )}
      </div>
    )
  }


  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className={cn("rounded-full px-3 py-1 text-xs font-medium", stateStyles[auction.state])}>
          {auction.state}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{"AUC-ID "+auction.auctionId}</span>
      </div>

      <p className="mb-4 flex-1 text-sm leading-relaxed break-words">
        {auction.description}
      </p>

      <div className="mb-4 space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Seller</span>
          <span className="font-mono text-xs">{auction.seller.slice(0,12)+"."+auction.seller.slice(-8)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Started</span>
          <span className="text-xs">
            {auction.startTime.toLocaleDateString("en-US", { 
              month: "short", 
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </span>
        </div>
      </div>

      {countdown ? (
        <div className="rounded-lg bg-muted/50 px-4 py-3">
          <CountdownTimer targetDate={countdown.date} label={countdown.label} onExpire={() => {setRefresh(r => r + 1)}}/>
        </div>
      ) : (
        <div className="rounded-lg bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
          Auction ended
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <AuctionDetailsDialog auction={auction}>
          <Button variant={showBidButton && auction.state === "Committing Phase" ? "default" : "default"} className="flex-1">
            Auction Details
          </Button>
        </AuctionDetailsDialog>
        {showBidButton && auction.state === "Committing Phase" && (
          <BidDialog auction={auction} setTransactionHash={setTransactionHash} setTransactionStatus={setTransactionStatus} >
            <Button className="flex-1" variant="default">Place a Bid</Button>
          </BidDialog>
        )}
        {auction.state === "Finalization Pending" && (
          <FinalizeDialog auction={auction} setTransactionHash={setTransactionHash} setTransactionStatus={setTransactionStatus}  >
            <Button className="flex-1" variant="default">Finalize</Button>
          </FinalizeDialog>
        )}
      </div>
    </div>
  )
}
