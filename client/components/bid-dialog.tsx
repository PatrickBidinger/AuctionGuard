"use client"

import { useEffect, useState } from "react"
import { Auction } from "@/lib/types"
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

interface BidDialogProps {
  auction: Auction
  children: React.ReactNode
  setTransactionHash: (hash: string) => void;
  setTransactionStatus: (status: number) => void;
}

export function BidDialog({ auction, children, setTransactionHash, setTransactionStatus}: BidDialogProps) {
  const [bidAmount, setBidAmount] = useState("")
  const [secret, setSecret] = useState("")
  const [open, setOpen] = useState(false)

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



  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setTransactionStatus(1);
    // Dummy action - just close the dialog
    //alert(`Bid of ${bidAmount} ETH placed on auction ${auction.auctionId}`)
    setOpen(false)
    setBidAmount("")
    setSecret("")

    if(!web3Service){
      alert("Initialization Error");
      return;
    }

    try{
      const transactionResult = await web3Service.commitBid(Number(auction.auctionId), bidAmount, secret);
      if(transactionResult == "failed"){
        setTransactionHash("");
        setTransactionStatus(2);
      } else{
        setTransactionHash(transactionResult);
        setTransactionStatus(3);
      }

    } catch (error: any) {
      throw new Error(error.message || 'Failed to create auction');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger /*asChild*/>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place a Bid</DialogTitle>
          <DialogDescription>
            Submit a sealed bid for this auction. Your bid will be hidden until the reveal phase.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="mb-2 text-sm font-medium">Auction</div>
            <div className="font-mono text-xs text-muted-foreground">{"AUC-ID "+auction.auctionId}</div>
            <p className="mt-2 text-sm">{auction.description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bid-amount">Bid Amount (ETH)</Label>
            <Input
              id="bid-amount"
              type="number"
              step="0.000000000000000001"
              min="0"
              placeholder="0.00"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret">Secret Phrase</Label>
            <Input
              id="secret"
              type="text"
              placeholder="Enter a secret phrase to seal your bid"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Remember this phrase - you will need it to reveal your bid.
            </p>
          </div>

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
