"use client"

import Web3 from 'web3';
import { getContractConfig, type ContractConfig } from './contract-config';
import { ensureSupportedNetwork, getEthereumProvider, type EthereumProvider } from './ethereum';
import { Auction, AuctionState, Bid } from './types';
import { ethers } from "ethers";

export interface HashData {
  hash: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  timestamp: number;
}

export class Web3Service {
  private web3: Web3;
  private contract: any;
  private contractConfig: ContractConfig | null = null;
  private provider: EthereumProvider;

  constructor() {
    this.provider = getEthereumProvider();
    this.web3 = new Web3(this.provider as any);
  }

  async initialize(): Promise<void> {
    try {
      await ensureSupportedNetwork(this.provider);

      // Get contract configuration
      this.contractConfig = await getContractConfig();
      
      // Initialize contract
      this.contract = new this.web3.eth.Contract(
        this.contractConfig.abi,
        this.contractConfig.address
      );

      // Listen for network changes
      this.provider.on?.('chainChanged', () => {
        window.location.reload();
      });

      //Wait for Auction updates


    } catch (error: any) {
      throw new Error(`Failed to initialize Web3Service: ${error.message}`);
    }
  }

  async getContractAddress(): Promise<string> {
    if (!this.contractConfig) {
      throw new Error('Contract not initialized');
    }
    return this.contractConfig.address;
  }

  async getNetworkName(): Promise<string> {
    if (this.contractConfig) {
      return this.contractConfig.networkName;
    }
    const networkId = await this.web3.eth.net.getId();
    return `Network ${networkId.toString()}`;
  }

  async getCurrentChainId(): Promise<string> {
    try {
      const chainIdHex = await this.provider.request({
        method: "eth_chainId",
      });
      return parseInt(chainIdHex, 16).toString();
    } catch (error: any) {
      throw new Error(error.message || "Failed to read current network");
    }
  }

  async connectWallet(): Promise<string[]> {
    try {
      const accounts = await this.provider.request({method: 'eth_requestAccounts'});
      return accounts;
    } catch (error: any) {
      //toast.error('error.message || Wallet not connected');
      //console.log("TEST1");
      //return [];
      throw new Error(error.message || 'Failed to connect wallet');
    }
  }

  async getWalletAddress(): Promise<string|null> {
    const isConnected = await this.isWalletConnected();
    if (!isConnected) {
      //toast.error('Wallet not connected');
      //console.log("TEST2");
      throw new Error('Wallet not connected');
      return null;
    }
    const accounts = await this.provider.request({ method: "eth_accounts" });
    return accounts[0];
  }

  async isWalletConnected(): Promise<boolean> {
    const accounts = await this.provider.request({ method: "eth_accounts" });
    return accounts.length > 0;
  }

  async getAuctionFee(): Promise<string>{
    this.ensureInitialized();
    return await this.contract.methods.getAuctionFee().call();
  }

  async getAllAuctions(): Promise<Auction[]> {
      this.ensureInitialized();

      try {
        const maxId: string = await this.contract.methods.getMaxAuctionID().call();
        const maxAuctionId = Number(maxId);

        //throw new Error("MaxID: " + maxAuctionId);

        const auctions: Auction[] = [];

        for (let id = 1; id <= maxAuctionId; id++) {
          const data = await this.contract.methods.getAuction(id).call();

          auctions.push({
            auctionId: id.toString(),
            description: data[0],
            seller: data[1].toLowerCase(),
            fee: BigInt(data[2]),
            finalized: data[3],
            startTime: new Date(Number(data[4]) * 1000),
            commitEndTime: new Date(Number(data[5]) * 1000),
            revealEndTime: new Date(Number(data[6]) * 1000),
            highestBidID: BigInt(data[7]),
            totalBids: BigInt(data[8]),
            state: await this.computeAuctionState(
              Number(data[4]),
              Number(data[5]),
              Number(data[6]),
              data[3]
            )
          });
        }

        return auctions;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch auctions');
      }
  }

    async getAllBids(): Promise<Bid[]> {
      this.ensureInitialized();

      try {
        const maxId: string = await this.contract.methods.getMaxBidID().call();
        const maxBidId = Number(maxId);

        const bids: Bid[] = [];

        for (let id = 1; id <= maxBidId; id++) {
          const data = await this.contract.methods.getBid(id).call();

          bids.push({
            bidId: id.toString(),
            commitment: ethers.hexlify(data[0]),
            bidderAddress: data[2].toString().toLowerCase(),
            amount: BigInt(data[1]),
            revealed: data[4],
            refunded: data[5],
            committedAt: new Date(Number(BigInt(data[3]) * BigInt(1000))),
            //committedAt: new Date(Number(100 * 1000)),
            auctionId: data[6].toString()
          });
        }

        return bids;
        
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch bids');
      }
  }


  
  async computeAuctionState(
    startTime: number,
    commitEndTime: number,
    revealEndTime: number,
    finalized: boolean
  ): Promise<AuctionState> {
    const now = Math.floor(Date.now() / 1000);

    if (finalized) {
      return "Finished";
    } else if (now < commitEndTime) {
      return "Committing Phase";
    } else if (now < revealEndTime) {
      return "Revealing Phase";
    }
    return "Finalization Pending";
  }

  async createAuction(
        _commitDuration: number,
        _revealDuration: number,
        _description: string
  ): Promise<string>{
    this.ensureInitialized();

    try {
      const accounts = await this.connectWallet();

      const fee = await this.contract.methods.getAuctionFee().call();
      
      const result = await this.contract.methods
        .createAuction(_commitDuration, _revealDuration, _description)
        .send({
          from: accounts[0],
          value: fee
        });
      console.log("txhash:", result.transactionHash);

      if (result.status) {
        return result.transactionHash;
      } else {
        return "failed";
      }
      //return result.transactionHash;
    } catch (error: any) {
      return "failed";
      //throw new Error(error.message || 'Failed to create auction');
    }
  }

    async commitBid(
        _auctionID: number,
        _amount: string,
        _nonce: string
  ): Promise<string>{
    this.ensureInitialized();

    if(!this.isWalletConnected()){
      throw new Error('Could not place bid because Wallet is not connected.');
    }

    try {
      const accounts = await this.connectWallet();

      const commitment = await this.contract.methods
        .generateCommitment(_auctionID, accounts[0], this.web3.utils.toWei(_amount, "ether"), _nonce)
        .call();

      const result = await this.contract.methods
        .commitBid(commitment)
        .send({
          from: accounts[0],
          value: this.web3.utils.toWei(_amount, "ether") // 0.1 ETH
        });
      console.log("txhash:", result.transactionHash);

      if (result.status) {
        return result.transactionHash;
      } else {
        return "failed";
      }
    } catch (error: any) {
      return "failed";
      //throw new Error(error.message || 'Failed to commit the bid');
    }
  }

  async revealBidPrecheck(
      _bidID: string,
      _auctionID: string,
      _nonce: string  
  ): Promise<string>{
    this.ensureInitialized();
    
    if(!this.isWalletConnected()){
      throw new Error('Could not place bid because Wallet is not connected.');
    }

    try {
      //First check the timing (not possible in solidity view)
      //Then check the rest
      const accounts = await this.connectWallet();
      const valid = await this.contract.methods
        .revealBidPrecheck(Number(_bidID), Number(_auctionID), _nonce)
        .call({from: accounts[0]});

      if(valid == 1){
        return "bid was already revealed";
      } else if(valid == 2){
        return "bid was commited before the auction started or wrong auction selected";
      } else if(valid == 3){
        return "bid was not commited in time or wrong auction selected";
      } else if(valid == 4){
        return "hash compare failed or wrong auction selected";
      } else if(valid == 5){
        return "bid does not exist";
      } else if(valid == 6){
        return "auction does not exist";
      } 
      const data = await this.contract.methods.getAuction(Number(_auctionID)).call();
      const state = await this.computeAuctionState(Number(data[4]),Number(data[5]),Number(data[6]),data[3]);
      if(state === "Committing Phase"){
        return "You are too early, commiting phase is still running. Try again later.";
      } if(state === "Finished" || state === "Finalization Pending"){
        return "Sorry, you are too late. Auction state is already: "+state;
      } 
      return "";
    } catch (error: any) {
      throw new Error(error.message || 'Failed to commit the bid');
    }
  }

  async revealBid(
      _bidID: string,
      _auctionID: string,
      _nonce: string  
  ): Promise<string>{
    this.ensureInitialized();

     //alert(_bidID +""+_auctionID+""+_nonce);
    
    if(!this.isWalletConnected()){
      throw new Error('Could not place bid because Wallet is not connected.');
    }
   
    try {
      const accounts = await this.connectWallet();
      const result = await this.contract.methods
        .revealBid(Number(_bidID), Number(_auctionID), _nonce)
        .send({from: accounts[0]});

      if (result.status) {
        return result.transactionHash;
      } else {
        return "failed";
      }
    } catch (error: any) {
      return "failed";
      //throw new Error(error.message || 'Failed to commit the bid');
    }
  }

  async finalizeAuction(
      _auctionID: string
  ): Promise<string>{
    this.ensureInitialized();

     //alert(_bidID +""+_auctionID+""+_nonce);
    
    if(!this.isWalletConnected()){
      throw new Error('Could not finalize auction because Wallet is not connected.');
    }

    try {
      const accounts = await this.connectWallet();
      const result = await this.contract.methods
        .finalize(BigInt(_auctionID).valueOf())
        .send({from: accounts[0]});
      
      if (result.status) {
        return result.transactionHash;
      } else {
        return "failed";
      }
    } catch (error: any) {
      return "failed";
      //throw new Error(error.message || 'Failed to commit the bid');
    }
  }

  // Add check for contract initialization
  private ensureInitialized() {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }
  }

  public getContract() {
    this.ensureInitialized();
    return this.contract;
  }

} 