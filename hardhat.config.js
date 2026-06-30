import "dotenv/config";
import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-ethers";

const { PRIVATE_KEY, SEPOLIA_RPC_URL, ALCHEMY_API_KEY } = process.env;

const sepoliaRpcUrl = SEPOLIA_RPC_URL || (
  ALCHEMY_API_KEY ? `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}` : undefined
);

const normalizedPrivateKey = PRIVATE_KEY
  ? (PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`)
  : undefined;

const networks = {
  localhost: {
    type: "http",
    chainType: "l1",
    url: "http://127.0.0.1:8545",
  },
};

if (sepoliaRpcUrl && normalizedPrivateKey) {
  networks.sepolia = {
    type: "http",
    chainType: "l1",
    url: sepoliaRpcUrl,
    accounts: [normalizedPrivateKey],
  };
}

export default defineConfig({
  plugins: [hardhatEthers],
  solidity: "0.8.20",
  networks,
});