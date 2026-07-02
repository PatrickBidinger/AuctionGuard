# AuctionGuard
AuctionGuard is a blockchain-based auction system. The type of auction is First-Price Sealed-Bid Auction (FPSB). FPSB auctions consist of two stages: 
- *Stage 1)* the bidding phase, in which everyone can submit bids without revealing the amounts.
- *Stage 2)* the revealing phase, in which everyone must reveal the details of the bids they submitted.

In our system, in *stage 1)*, instead of hiding the bidden amount, bids are placed without containing information about which auction they belong to. Consequently, one can know that bids with certain amounts were made, but one cannot match unrevealed bids with their corresponding auction. This auction type works best on blockchain. However, it prerequisites that always plenty of parallel auctions exist so that a mapping of auctions and bids before the bid reveal remains impossible. 
 
## Installment Instructions
### Download the Project
Clone the repository to your local disk or download it. In the case that it is compressed, unzip it. 
### Install Requirements
1. Open the project folder in a terminal
2. Check installment of Node.JS and npm:
```
node -v
npm -v
```
3. Change to client folder: `cd client`
4. Install npm requirements: `npm install` and `npm install web3 lucide-react sonner ethers`
5. Change to project root: `cd ..`
6. Install requirements: `npm install hardhat`
7. Make sure, the official MetaMask plugin is installed and set up in your browser

### Run Project on Hardhat Blockchain
1. Start Hardhat Blockchain: `npm run node`.
2. Add local Blockchain to MetaMask:

Open MetaMask, click the menu icon, choose `Networks`, then click `Add a custom network`.

Use these network values:
```
Network name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
```
3. Import one or multiple accounts from the HardHat Network to MetaMask:

After the HardHat network was started in the previous steps, there are several testing accounts printed.

Choose one private key from the list.

In MetaMask:

- Open the account menu.
- Select `Import account`.
- Paste the Hardhat private key.
- Import the account.

The account should show test ETH on Hardhat Local.
These private keys are public and unsafe. Use them only on Hardhat Local.

4. Deploy the SmartContract in the hardhat network: 

Open a new terminal. Within the project root run `npm run deploy:local`.

5. Run the Frontend:

Open another new terminal. Within the `client` folder run `npm run dev`.

This project was tested on node version v26.4.0 and npm version 11.17.0. We used Firefox with the official MetaMask plugin for testing purposes. 
Some parts of the setup were taken from the [IP-Shield Project](https://github.com/farhannaza/IP-Protection/tree/main). 
