const hre = require("hardhat");

async function main() {
  console.log("Deploying TicketSale contract...");

  const TicketSale = await hre.ethers.getContractFactory("TicketSale");
  const ticketSale = await TicketSale.deploy();
  await ticketSale.waitForDeployment();

  console.log("TicketSale deployed to:", await ticketSale.getAddress());

  console.log("\n Contract Information:");
  console.log("------------------------");
  console.log("Contract Address:", await ticketSale.getAddress());
  console.log("Network:", hre.network.name);
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
