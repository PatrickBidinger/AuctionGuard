"use client"

import { AuctionCard } from "@/components/auction-card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Web3Service } from "@/lib/web3"
import { Auction, Bid } from "@/lib/types"
import { RevealDialog } from "@/components/reveal-dialog"
import { formatEther } from "ethers"

export default function DashboardPage() {

  const [web3Service, setWeb3Service] = useState<Web3Service | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [transactionStatus, setTransactionStatus] = useState(0);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const myBidsRev = bids.filter(b => b.bidderAddress === walletAddress && b.revealed)
  const myBidsUnrev = bids.filter(b => b.bidderAddress === walletAddress && !b.revealed)
  const myAuctions = auctions.filter(a => a.seller === walletAddress)

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        if(web3Service === null){
          const service = new Web3Service();
          await service.initialize();
          setWeb3Service(service);
        } 
      } catch (error: any) {
        console.error('Failed to initialize Web3:', error);
      }
    };

    initializeWeb3();
  }, []);


  useEffect(() => {
    if (!web3Service) return;

    const setAuc = async () => {
      if(await web3Service.isWalletConnected()){
        setWalletAddress(await web3Service.getWalletAddress());
      }
    } 
    setAuc();

  }, [web3Service]);

  useEffect(() => {
    if (!web3Service) return;

    const setAuc = async () => {
      setAuctions(await web3Service.getAllAuctions());
      setBids(await web3Service.getAllBids());
    } 
    setAuc();

  }, [web3Service,refresh, transactionStatus]);


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
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-6 py-16">


        {!walletAddress ? (
          <>
            <h2 className="mb-2 text-3xl font-semibold tracking-tight">Please connect to your wallet to view your personal dashboard</h2>
            <p className="text-muted-foreground">
              Refresh this page after connecting
            </p>
            <button onClick={() => window.location.reload()} className="rounded-xl border border-border p-5 active:scale-95 hover:bg-gray-100" style={{ marginTop: "30px" }}>
              <div className="text-2xl font-semibold tabular-nums">Refresh Page</div>
            </button>
          </>
        ) : (
          <>

            {transactionStatus !== 0 && (
              <div
                  style={{
                      //marginTop: "20px",
                      padding: "16px 20px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      backgroundColor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                      marginBottom: "30px",
                  }}
              >
                  <div
                      style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                      }}
                  >
                      <div
                          style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              backgroundColor:
                                  transactionStatus === 1
                                      ? "#f59e0b"
                                      : transactionStatus === 2
                                      ? "#ef4444"
                                      : "#22c55e",
                              flexShrink: 0,
                          }}
                      />

                      <div>
                          {transactionStatus === 1 && (
                              <span>Your transaction is in progress.</span>
                          )}

                          {transactionStatus === 2 && (
                              <span>Your transaction has been canceled or failed.</span>
                          )}

                          {transactionStatus === 3 && (
                              <span>
                                  Your transaction was successful. Transaction Hash:{" "}
                                  <code
                                      style={{
                                          background: "#f3f4f6",
                                          padding: "2px 6px",
                                          borderRadius: "6px",
                                          fontSize: "0.9em",
                                      }}
                                  >
                                      {transactionHash}
                                  </code>
                              </span>
                          )}
                      </div>
                  </div>

                  {(transactionStatus === 2 || transactionStatus === 3) && (
                      <button
                          onClick={() => {setTransactionStatus(0); setTransactionHash(null);}}
                          style={{
                              padding: "8px 14px",
                              border: "none",
                              borderRadius: "8px",
                              backgroundColor: "#111827",
                              color: "white",
                              cursor: "pointer",
                              fontWeight: 500,
                          }}
                      >
                          Close Info
                      </button>
                  )}
              </div>
          )}

          <div className="mb-12">
            <h1 className="mb-2 text-4xl font-semibold tracking-tight">My Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your auctions and bidding activity
            </p>
          </div>

          {/* Summary cards */}
          <div className="mb-12 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-6">
              <div className="text-3xl font-semibold tabular-nums">{myAuctions.length}</div>
              <div className="mt-1 text-sm text-muted-foreground">Auctions Created</div>
            </div>
            <div className="rounded-xl border border-border p-6">
              <div className="text-3xl font-semibold tabular-nums">
                {myBidsUnrev.length}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Unrevealed Bids</div>
            </div>
            <div className="rounded-xl border border-border p-6">
              <div className="text-3xl font-semibold tabular-nums">
                {myBidsRev.length}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Revealed Bids</div>
            </div>
          </div>

          {/* My Auctions */}
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Auctions</h2>
              <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                {myAuctions.length} total
              </span>
            </div>
            {myAuctions.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {myAuctions.map((auction) => (
                  <AuctionCard key={auction.auctionId} auction={auction} setRefresh={setRefresh} setTransactionHash={setTransactionHash} setTransactionStatus={setTransactionStatus} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border py-12 text-center">
                <p className="text-muted-foreground">You haven&apos;t created any auctions yet</p>
              </div>
            )}
          </section>

          {/* My unrevealed Bids. */}
          <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">My Unrevealed Bids</h2>
                <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                  {myBidsUnrev.length} total
                </span>
              </div>
          {/* Table Header */}
            <div className="mb-4 hidden grid-cols-4 gap-4 px-5 text-sm font-medium text-muted-foreground sm:grid">
              <div>Bid ID</div>
              <div>Bid Time</div>
              <div>Amount</div>
              <div className="text-right"></div>
            </div>

          {/* Unrevevealed Bids List */}
          {myBidsUnrev.length > 0 ? (
            <div className="space-y-2">
              {myBidsUnrev.map((bid) => (
                <div
                  key={bid.bidId}
                  className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-4 sm:items-center"
                >
                  {/* Bid ID */}
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground sm:hidden">Bid ID</div>
                    <span className="font-mono text-sm">{bid.bidId}</span>
                  </div>

                  {/* Bid Time */}
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground sm:hidden">Commit Time</div>
                    <span className="font-mono text-sm">{formatDate(bid.committedAt)}</span>
                  </div>

                  {/* Amount */}
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground sm:hidden">Amount</div>
                    <span className="font-mono text-sm font-medium">{formatEther(bid.amount.valueOf())} ETH</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end">
                    <RevealDialog bid={bid} revealingAuctions={auctions.filter(a => a.state === "Revealing Phase")} setTransactionHash={setTransactionHash} setTransactionStatus={setTransactionStatus}>
                      <Button variant={"default"} className="flex-1">
                        Reveal this Bid
                      </Button>
                    </RevealDialog>
                  </div>

                  {/* Status 
                  <div className="sm:text-right">
                    <div className="mb-1 text-xs text-muted-foreground sm:hidden">Status</div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-reveal/10 px-3 py-1 text-xs font-medium text-reveal">
                      <span className="h-1.5 w-1.5 rounded-full bg-reveal" />
                      Pending Reveal
                    </span>
                  </div>*/}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-muted-foreground">You have no unrevealed bids at the moment</p>
            </div>
          )}
          </section>



          {/* My revealed Bids. */}
          <section style={{ marginTop: "40px" }}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">My Revealed Bids</h2>
                <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                  {myBidsRev.length} total
                </span>
              </div>
          {/* Table Header */}
            <div className="mb-4 hidden grid-cols-5 gap-4 px-5 text-sm font-medium text-muted-foreground sm:grid">
              <div>Bid ID</div>
              <div>Auction ID</div>
              <div>Bid Time</div>
              <div>Amount</div>
              <div>Status</div>
            </div>

          {/* Revealed Bids List */}
          {myBidsRev.length > 0 ? (
            <div className="space-y-2">
              {myBidsRev.map((bid) => (
                <div
                  key={bid.bidId}
                  className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-5 sm:items-center"
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

                  {/* Bid Time */}
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground sm:hidden">Commit Time</div>
                    <span className="font-mono text-sm">{formatDate(bid.committedAt)}</span>
                  </div>


                  {/* Amount */}
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground sm:hidden">Amount</div>
                    <span className="font-mono text-sm font-medium">{formatEther(bid.amount.valueOf())} ETH</span>
                  </div>

                  {/* Status */}
                  <div>
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
              <p className="text-muted-foreground">You have no revealed bids yet</p>
            </div>
          )}
          </section>



          </>
        )} 
      </section>




    </main>
  )
}
