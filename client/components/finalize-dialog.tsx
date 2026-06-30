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
import { formatEther } from "ethers";

interface FinalizeProps {
  auction: Auction
  children: React.ReactNode
  setTransactionHash: (hash: string) => void;
  setTransactionStatus: (status: number) => void;
}

export function FinalizeDialog({ auction, children, setTransactionHash, setTransactionStatus}: FinalizeProps) {
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

    setOpen(false)
    setBidAmount("")
    setSecret("")

    if(!web3Service){
      alert("Initialization Error");
      return;
    }

    try{
      const transactionResult = await web3Service.finalizeAuction(auction.auctionId);
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
          <DialogTitle>Finalize</DialogTitle>
          <DialogDescription>
            Auctions with "finalization pending" can be finalized by any arbitrary user. 
            The finalization will be rewarded.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="rounded-lg bg-muted/50 p-4">
            <div
                  key={auction.auctionId}
                  className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-3 "
            >
                <div>
                    <div className="mb-2 text-sm font-medium">Auction</div>
                    <div className="font-mono text-xs text-muted-foreground">{"AUC-ID " + auction.auctionId}</div>
                </div>
                <div>
                    <div className="mb-2 text-sm font-medium">Reward</div>
                    <div className="font-mono text-xs text-muted-foreground">{"" + formatEther(auction.fee.valueOf()) + " ETH"}</div>
                </div>
                <div>
                    <div className="mb-2 text-sm font-medium">Auction ended</div>
                    <div className="font-mono text-xs text-muted-foreground">{formatDate(auction.revealEndTime)}</div>
                </div>
            </div>
           
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Submit Finalization
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
