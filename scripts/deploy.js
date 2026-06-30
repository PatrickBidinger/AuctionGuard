import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { artifacts, network } from "hardhat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getExplorerTxBaseUrl(chainId) {
  if (chainId === "11155111") {
    return "https://sepolia.etherscan.io/tx/";
  }

  return "";
}

function getNetworkName(chainId, networkName) {
  if (chainId === "31337") {
    return "Hardhat Local";
  }

  if (chainId === "11155111") {
    return "Sepolia Testnet";
  }

  return networkName;
}

async function main() {
  const connection = await network.create();
  const { ethers } = connection;

  const auctioneer = await ethers.deployContract("Auctioneer");
  await auctioneer.waitForDeployment();

  const address = await auctioneer.getAddress();
  const providerNetwork = await ethers.provider.getNetwork();
  const chainId = providerNetwork.chainId.toString();

  const artifact = await artifacts.readArtifact("Auctioneer");
  const deployment = {
    address,
    abi: artifact.abi,
    explorerTxBaseUrl: getExplorerTxBaseUrl(chainId),
    network: chainId,
    networkName: getNetworkName(chainId, connection.networkName),
  };

  const deploymentDir = path.join(__dirname, "..", "client", "lib", "deployments");
  fs.mkdirSync(deploymentDir, { recursive: true });
  fs.writeFileSync(
    path.join(deploymentDir, `${chainId}.json`),
    JSON.stringify(deployment, null, 2),
  );

  console.log(`Auctioneer deployed to ${address} on chain ${chainId}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});