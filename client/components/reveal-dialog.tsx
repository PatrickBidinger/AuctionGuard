"use client"

import { useEffect, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Web3Service } from "@/lib/web3"
import { formatEther } from "ethers"

interface RevealDialogProps {
  bid: Bid
  revealingAuctions: Auction[]
  children: React.ReactNode
  setTransactionHash: (hash: string) => void;
  setTransactionStatus: (status: number) => void;
}

export function RevealDialog({ bid, revealingAuctions, children, setTransactionHash, setTransactionStatus}: RevealDialogProps) {
  const [bidAmount, setBidAmount] = useState("")
  const [secret, setSecret] = useState("")
  const [currentAuctionID, setCurrentAuctionID] = useState("")
  const [open, setOpen] = useState(false)
  const [warnText, setWarnText] = useState("")

  const [web3Service, setWeb3Service] = useState<Web3Service | null>(null)
  const [walletConnected, setwalletConnected] = useState<boolean>(false)

    
  useEffect(() => {
      const initializeWeb3 = async () => {
        try {
          if(web3Service === null){
            const service = new Web3Service();
            await service.initialize();
            setWeb3Service(service);
            setwalletConnected(await service.isWalletConnected())
          } else {
            setwalletConnected(await web3Service.isWalletConnected())
          }
        } catch (error: any) {
          console.error('Failed to initialize Web3:', error);
        }
      };
  
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


   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTransactionStatus(1);
    setWarnText("");
    // Dummy action - just close the dialog
    //alert(`Bid of ${bidAmount} ETH placed on auction ${auction.auctionId}`)


    try{
        if(web3Service === null){
            throw new Error('Failed to reveal. web3Service null.');
        }
        const valid = await web3Service?.revealBidPrecheck(bid.bidId, currentAuctionID, secret);
        if(valid === ""){
            setOpen(false)
            setBidAmount("")
            setSecret("")
            
            const transactionResult = await web3Service.revealBid(bid.bidId, currentAuctionID, secret);
            
            if(transactionResult == "failed"){
              setTransactionHash("");
              setTransactionStatus(2);
            } else{
              setTransactionHash(transactionResult);
              setTransactionStatus(3);
            }

        } else{
            setWarnText("Precheck failed: " + valid);
        }
    } catch (error: any) {
        console.log("Error: " + error.stack);
        throw new Error(error.message || 'Failed to reveal.');
    }

  

  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger /*asChild*/>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reveal Your Bid</DialogTitle>
          <DialogDescription>
            This is only possible during the reveal period of the auction you've bid on. Please ensure that you have all the data ready.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <div
                  key={bid.bidId}
                  className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-3"
            >
                <div>
                    <div className="mb-2 text-sm font-medium">Bid</div>
                    <div className="font-mono text-xs text-muted-foreground">{"BID-ID " + bid.bidId}</div>
                </div>
                <div>
                    <div className="mb-2 text-sm font-medium">Bid Amount</div>
                    <div className="font-mono text-xs text-muted-foreground">{"" + formatEther(bid.amount.valueOf()) + " ETH"}</div>
                </div>
                <div>
                    <div className="mb-2 text-sm font-medium">Commit Time</div>
                    <div className="font-mono text-xs text-muted-foreground">{formatDate(bid.committedAt)}</div>
                </div>
            </div>
           
          </div>

        <div className="space-y-2">
            <Label htmlFor="secret">Auction ID</Label>
            <Input
              id="auctionField"
              type="text"
              placeholder="Auction ID of the auction you bidded for"
              value={currentAuctionID}
              onChange={(e) => setCurrentAuctionID(e.target.value)}
              required
            />
          </div>
            {/*
          <div className="space-y-2">
            <Label htmlFor="bid-amount">Choose the auction you bidded for</Label>
            <select 
                id="auctionField"
                className="w-full border rounded p-2" 
                value={currentAuctionID}
                onChange={(e) => setCurrentAuctionID(e.target.value)}
            >
                {revealingAuctions.map((auction) => (
                <option key={auction.auctionId} value={auction.auctionId}>
                    {"AUC-ID "+auction.auctionId + " | " + auction.description.slice(0,100)+(auction.description.length>100?"...":"")}
                </option>
                ))}
            </select>
          </div>
          */}


          <>
          </>
          <div className="space-y-2">
            <Label htmlFor="secret">Secret Phrase</Label>
            <Input
              id="secret"
              type="text"
              min="5"
              placeholder="Enter the secret phrase that you used to commit this bid"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
            />
          </div>
          <Label>{warnText}</Label>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Submit Bid
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
