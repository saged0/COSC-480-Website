const hre = require("hardhat");

async function main() {
  console.log("Deploying BankAccount contract...");

  // Get the contract factory
  const BankAccount = await hre.ethers.getContractFactory("BankAccount");

  // Deploy the contract
  const bankAccount = await BankAccount.deploy();
  await bankAccount.waitForDeployment();

  console.log("BankAccount deployed to:", await bankAccount.getAddress());

  const deployedAddress = await bankAccount.getAddress();

  // Display contract info
  console.log("\n Contract Information:");
  console.log("------------------------");
  console.log("Contract Address:", deployedAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
