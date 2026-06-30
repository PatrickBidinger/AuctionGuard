// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Auctioneer } from "./Auctioneer.sol";
import "hardhat/console.sol";
import { Test } from "forge-std/Test.sol";

contract AuctioneerTest is Test {
  Auctioneer auctioneer;
    address user1;
    address user2;
    address user3;
    address user4;
    string nonce1;
    string nonce2;

  function setUp() public {
    auctioneer = new Auctioneer();
    user1 = address(1);
    vm.deal(user1, 10 ether);
    user2 = address(2);
    vm.deal(user2, 10 ether);
    user3 = address(3);
    vm.deal(user3, 10 ether);
    user4 = address(4);
    vm.deal(user4, 10 ether);
    nonce1 = "iajfoiwejfijwfojfqffjeijqiejeq";
    nonce2 = "akjf89989qiwe91SAHFijfiqeofije";
  }


  function test_1_createAuction() public {
    vm.startPrank(user1);
    vm.expectRevert("The provided Fee is lower than required.");
    auctioneer.createAuction{value: 0}(1, 1, "Test");
    vm.stopPrank();

    vm.startPrank(user1);
    uint256 aucFee = auctioneer.getAuctionFee();
    vm.expectRevert("Commit duration and reveal duration must be lower than 31 days.");
    auctioneer.createAuction{value: aucFee}(2678401, 1, "Test");
    vm.stopPrank();

    vm.startPrank(user1);
    vm.expectRevert("Commit duration and reveal duration must be lower than 31 days.");
    auctioneer.createAuction{value: aucFee}(1, 2678401, "Test");
    vm.stopPrank();

    vm.startPrank(user1);
    auctioneer.createAuction{value: auctioneer.getAuctionFee()}(1, 1, "Test");
    vm.stopPrank();
  }

  function test_2_commitBid() public {
    uint256 auctionID_1 = createAuction(user1, auctioneer.getAuctionFee(), 1, 2, "This is auction Nr. 1"); 
    
    vm.startPrank(user1);
    bytes32 commitment = auctioneer.generateCommitment(auctionID_1, user1, 0, nonce1);
    vm.expectRevert("Deposit required");
    auctioneer.commitBid{value: 0 wei}(commitment);

    commitment = auctioneer.generateCommitment(auctionID_1, user1, 500, nonce1);
    auctioneer.commitBid{value: 500 wei}(commitment);
    vm.stopPrank();
  }

  function test_3_revealBid() public {
    uint256 auctionID_1 = createAuction(user1, auctioneer.getAuctionFee(), 1, 2, "This is auction Nr. 1"); 
    uint256 auctionID_2 = createAuction(user1, auctioneer.getAuctionFee(), 1, 2, "This is auction Nr. 2");
    uint256 bid_1 = commitBid(user2, 2, auctionID_1, nonce1);

    vm.expectRevert("Reveal not started");
    reveal(user2, bid_1, auctionID_1, nonce1);

    vm.warp(block.timestamp + 2); //time shift: + 2

    vm.expectRevert("Bid does not exist");
    reveal(user2, 3, auctionID_1, nonce1);

    vm.expectRevert("Auction does not exist");
    reveal(user2, bid_1, 3, nonce1);

    vm.expectRevert("Nonce must have max. of 100 Bytes");
    reveal(user2, bid_1, auctionID_1, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

    vm.warp(block.timestamp + 2); //time shift: + 4
    vm.expectRevert("Reveal ended");
    reveal(user2, bid_1, auctionID_1, nonce1);

    vm.warp(block.timestamp - 2); //time shift: + 2

    vm.expectRevert("Invalid reveal");
    reveal(user1, bid_1, auctionID_1, nonce1); //wrong bidder identity

    vm.expectRevert("Invalid reveal");
    reveal(user2, bid_1, auctionID_2, nonce1); //wrong auction

    vm.expectRevert("Invalid reveal");
    reveal(user2, bid_1, auctionID_1, "abc"); //wrong nonce

    reveal(user2, bid_1, auctionID_1, nonce1); //working reveal

    vm.expectRevert("Already revealed");
    reveal(user2, bid_1, auctionID_1, nonce1);



    vm.warp(block.timestamp - 2); //time shift: + 0
    uint256 bid_2 = commitBid(user2, 2, 3, nonce1);
    vm.warp(block.timestamp + 1); //time shift: + 1
    uint256 auctionID_3 = createAuction(user1, auctioneer.getAuctionFee(), 1, 2, "This is auction Nr. 3"); 
    vm.warp(block.timestamp + 3); //time shift: + 4
    uint256 bid_3 = commitBid(user2, 2, auctionID_3, nonce1);

    vm.expectRevert("Bid was commited before the auction started.");
    reveal(user2, bid_2, auctionID_3, nonce1);

    vm.expectRevert("Bid was not commited in time.");
    reveal(user2, bid_3, auctionID_3, nonce1);
  }

  function test_4_finalize() public {
    uint256 auctionID_1 = createAuction(user1, auctioneer.getAuctionFee(), 1, 2, "This is auction Nr. 1"); 
    
    vm.expectRevert("Auction does not exist");
    finalize(user2, 2);

    vm.expectRevert("It is too early to finalize this auction.");
    finalize(user2, auctionID_1);

    vm.warp(block.timestamp + 2); //time shift: + 2

    vm.expectRevert("It is too early to finalize this auction.");
    finalize(user2, auctionID_1);

    vm.warp(block.timestamp + 2); //time shift: + 4

    finalize(user2, auctionID_1);

    vm.expectRevert("Already finalized");
    finalize(user2, auctionID_1);
  }

  function test_5_generateCommitment() public {
    assertEq(auctioneer.generateCommitment(1, user1, 5, nonce1), bytes32(uint256(0xa9767be44d410fac0cf5623cf3123cea3f39593117306abb27f1bd3077b3d86a)));
    assertEq(auctioneer.generateCommitment(34, user2, 1, "abc"), bytes32(uint256(0xd5da67f46495fac34e575aefa1384ceb0f991f9af405a4fc5bddbae7974686c0)));
    assertEq(auctioneer.generateCommitment(2, user3, 56000, nonce2), bytes32(uint256(0x25b34d2597a4699fafaa49212f1cf21fd655c9bcd7fc1979207fe73ff2585e58)));
    assertEq(auctioneer.generateCommitment(3, user4, 55, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"), bytes32(uint256(0x3ae93d88d2985347757efc1c390d81a87fa5c54785697da2a436b05e13bce4be)));
  }


  /**
  Parameter: address user, uint256 wei_amount, uint256 _commitDuration, uint256 _revealDuration, string _description
  */
  function createAuction(address _user, uint256 _wei_amount, uint256 _commitDuration, uint256 _revealDuration, string memory _description) public returns (uint256) {
      vm.startPrank(_user);
      uint256 auctionID = auctioneer.createAuction{value: _wei_amount}(_commitDuration, _revealDuration, _description);
      //console.log("Auction created with AuctionID: ",auctionID);
      vm.stopPrank();
      return auctionID;
  }

  function commitBid(address _user, uint256 _wei_amount, uint256 _auctionID, string memory _nonce) public returns (uint256){
      vm.startPrank(_user);
      bytes32 commitment = auctioneer.generateCommitment(_auctionID, _user, _wei_amount, _nonce);
      uint256 bidID = auctioneer.commitBid{value: _wei_amount}(commitment);
      //console.log("Bid commited with BidID: ",bidID);
      vm.stopPrank();
      return bidID;
  }

  function reveal(address _user, uint256 _bidID, uint256 _auctionID, string memory _nonce) public {
      vm.startPrank(_user);
      auctioneer.revealBid(_bidID, _auctionID, _nonce);
      vm.stopPrank();
  }

    function finalize(address _user, uint256 _auctionID) public {
      vm.startPrank(_user);
      auctioneer.finalize( _auctionID);
      vm.stopPrank();
  }

}