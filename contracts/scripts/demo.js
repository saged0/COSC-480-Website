const hre = require("hardhat");
const { ethers } = hre;

async function runStep(label, action) {
  process.stdout.write(`- ${label}... `);
  await action();
  console.log("OK");
}

async function printBalances(bank, owner, user1) {
  const ownerBalance = await bank.getBalance(owner.address);
  const user1Balance = await bank.getBalance(user1.address);
  const contractBalance = await bank.getContractBalance();

  console.log(`  Owner balance: ${ethers.formatEther(ownerBalance)} ETH`);
  console.log(`  User1 balance: ${ethers.formatEther(user1Balance)} ETH`);
  console.log(`  Contract balance: ${ethers.formatEther(contractBalance)} ETH`);
}

async function main() {
  console.log("Crypto Bank Account Demo");
  console.log("========================");

  const [owner, user1] = await ethers.getSigners();

  const BankAccount = await ethers.getContractFactory("BankAccount");
  const bank = await BankAccount.deploy();
  await bank.waitForDeployment();

  console.log(`Contract deployed: ${await bank.getAddress()}`);
  console.log(`Network: ${hre.network.name}\n`);

  await runStep("Owner deposits 5 ETH", async () => {
    const tx = await bank.deposit({ value: ethers.parseEther("5") });
    await tx.wait();
  });

  await runStep("Owner transfers 2 ETH to User1", async () => {
    const tx = await bank.transfer(user1.address, ethers.parseEther("2"));
    await tx.wait();
  });

  await runStep("User1 withdraws 1 ETH", async () => {
    const tx = await bank.connect(user1).withdraw(ethers.parseEther("1"));
    await tx.wait();
  });

  console.log("\nFinal state:");
  await printBalances(bank, owner, user1);

  const holders = await bank.getAccountHolderCount();
  console.log(`  Account holders tracked: ${holders.toString()}`);

  console.log("\nDemo complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
