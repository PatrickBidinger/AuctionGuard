"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Web3Service } from "@/lib/web3"
import { formatEther } from "ethers"

export default function CreatePage() {
  const [formData, setFormData] = useState({
    description: "",
    commitDurationMin: "0",
    commitDurationHours: "0",
    commitDurationDays: "0",
    revealDurationMin: "0",
    revealDurationHours:"0",
    revealDurationDays: "0"
  })

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setTransactionStatus(1);

    try{
      const payload = {
        description: formData.description.trim(),
        commitDuration: Number(formData.commitDurationMin) + Number(formData.commitDurationHours) * 60 + Number(formData.commitDurationDays) * 60 * 24,
        revealDuration: Number(formData.revealDurationMin) + Number(formData.revealDurationHours) * 60 + Number(formData.revealDurationDays) * 60 * 24
      }
      if (!payload.description) {
        alert("Description is required");
        console.error("Description is required");
        return;
      } 
      if (payload.commitDuration < 1 || payload.revealDuration < 1) {
        alert("The durations must be at least 1h (not applied currently)") //TODO
        //console.error("The durations must be at least 1h")
        //return;
      }

      if(!web3Service){
        alert("Initialization Error");
        return;
      }

      const transactionHash = await web3Service.createAuction(payload.commitDuration * 60, payload.revealDuration  * 60, payload.description);
      if(transactionHash=="failed"){
        setTransactionHash(null);
        setTransactionStatus(2);
      } else{
        setTransactionHash(transactionHash);
        setTransactionStatus(3);
        setFormData({
          description: "",
          commitDurationMin: "0",
          commitDurationHours: "0",
          commitDurationDays: "0",
          revealDurationMin: "0",
          revealDurationHours:"0",
          revealDurationDays: "0"
        });
      }
    }
    catch (error: any) {
      alert("Failed to create auction.")
      //throw new Error(error.message || 'Failed to create auction');
    }
  }

  const formatDate = (durationMin: number, durationHours: number, durationDays: number) => {
    let time = new Date().getTime();
    time += durationMin*60000;
    time += durationHours*60*60000;
    time += durationDays*60*24*60000;
    
    const date = new Date(time);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  
  const [web3Service, setWeb3Service] = useState<Web3Service | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [auctionFee, setAuctionFee] = useState<string>("unknown");
  const [transactionStatus, setTransactionStatus] = useState(0);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const setAucFee = async () => {
    if(!(web3Service === null)){
      setAuctionFee(await web3Service.getAuctionFee())
    }
  }
  setAucFee();

  useEffect(() => {
  const initializeWeb3 = async () => {
    try {
      if(web3Service === null){
        const service = new Web3Service();
        await service.initialize();
        setWeb3Service(service);
        if(await service.isWalletConnected()){
        setWalletAddress(await service.getWalletAddress());
        }
      } else if(!(web3Service === null)){
        if(await web3Service.isWalletConnected()){
          setWalletAddress(await web3Service.getWalletAddress());
        }
      }
    } catch (error: any) {
      console.error('Failed to initialize Web3:', error);
    }
  };
    initializeWeb3();
  }, []);


  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-6 py-16">

        {!walletAddress ? (
          <>
            <h2 className="mb-2 text-3xl font-semibold tracking-tight">Please connect to your wallet to create an auction</h2>
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
          <h1 className="mb-2 text-4xl font-semibold tracking-tight">Create Auction</h1>
          <p className="text-muted-foreground">
            Launch a new commit-reveal auction on the blockchain
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Auction Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the item or asset you're auctioning..."
                  value={formData.description}
                  maxLength={450}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="min-h-[120px] resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Provide a clear description of what bidders will receive
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="commitDuration" className="text-sm font-medium">
                    Commit Phase Duration
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="commitDurationMin"
                      type="number"
                      min="0"
                      max="59"
                      value={formData.commitDurationMin}
                      onChange={(e) =>
                        setFormData({ ...formData, commitDurationMin: e.target.value })
                      }
                      className="font-mono"
                      required
                    />
                    <span className="text-sm text-muted-foreground">mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="commitDurationHours"
                      type="number"
                      min="0"
                      max="23"
                      value={formData.commitDurationHours}
                      onChange={(e) =>
                        setFormData({ ...formData, commitDurationHours: e.target.value })
                      }
                      className="font-mono"
                      required
                    />
                    <span className="text-sm text-muted-foreground">hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="commitDurationDays"
                      type="number"
                      min="0"
                      max="30"
                      value={formData.commitDurationDays}
                      onChange={(e) =>
                        setFormData({ ...formData, commitDurationDays: e.target.value })
                      }
                      className="font-mono"
                      required
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revealDuration" className="text-sm font-medium">
                    Reveal Phase Duration
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="revealDurationMin"
                      type="number"
                      min="0"//TODO
                      max="59"
                      value={formData.revealDurationMin}
                      onChange={(e) =>
                        setFormData({ ...formData, revealDurationMin: e.target.value })
                      }
                      className="font-mono"
                      required
                    />
                    <span className="text-sm text-muted-foreground">mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="revealDurationHours"
                      type="number"
                      min="0"//TODO
                      max="23"
                      value={formData.revealDurationHours}
                      onChange={(e) =>
                        setFormData({ ...formData, revealDurationHours: e.target.value })
                      }
                      className="font-mono"
                      required
                    />
                    <span className="text-sm text-muted-foreground">hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="revealDurationDays"
                      type="number"
                      min="0"//TODO
                      max="30"
                      value={formData.revealDurationDays}
                      onChange={(e) =>
                        setFormData({ ...formData, revealDurationDays: e.target.value })
                      }
                      className="font-mono"
                      required
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full sm:w-auto" disabled={!web3Service}>
                Create Auction
              </Button>
            </form>
          </div>

          {/* Preview / Info Panel */}
          <div className="space-y-6">
            {/* Preview Card */}
            {formData.description && (
              <div className="rounded-xl border border-border p-6">
                <div className="mb-4 text-sm font-medium text-muted-foreground">Preview</div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-commit px-3 py-1 text-xs font-medium text-commit-foreground">
                    Committing Phase
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">AUC-ID XXX</span>
                </div>
                <p className="mb-4 text-sm break-words">{formData.description}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approx. Auction Fee</span>
                    <span className="font-mono">{
                      formatEther(BigInt(auctionFee))+" ETH"
                    }</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commit Duration</span>
                    <span className="font-mono">{
                      formatDate(
                        Number(formData.commitDurationMin), 
                        Number(formData.commitDurationHours),
                        Number(formData.commitDurationDays))
                    }</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reveal Duration</span>
                    <span className="font-mono">{formatDate(
                      Number(formData.commitDurationMin)+Number(formData.revealDurationMin),
                      Number(formData.commitDurationHours)+Number(formData.revealDurationHours),
                      Number(formData.commitDurationDays)+Number(formData.revealDurationDays))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </>
      )}
      </section>
    </main>
  )
}
