"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Web3Service } from "@/lib/web3";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "All Auctions" },
  { href: "/unrevealed", label: "All Bids" },
  { href: "/dashboard", label: "My Dashboard" },
  { href: "/create", label: "Create Auction" },
]

export function Navbar() {
  const pathname = usePathname()

  const [web3Service, setWeb3Service] = useState<Web3Service | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [networkInfo, setNetworkInfo] = useState<{
    name: string;
    contractAddress: string;
  } | null>(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        if(web3Service === null){
          const service = new Web3Service();
          await service.initialize();
          setWeb3Service(service);
          const networkName = await service.getNetworkName();
          const contractAddress = await service.getContractAddress();
          setNetworkInfo({
            name: networkName,
            contractAddress,
          });
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
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-background"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight">AuctionGuard</span>
          {networkInfo && (
          <div className="ml-4 text-sm text-muted-foreground">
            <span className="font-medium">{networkInfo.name}</span>
            <span className="mx-2">|</span>
            <span className="font-mono text-xs truncate" title={networkInfo.contractAddress}>
              Contract: {networkInfo.contractAddress.slice(0, 6)}.{networkInfo.contractAddress.slice(-4)}
            </span>
          </div>
        )}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-foreground" />
                )}
              </Link>
            )
          })}
        </nav>

        {/*
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm sm:flex">
            <span className="h-2 w-2 rounded-full bg-commit" />
            <span className="font-mono text-muted-foreground">0x7a23...8f4d</span>
          </div>
        </div>
        */}

        <div className="flex items-center gap-4">
          {walletAddress ? (
            <div className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm sm:flex">
              <span className="h-2 w-2 rounded-full bg-commit" />
              <span className="font-mono text-muted-foreground">
                {walletAddress.slice(0, 10)}.{walletAddress.slice(-6)}
              </span>
            </div>
          ) : (
            <button
              disabled={web3Service === null}
              onClick={async() => {
                await web3Service?.connectWallet(); 
                if(web3Service) setWalletAddress(await web3Service.getWalletAddress());
              }}
              className="rounded-full border border-border px-4 py-2 text-sm transition hover:bg-accent active:scale-95"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-3 md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
