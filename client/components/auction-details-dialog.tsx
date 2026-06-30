"use client"

import { Auction, Bid } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Web3Service } from "@/lib/web3"
import { formatEther } from "ethers"

interface AuctionDetailsDialogProps {
  auction: Auction
  children: React.ReactNode
}

const stateStyles = {
  "Committing Phase": "bg-commit text-commit-foreground",
  "Revealing Phase": "bg-reveal text-reveal-foreground",
  "Finalization Pending": "bg-finished text-finished-foreground",
  "Finished": "bg-finished text-finished-foreground",
}

export function AuctionDetailsDialog({ auction, children }: AuctionDetailsDialogProps) {
  const [open, setOpen] = useState(false)

  const [web3Service, setWeb3Service] = useState<Web3Service | null>(null);
 const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        if(web3Service === null){
          const service = new Web3Service();
          await service.initialize();
          setWeb3Service(service);
          setBids(await service.getAllBids());
        } else {
            setBids(await web3Service.getAllBids());
        }
        
      } catch (error: any) {
        console.error('Failed to initialize Web3:', error);
      }
    }
    initializeWeb3();
    }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger /*asChild*/>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>Auction Details</DialogTitle>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", stateStyles[auction.state])}>
              {auction.state}
            </span>
          </div>
          <DialogDescription className="font-mono text-xs">
            {"AUC-ID "+auction.auctionId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Description</h4>
            <p className="text-sm leading-relaxed break-words">{auction.description}</p>
          </div>

          {/* Seller */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Seller</h4>
            <p className="break-all font-mono text-sm">{auction.seller}</p>
          </div>

          {/* Current State */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Current State</h4>
            <p className="break-all font-mono text-sm">{auction.state}</p>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-muted-foreground">Timeline</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm">Started</span>
                <span className="text-sm font-medium">{formatDate(auction.startTime)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-commit/10 px-4 py-3">
                <span className="text-sm">Commit Phase Ends</span>
                <span className="text-sm font-medium">{formatDate(auction.commitEndTime)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-reveal/10 px-4 py-3">
                <span className="text-sm">Reveal Phase Ends</span>
                <span className="text-sm font-medium">{formatDate(auction.revealEndTime)}</span>
              </div>
            </div>
          </div>



          {/* Placeholder stats */}
          {(auction.state === "Committing Phase"?
              <></>
              : (auction.state === "Revealing Phase" ? 
                <>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Ongoing Reveals</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-2xl font-semibold">{auction.totalBids.toString()}</div>
                    <div className="text-sm text-muted-foreground">Total Bids Currently</div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-2xl font-semibold">
                      {bids.filter(b => b.bidId === auction.highestBidID.toString())[0] ? 
                        formatEther(bids.filter(b => b.bidId === auction.highestBidID.toString())[0].amount.valueOf()) : "--"} ETH
                    </div>
                    <div className="text-sm text-muted-foreground">Highest Revealed Currently</div>
                  </div>
                </div>
                </>
                : <>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Auction Result</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-2xl font-semibold">{auction.totalBids.toString()}</div>
                    <div className="text-sm text-muted-foreground">Total Bids</div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-2xl font-semibold">
                      {bids.filter(b => b.bidId === auction.highestBidID.toString())[0] ? 
                        formatEther(bids.filter(b => b.bidId === auction.highestBidID.toString())[0].amount.valueOf()) : "--"} ETH</div>
                    <div className="text-sm text-muted-foreground">Highest Bid</div>
                  </div>
                </div>
                {auction.highestBidID === BigInt(0) ? 
                    <>
                      <p className="break-all font-mono text-sm">This auction had no bids</p>
                    </> 
                  :
                    <>
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">Winning Bid</h4>
                        <p className="break-all font-mono text-sm">{"BID-ID "+bids.filter(b => b.bidId === auction.highestBidID.toString())[0]?.bidId}</p>
                      </div>
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">Winning Bidder</h4>
                        <p className="break-all font-mono text-sm">{bids.filter(b => b.bidId === auction.highestBidID.toString())[0]?.bidderAddress}</p>
                      </div>
                    </>
                }
                </>
              )
          )}

          <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
