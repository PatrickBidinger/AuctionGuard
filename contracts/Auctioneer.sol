// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {console} from "forge-std/console.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Auctioneer is ReentrancyGuard {

    uint256 public auctionCounter = 0;
    uint256 public globalBidCounter = 0;

    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => BidCommit) public bids;

    event AuctionCreated(uint256 auctionId, address seller, string description, uint256 fee, uint256 startTime, uint256 commitEndTime, uint256 revealEndTime);
    event BidCommitted(uint256 bidID, address bidder, uint256 deposit, uint256 commitTime);
    event BidRevealed(uint256 bidID, uint256 auctionId, uint256 IDofRefundedBid);
    event AuctionFinalized(uint256 auctionId, uint256 highestBidID, uint256 totalBids);

    struct Auction {
        string description;
        address payable seller;
        uint256 fee;
        uint256 startTime;
        uint256 commitEndTime;
        uint256 revealEndTime;
        
        bool finalized;
        uint256 highestBidID;
        uint256 totalBids;
    }

    struct BidCommit {
        bytes32 commitment;
        uint256 deposit;
        address bidder;
        uint256 commitTime;

        bool validReveal;
        bool depositRefunded;

        //revealed information
        uint256 auctionID;
    }


    /// @notice this function can be used to create an auction. 
    /// Auctions start immediately after they are created. 
    function createAuction(
        uint256 _commitDuration,
        uint256 _revealDuration,
        string memory _description
    ) external payable returns (uint256)  {

        require(msg.value >= getAuctionFee(), "The provided Fee is lower than required."); 
        require(_commitDuration <= 2678400 && _revealDuration <= 2678400, "Commit duration and reveal duration must be lower than 31 days."); 
        require(bytes(_description).length <= 500, "Description exeeded the max length of 500 bytes.");

        uint256 auctionID = ++auctionCounter;

        auctions[auctionID] = Auction({
            seller: payable(msg.sender),
            fee: msg.value,
            startTime: block.timestamp,
            commitEndTime: block.timestamp + _commitDuration,
            revealEndTime: block.timestamp + _commitDuration + _revealDuration,
            finalized: false,
            highestBidID: 0,
            totalBids: 0,
            description: _description
        });

        emit AuctionCreated(auctionID, msg.sender, _description, msg.value, block.timestamp, block.timestamp + _commitDuration, block.timestamp + _commitDuration + _revealDuration);
        return auctionID;
    }

    // Phase 1: commit hashed bid
    /// @notice Bids can be commited using this function during the "commiting phase" of an auction". 
    /// The commmit will only be transmitted and stored as a hash at this state. 
    /// The bidden amount is public and has to be paid as deposit, 
    /// but the bid cannot be connected to the auction that it belongs to (until it is revealed).
    function commitBid(bytes32 _commitment) external payable returns (uint256) {
        require(msg.value > 0, "Deposit required");

        uint256 bidID = ++globalBidCounter;

        bids[bidID] = BidCommit({
            commitment: _commitment,
            deposit: msg.value,
            bidder: msg.sender,
            commitTime: block.timestamp,
            validReveal: false,
            depositRefunded: false,
            auctionID: 0
        });

        emit BidCommitted(bidID, msg.sender, msg.value, block.timestamp);
        return bidID;
    }

    // Phase 2: reveal bid
    /// @notice Reveal bids during the "revealing phase" of an auction. 
    /// Using this, commited bids will be published. 
    /// It automatically calculates the highest (current) bid and already refunds a bidder, 
    /// if his bid is lower than that.  
    function revealBid(
        uint256 _bidID,
        uint256 _auctionID,
        string memory _nonce
    ) external nonReentrant returns (uint256){
        require(_bidID <= globalBidCounter, "Bid does not exist");
        require(_auctionID <= auctionCounter, "Auction does not exist");
        require(bytes(_nonce).length <= 500, "Nonce must have max. of 100 Bytes");

        Auction storage auction = auctions[_auctionID];
        BidCommit storage bidCommit = bids[_bidID];

        //Currently in reveal phase (phase 2)?
        require(block.timestamp > auction.commitEndTime, "Reveal not started");
        require(block.timestamp <= auction.revealEndTime, "Reveal ended");

        require(!bidCommit.validReveal, "Already revealed");
        require(bidCommit.commitTime >= auction.startTime, "Bid was commited before the auction started.");
        require(bidCommit.commitTime <= auction.commitEndTime, "Bid was not commited in time.");

        bytes32 computedCommitment = this.generateCommitment(_auctionID, msg.sender, bidCommit.deposit, _nonce);
        require(computedCommitment == bidCommit.commitment, "Invalid reveal");

        bidCommit.validReveal = true;
        bidCommit.auctionID = _auctionID;
        auction.totalBids++;
        //reveal done now
        
        //processing of new highest bid
        if(auction.highestBidID == 0){
            auction.highestBidID = _bidID;
            emit BidRevealed(_bidID, _auctionID, 0);
        } else{
            BidCommit storage higestBidCommit = bids[auction.highestBidID];
            BidCommit storage refundedBid;
            uint256 refundedBidID;
            if (bidCommit.deposit > higestBidCommit.deposit) { //new reveal is higher
                refundedBid = higestBidCommit; //refund deposit to previous highest 
                refundedBidID = auction.highestBidID; //set new highest
                auction.highestBidID = _bidID; //set new highest
            } else{ //new reveal is lower
                refundedBidID = _bidID;
                refundedBid = bidCommit; //just refund the deposit of the revealed bid
            }
            //BidCommit storage refundBid = bids[refundedBidID];
            refundedBid.depositRefunded = true;
            (bool successPayment, ) = payable(refundedBid.bidder).call{
            value: refundedBid.deposit}("");
            require(successPayment, "Refund failed");
            emit BidRevealed(_bidID, _auctionID, refundedBidID);
        }
        
        return 0;
    }

    /// @notice Before a reveal is actually written to the blockchain, 
    /// the UI can use this view-only function to preCheck that reveal is correct and will go through. 
    /// This helps to reduce unnecessary gas costs due to faulty reveals.
    function revealBidPrecheck(
        uint256 _bidID,
        uint256 _auctionID,
        string memory _nonce
    ) external view returns (uint8) {
        if(_bidID > globalBidCounter){//Bid does not exist
            return 5; 
        } else if(_auctionID > auctionCounter){//Auction does not exist
            return 6; 
        }

        Auction storage auction = auctions[_auctionID];
        BidCommit storage bidCommit = bids[_bidID];

        if(bidCommit.validReveal){//Already revealed
            return 1; 
        }
        if(!(bidCommit.commitTime >= auction.startTime)){ //Bid was commited before the auction started.
            return 2; 
        }
        if(!(bidCommit.commitTime <= auction.commitEndTime)){ //Bid was not commited in time.
            return 3;
        }
        bytes32 computedCommitment = this.generateCommitment(_auctionID, msg.sender, bidCommit.deposit, _nonce);
        if(!(computedCommitment == bidCommit.commitment)){ //Hash compare failed)
            return 4;
        }
        return 0;
    }

    /// @notice Last Step in the auction lifecycle. 
    /// The auction will transition from "Finalization Pending" to "Finished" state. 
    function finalize(uint256 _auctionID) external nonReentrant {
        require(_auctionID <= auctionCounter, "Auction does not exist");
        
        Auction storage auction = auctions[_auctionID];
        BidCommit storage highestBid = bids[auction.highestBidID];
        
        //already finalized?
        require(!auction.finalized, "Already finalized");
        require(block.timestamp > auction.revealEndTime, "It is too early to finalize this auction.");
        auction.finalized = true;
        
        //pay out seller (with the amount of the highest bid
        if (highestBid.bidder != address(0)) {
            (bool successPayment, ) = payable(auction.seller).call{value: highestBid.deposit}("");
            require(successPayment, "Refund failed");
        }

        /*
            TODO: at this point, the sold product needs to be transfered to the auction winner. 
            Our application is meant as a demonstration for the auction functionallity. 
            The actual product can easiliy be plugged in here, but is out of scope for our project.
        */

        //reward the finalization caller with the acution fee
        (bool successPayment2, ) = payable(msg.sender).call{value: auction.fee}("");
        require(successPayment2, "Refund failed");

        emit AuctionFinalized(_auctionID, auction.highestBidID, auction.totalBids);
    }


    /// @notice this function calculates the commitment hash for bids
    function generateCommitment(
        uint256 _auctionID,
        address _bidder,
        uint256 _amount,
        string memory _nonce
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(_auctionID, _bidder, _amount, _nonce));
    }

    function getAuction(uint256 _auctionID) external view returns(
        string memory description,
        address seller,
        uint256 fee,
        bool finalized,
        uint256 startTime,
        uint256 commitEndTime,
        uint256 revealEndTime,
        uint256 highestBidID,
        uint256 totalBids
    ){
        Auction memory auction = auctions[_auctionID];
        return (
            auction.description,
            auction.seller,
            auction.fee,
            auction.finalized,
            auction.startTime,
            auction.commitEndTime,
            auction.revealEndTime,
            auction.highestBidID,
            auction.totalBids        
        );
    }

    function getMaxAuctionID() external view returns(uint256){
        return auctionCounter;
    }

    function getBid(uint256 _bidID) external view returns(
        bytes32 commitment,
        uint256 deposit,
        address bidder,
        uint256 commitTime,
        bool validReveal,
        bool depositRefunded,
        uint256 auctionID
    ){
        BidCommit memory bid = bids[_bidID];
        return (
            bid.commitment,
            bid.deposit,
            bid.bidder,
            bid.commitTime,
            bid.validReveal,
            bid.depositRefunded,
            bid.auctionID
        );
    }

    function getAuctionFee() public pure returns(uint256){
        return 1e17;
    }

    function getMaxBidID() external view returns(uint256){
        return globalBidCounter;
    }
}