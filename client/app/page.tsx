"use client";
import { AuctionCard } from "@/components/auction-card"
import { useEffect, useState } from "react";
import { Auction } from "@/lib/types";
import { Web3Service } from "@/lib/web3";


export default function Home() {
  const [web3Service, setWeb3Service] = useState<Web3Service | null>(null)
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [transactionStatus, setTransactionStatus] = useState(0);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const committingAuctions = auctions.filter((a) => a.state === "Committing Phase")
  const revealingAuctions = auctions.filter((a) => a.state === "Revealing Phase")
  const finishedAuctions = auctions.filter((a) => a.state === "Finished")
  const finalizationAuctions = auctions.filter((a) => a.state === "Finalization Pending")

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
    }
    initializeWeb3();
  }, []);

  useEffect(() => {
    if (!web3Service) return;

    const setAuc = async () => {
      setAuctions(await web3Service.getAllAuctions());
    } 
    setAuc();

  }, [web3Service,refresh,transactionStatus]);


  return (
    <main className="min-h-screen">

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">

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



        <div className="mb-16 max-w-3xl">
          <h1 className="mb-6 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Trustless auctions,
            <br />
            <span className="text-muted-foreground">cryptographic guarantees.</span>
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Commit-reveal auction protocol that protects your bidding strategy until the reveal phase. 
            No front-running, no information leakage.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-5 sm:grid-cols-5">
          <div className="rounded-xl border border-border p-6">
            <div className="text-3xl font-semibold tabular-nums">{committingAuctions.length}</div>
            <div className="mt-1 text-sm text-muted-foreground">Committing</div>
          </div>
          <div className="rounded-xl border border-border p-6">
            <div className="text-3xl font-semibold tabular-nums">{revealingAuctions.length}</div>
            <div className="mt-1 text-sm text-muted-foreground">Revealing</div>
          </div>
          <div className="rounded-xl border border-border p-6">
            <div className="text-3xl font-semibold tabular-nums">{finalizationAuctions.length}</div>
            <div className="mt-1 text-sm text-muted-foreground">Finalization Pending</div>
          </div>
          <div className="rounded-xl border border-border p-6">
            <div className="text-3xl font-semibold tabular-nums">{finishedAuctions.length}</div>
            <div className="mt-1 text-sm text-muted-foreground">Completed</div>
          </div>
          <button onClick={() => window.location.reload()} className="rounded-xl border border-border p-6 active:scale-95 hover:bg-gray-100">
            <div className="text-2xl font-semibold tabular-nums">Refresh Page</div>
            <div className="mt-1 text-sm text-muted-foreground">to fetch new auctions</div>
          </button>
          
        </div>

        {/* How it works - collapsed */}
        <div className="mt-8 rounded-xl border border-border p-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-commit text-xs font-medium text-commit-foreground">1</span>
              <span className="text-muted-foreground">Commit sealed bids</span>
            </div>
            <span className="hidden text-muted-foreground/40 sm:inline">&rarr;</span>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-reveal text-xs font-medium text-reveal-foreground">2</span>
              <span className="text-muted-foreground">Reveal your bid</span>
            </div>
            <span className="hidden text-muted-foreground/40 sm:inline">&rarr;</span>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-finished text-xs font-medium text-finished-foreground">3</span>
              <span className="text-muted-foreground">Highest bid wins</span>
            </div>
          </div>
        </div>
      </section>

      
      {/* Finalization Pending */}
      {finalizationAuctions.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-finished" />
            <h2 className="text-xl font-semibold">Finalization Pending</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {finalizationAuctions.length}
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {finalizationAuctions.map((auction) => (
              <AuctionCard key={auction.auctionId} auction={auction} showBidButton setRefresh={setRefresh} setTransactionHash={setTransactionHash} setTransactionStatus={setTransactionStatus}/>
            ))}
          </div>
        </section>
      )}

      {/* Committing Phase */}
      {committingAuctions.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-commit" />
            <h2 className="text-xl font-semibold">Committing Phase</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {committingAuctions.length}
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {committingAuctions.map((auction) => (
              <AuctionCard key={auction.auctionId} auction={auction} showBidButton setRefresh={setRefresh} setTransactionHash={setTransactionHash} setTransactionStatus={setTransactionStatus}/>
            ))}
          </div>
        </section>
      )}

      {/* Revealing Phase */}
      {revealingAuctions.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-reveal" />
            <h2 className="text-xl font-semibold">Revealing Phase</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {revealingAuctions.length}
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {revealingAuctions.map((auction) => (
              <AuctionCard key={auction.auctionId} auction={auction} showBidButton setRefresh={setRefresh} setTransactionHash={setTransactionHash} setTransactionStatus={setTransactionStatus}/>
            ))}
          </div>
        </section>
      )}

      {/* Finished */}
      {finishedAuctions.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-finished" />
            <h2 className="text-xl font-semibold">Completed</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {finishedAuctions.length}
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {finishedAuctions.map((auction) => (
              <AuctionCard key={auction.auctionId} auction={auction} showBidButton setRefresh={setRefresh} setTransactionHash={setTransactionHash} setTransactionStatus={setTransactionStatus}/>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
