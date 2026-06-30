import { Uint256 } from "web3"

export type AuctionState = "Committing Phase" | "Revealing Phase" | "Finalization Pending" | "Finished"

export interface Auction {
  auctionId: string
  description: string
  seller: string
  fee: BigInt
  startTime: Date
  commitEndTime: Date
  revealEndTime: Date
  finalized: boolean
  highestBidID: BigInt
  totalBids: BigInt
  state: AuctionState
}

export interface Bid {
  bidId: string
  auctionId: string
  commitment: string
  bidderAddress: string
  amount: BigInt
  revealed: boolean
  committedAt: Date
  refunded: boolean
}
