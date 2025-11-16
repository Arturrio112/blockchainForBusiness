const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying contracts...");

  // Deploy NFTFractionalization
  const NFTFractionalization = await hre.ethers.getContractFactory("NFTFractionalization");
  const fractionalization = await NFTFractionalization.deploy();
  await fractionalization.waitForDeployment();
  const fractionalizationAddress = await fractionalization.getAddress();
  console.log("NFTFractionalization deployed to:", fractionalizationAddress);

  // Deploy FractionalMarketplace
  const FractionalMarketplace = await hre.ethers.getContractFactory("FractionalMarketplace");
  const marketplace = await FractionalMarketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("FractionalMarketplace deployed to:", marketplaceAddress);

  // Deploy MockNFT for testing
  const MockNFT = await hre.ethers.getContractFactory("MockNFT");
  const mockNFT = await MockNFT.deploy();
  await mockNFT.waitForDeployment();
  const mockNFTAddress = await mockNFT.getAddress();
  console.log("MockNFT deployed to:", mockNFTAddress);

  // Save deployment addresses
  const deploymentData = {
    fractionalization: fractionalizationAddress,
    marketplace: marketplaceAddress,
    mockNFT: mockNFTAddress,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };

  // Ensure directory exists
  const path = require('path');
  const dir = path.join(__dirname, '..', 'src', 'contracts');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, 'deployments.json');
  fs.writeFileSync(
    filePath,
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT ADDRESSES");
  console.log("=".repeat(60));
  console.log("NFTFractionalization:", fractionalizationAddress);
  console.log("FractionalMarketplace:", marketplaceAddress);
  console.log("MockNFT:", mockNFTAddress);
  console.log("=".repeat(60));
  console.log("\n Deployment addresses saved to:", filePath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

