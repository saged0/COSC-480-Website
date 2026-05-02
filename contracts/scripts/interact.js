const path = require("path");
const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");

// Load environment variables (Hardhat config already loaded .env)
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Load contract ABI
const contractABI = require("../artifacts/contracts/BankAccount.sol/BankAccount.json").abi;

async function main() {
  // Validate environment variables
  if (!SEPOLIA_RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.error("❌ Error: Missing environment variables");
    console.error("Required:");
    console.error("  - SEPOLIA_RPC_URL: Your Alchemy API endpoint");
    console.error("  - PRIVATE_KEY: Your wallet private key");
    console.error("  - CONTRACT_ADDRESS: Deployed contract address");
    console.error("\nAdd these to your .env file and try again.");
    process.exit(1);
  }

  console.log("🏦 Crypto Bank Account Interaction Script");
  console.log("==========================================\n");

  // Create provider and signer
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  // Create contract instance
  const bankAccount = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

  console.log(`📍 Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`💼 Your Address: ${signer.address}`);
  console.log(`🌐 Network: Sepolia\n`);

  try {
    // Step 1: Read initial balance
    console.log("📖 Step 1: Reading your current balance...");
    const initialBalance = await bankAccount.getMyBalance();
    console.log(`   Your balance: ${ethers.formatEther(initialBalance)} ETH\n`);

    // Step 2: Deposit funds (optional - if balance is 0)
    if (initialBalance === 0n) {
      console.log("💰 Step 2: Making a deposit...");
      const depositAmount = ethers.parseEther("0.1"); // 0.1 ETH
      console.log(`   Depositing ${ethers.formatEther(depositAmount)} ETH...`);
      
      const depositTx = await bankAccount.deposit({ value: depositAmount });
      console.log(`   Transaction hash: ${depositTx.hash}`);
      
      console.log("   ⏳ Waiting for transaction to be mined...");
      await depositTx.wait();
      console.log("   ✅ Deposit confirmed!\n");

      // Read updated balance
      const newBalance = await bankAccount.getMyBalance();
      console.log(`   Updated balance: ${ethers.formatEther(newBalance)} ETH\n`);
    } else {
      console.log("✓ Already have a balance, skipping deposit.\n");
    }

    // Step 3: Get contract statistics
    console.log("📊 Step 3: Contract Statistics");
    const contractBalance = await bankAccount.getContractBalance();
    const accountHolderCount = await bankAccount.getAccountHolderCount();
    
    console.log(`   Total contract balance: ${ethers.formatEther(contractBalance)} ETH`);
    console.log(`   Total account holders: ${accountHolderCount}\n`);

    // Step 4: Get last withdrawal time
    console.log("📅 Step 4: Account History");
    const lastWithdrawalTime = await bankAccount.getLastWithdrawalTime(signer.address);
    
    if (lastWithdrawalTime === 0n) {
      console.log("   Last withdrawal: Never\n");
    } else {
      const date = new Date(Number(lastWithdrawalTime) * 1000);
      console.log(`   Last withdrawal: ${date.toLocaleString()}\n`);
    }

    // Step 5: Display menu for further interactions
    console.log("🔄 Available Actions:");
    console.log("   1. Deposit more ETH (uncomment code below)");
    console.log("   2. Withdraw ETH (uncomment code below)");
    console.log("   3. Transfer to another address (uncomment code below)\n");

    // Optional interactions - uncomment to use:
    
    // EXAMPLE: Deposit additional funds
    /*
    console.log("💰 Depositing additional funds...");
    const additionalDeposit = ethers.parseEther("0.05");
    const tx1 = await bankAccount.deposit({ value: additionalDeposit });
    await tx1.wait();
    console.log("✅ Deposit successful!\n");
    */

    // EXAMPLE: Withdraw funds
    /*
    console.log("🏧 Withdrawing funds...");
    const withdrawAmount = ethers.parseEther("0.02");
    const tx2 = await bankAccount.withdraw(withdrawAmount);
    console.log(`Transaction hash: ${tx2.hash}`);
    await tx2.wait();
    console.log("✅ Withdrawal successful!\n");
    */

    // EXAMPLE: Transfer to another address
    /*
    console.log("🔄 Transferring funds to another address...");
    const recipientAddress = "0x..."; // Replace with actual address
    const transferAmount = ethers.parseEther("0.01");
    const tx3 = await bankAccount.transfer(recipientAddress, transferAmount);
    console.log(`Transaction hash: ${tx3.hash}`);
    await tx3.wait();
    console.log("✅ Transfer successful!\n");
    */

    // Final balance
    console.log("💰 Final Balance");
    const finalBalance = await bankAccount.getMyBalance();
    console.log(`   Your balance: ${ethers.formatEther(finalBalance)} ETH\n`);

    console.log("✅ Interaction script completed successfully!");

  } catch (error) {
    console.error("❌ Error during interaction:", error.message);
    process.exit(1);
  }
}

main();
