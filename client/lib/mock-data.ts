import { Auction } from "./types"

export interface Bid {
  bidId: string
  auctionId: string
  bidderAddress: string
  amount: number
  revealed: boolean
  committedAt: Date
}

// Current user address (mock)
export const currentUserAddress = "0x7a23...8f4d"

// Generate mock auctions with varying states and times
export const mockAuctions: Auction[] = [
  {
    auctionId: "AUC-001",
    description: "Rare Digital Art Collection - Genesis Series NFT with exclusive holder benefits",
    sellerAddress: "0x7a23...8f4d", // current user
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    commitEndTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    revealEndTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    state: "Committing Phase",
  },
  {
    auctionId: "AUC-002",
    description: "Vintage Domain Name - premium crypto.eth domain with high traffic history",
    sellerAddress: "0x3b91...2c7e",
    startTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
    commitEndTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
    revealEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    state: "Revealing Phase",
  },
  {
    auctionId: "AUC-003",
    description: "Smart Contract License - Exclusive rights to battle-tested DeFi protocol",
    sellerAddress: "0x9f12...4a3b",
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    commitEndTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
    revealEndTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    state: "Finished",
  },
  {
    auctionId: "AUC-004",
    description: "Limited Edition Hardware Wallet - Titanium Series with custom engraving",
    sellerAddress: "0x7a23...8f4d", // current user
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
    commitEndTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
    revealEndTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
    state: "Committing Phase",
  },
  {
    auctionId: "AUC-005",
    description: "Metaverse Land Parcel - Prime location in decentralized virtual world",
    sellerAddress: "0x2d45...6b8a",
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    commitEndTime: new Date(Date.now() - 30 * 60 * 1000),
    revealEndTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
    state: "Revealing Phase",
  },
  {
    auctionId: "AUC-006",
    description: "DAO Governance Tokens - 10,000 voting tokens with founder privileges",
    sellerAddress: "0x8c34...1e5f",
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    commitEndTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
    revealEndTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
    state: "Committing Phase",
  },
  {
    auctionId: "AUC-007",
    description: "Cross-chain Bridge Access - Lifetime fee-free transfers up to 1M USD",
    sellerAddress: "0x1a67...3c9d",
    startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
    commitEndTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    revealEndTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    state: "Finished",
  },
  {
    auctionId: "AUC-008",
    description: "Oracle Node License - Run verified price feeds and earn rewards",
    sellerAddress: "0x4f89...7a2c",
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    commitEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    revealEndTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    state: "Committing Phase",
  },
  {
    auctionId: "AUC-009",
    description: "Oracle Node License - Run verified price feeds and earn rewards",
    sellerAddress: "0x4f89...7a2c",
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    commitEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    revealEndTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    state: "Committing Phase",
  },
  {
    auctionId: "AUC-010",
    description: "Oracle Node License - Run verified price feeds and earn rewards",
    sellerAddress: "0x7a23...8f4d",
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    commitEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    revealEndTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    state: "Revealing Phase",
  },
]

// Mock bids - some revealed, some not
export const mockBids: Bid[] = [
  {
    bidId: "BID-001",
    auctionId: "AUC-002",
    bidderAddress: "0x7a23...8f4d", // current user
    amount: 2.5,
    revealed: false,
  },
  {
    bidId: "BID-002",
    auctionId: "AUC-005",
    bidderAddress: "0x7a23...8f4d", // current user
    amount: 1.8,
    revealed: true,
  },
  {
    bidId: "BID-003",
    auctionId: "AUC-006",
    bidderAddress: "0x7a23...8f4d", // current user
    amount: 0.75,
    revealed: false,
  },
  {
    bidId: "BID-004",
    auctionId: "AUC-003",
    bidderAddress: "0x7a23...8f4d", // current user
    amount: 3.2,
    revealed: true,
  },
  {
    bidId: "BID-005",
    auctionId: "AUC-002",
    bidderAddress: "0x3f81...9a2d",
    amount: 2.1,
    revealed: false,
  },
  {
    bidId: "BID-006",
    auctionId: "AUC-005",
    bidderAddress: "0x8b12...4c7e",
    amount: 1.5,
    revealed: true,
  },
]

// Get auctions created by current user
export const getMyAuctions = () => 
  mockAuctions.filter(a => a.sellerAddress === currentUserAddress)

// Get auctions where current user has bid
export const getMyBiddedAuctions = () => {
  const myBidAuctionIds = mockBids
    .filter(b => b.bidderAddress === currentUserAddress)
    .map(b => b.auctionId)
  return mockAuctions.filter(a => myBidAuctionIds.includes(a.auctionId))
}

// Get all unrevealed bids
export const getUnrevealedBids = () => mockBids.filter(b => !b.revealed)

// Get my unrevealed bids
export const getMyUnrevealedBids = () => 
  mockBids.filter(b => b.bidderAddress === currentUserAddress && !b.revealed)
