"use client"

import { getUnrevealedBids } from "@/lib/mock-data"
import { Auction, Bid } from "@/lib/types";
import { Web3Service } from "@/lib/web3";
import { formatEther } from "ethers";
import { useEffect, useState } from "react";

export default function UnrevealedBidsPage() {
  //const unrevealedBids = getUnrevealedBids()

  const [web3Service, setWeb3Service] = useState<Web3Service | null>(null)
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const unrevealedBids = bids.filter(bid => !bid.revealed);
  const revealedBids = bids.filter(bid => bid.revealed);


  useEffect(() => {
  const initializeWeb3 = async () => {
    try {
      if(web3Service === null){
        const service = new Web3Service();
        await service.initialize();
        setWeb3Service(service);
        setBids(await service.getAllBids());
        setAuctions(await service.getAllAuctions());
      } else {
        setBids(await web3Service.getAllBids());
        setAuctions(await web3Service.getAllAuctions());
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

  /*
  useEffect(() => {
        const initializeWeb3 = async () => {
          try {
            const service = new Web3Service();
            await service.initialize();
            setWeb3Service(service);
            setBids(await service.getAllBids());
            
          } catch (error: any) {
            console.error('Failed to initialize Web3:', error);
          }
        };
    
        initializeWeb3();
      }, []);
*/
  

  return (
    <main className="min-h-screen">

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-semibold tracking-tight">All Bids</h1>
          <p className="text-muted-foreground">
            All the bids that have been made by anyone
          </p>
        </div>

        {/* Summary */}
        <div className="mb-12 flex items-center gap-8 border-b border-border pb-8 sm:grid-cols-3">
          <div>
            <div className="text-4xl font-semibold tabular-nums">{unrevealedBids.length}</div>
            <div className="mt-1 text-sm text-muted-foreground">Unrevealed</div>
          </div>
          <div>
            <div className="text-4xl font-semibold tabular-nums">{revealedBids.length}</div>
            <div className="mt-1 text-sm text-muted-foreground">Revealed</div>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-semibold tracking-tight pb-8">Unrevealed Bids</h1>

        {/* Table Header */}
        <div className="mb-4 hidden grid-cols-4 gap-4 px-5 text-sm font-medium text-muted-foreground sm:grid">
          <div>Bid ID</div>
          <div>Bidder</div>
          <div className="text-right">Commitment Hash</div>
          <div className="text-right">Amount</div>
        </div>
        

        {/* Bids List */}
        {unrevealedBids.length > 0? (
          <div className="space-y-2">
            {unrevealedBids.map((bid) => (
              <div
                key={bid.bidId}
                className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-4 sm:items-center"
              >
                {/* Bid ID */}
                <div>
                  <div className="mb-1 text-xs text-muted-foreground sm:hidden">Bid ID</div>
                  <span className="font-mono text-sm">{bid.bidId}</span>
                </div>

                {/* Bidder */}
                <div>
                  <div className="mb-1 text-xs text-muted-foreground sm:hidden">Bidder</div>
                  <span className="font-mono text-sm">{bid.bidderAddress.slice(0,16)+"."+bid.bidderAddress.slice(-10)}</span>
                </div>

                {/* Commitment */}
                <div className="text-right">
                  <div className="mb-1 text-xs text-muted-foreground sm:hidden">Commitment</div>
                  <span className="font-mono text-sm">{bid.commitment.toString().slice(0,16)+"."+bid.commitment.toString().slice(-10)}</span>
                </div>

                {/* Amount */}
                <div className="sm:text-right">
                  <div className="mb-1 text-xs text-muted-foreground sm:hidden">Amount</div>
                  <span className="font-mono text-sm font-medium">{formatEther(bid.amount.valueOf())} ETH</span>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No unrevealed bids at the moment</p>
          </div>
        )}



        <h1 className="mb-2 text-2xl font-semibold tracking-tight py-10">Revealed Bids</h1>

        {/* Table Header */}
        <div className="mb-4 hidden grid-cols-6 gap-4 px-5 text-sm font-medium text-muted-foreground sm:grid">
          <div>Bid ID</div>
          <div>Auction ID</div>
          <div>Bidder</div>
          <div className="text-right">Bid Time</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Status</div>
        </div>
        

        {/* Bids List */}
        {revealedBids.length > 0 ? (
          <div className="space-y-2">
            {revealedBids.map((bid) => (
              <div
                key={bid.bidId}
                className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-6 sm:items-center"
              >
                {/* Bid ID */}
                <div>
                  <div className="mb-1 text-xs text-muted-foreground sm:hidden">Bid ID</div>
                  <span className="font-mono text-sm">{bid.bidId}</span>
                </div>

                {/* Auction ID */}
                <div>
                  <div className="mb-1 text-xs text-muted-foreground sm:hidden">Auction ID</div>
                  <span className="font-mono text-sm">{bid.auctionId}</span>
                </div>

                {/* Bidder */}
                <div>
                  <div className="mb-1 text-xs text-muted-foreground sm:hidden">Bidder</div>
                  <span className="font-mono text-sm">{bid.bidderAddress.slice(0,8)+"."+bid.bidderAddress.slice(-6)}</span>
                </div>

                {/* Bid Time */}
                <div className="text-right">
                  <div className="mb-1 text-xs text-muted-foreground sm:hidden">Commit Time</div>
                  <span className="font-mono text-sm">{formatDate(bid.committedAt)}</span>
                </div>

                {/* Amount */}
                <div className="sm:text-right">
                  <div className="mb-1 text-xs text-muted-foreground sm:hidden">Amount</div>
                  <span className="font-mono text-sm font-medium">{formatEther(bid.amount.valueOf())} ETH</span>
                </div>

                {/* Status */}
                  <div className="text-right">
                    <div className="mb-1 text-xs text-muted-foreground sm:hidden">Amount</div>
                    <span className="font-mono text-sm font-medium">{
                    (bid.refunded?"refunded":
                      (auctions.filter(a => a.auctionId === bid.auctionId)[0]?.state.slice(0,3) === "Fin" ? "won the auction" : "currently highest bid"))
                    }</span>
                  </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No revealed bids yet</p>
          </div>
        )}

      </section>

    </main>
  )
}
