const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BankAccount Contract", function () {
  let bankAccount;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const BankAccount = await ethers.getContractFactory("BankAccount");
    bankAccount = await BankAccount.deploy();
    await bankAccount.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const contractAddress = await bankAccount.getAddress();
      expect(contractAddress).to.be.properAddress;
    });

    it("Should have zero total deposits on deployment", async function () {
      expect(await bankAccount.totalDeposits()).to.equal(0n);
    });
  });

  describe("Deposit", function () {
    it("Should allow user to deposit ETH", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const tx = await bankAccount.deposit({ value: depositAmount });
      await tx.wait();

      expect(await bankAccount.getBalance(owner.address)).to.equal(depositAmount);
    });

    it("Should revert deposit with 0 amount", async function () {
      await expect(
        bankAccount.deposit({ value: 0 })
      ).to.be.revertedWith("Deposit amount must be greater than 0");
    });

    it("Should emit Deposit event", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const tx = await bankAccount.deposit({ value: depositAmount });
      const receipt = await tx.wait();
      
      const events = receipt.logs;
      expect(events.length).to.be.greaterThan(0);
    });

    it("Should create account on first deposit", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await expect(
        bankAccount.connect(addr1).deposit({ value: depositAmount })
      )
        .to.emit(bankAccount, "AccountCreated")
        .withArgs(addr1.address);
    });

    it("Should increase total deposits", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await bankAccount.deposit({ value: depositAmount });
      await bankAccount.connect(addr1).deposit({ value: depositAmount });

      expect(await bankAccount.totalDeposits()).to.equal(depositAmount * 2n);
    });

    it("Should allow multiple deposits", async function () {
      const amount1 = ethers.parseEther("1.0");
      const amount2 = ethers.parseEther("2.0");

      await bankAccount.deposit({ value: amount1 });
      await bankAccount.deposit({ value: amount2 });

      expect(await bankAccount.getBalance(owner.address)).to.equal(amount1 + amount2);
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseEther("5.0");
      await bankAccount.deposit({ value: depositAmount });
    });

    it("Should allow user to withdraw ETH", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      const tx = await bankAccount.withdraw(withdrawAmount);
      await tx.wait();

      expect(await bankAccount.getBalance(owner.address)).to.equal(
        ethers.parseEther("4.0")
      );
    });

    it("Should revert withdrawal with 0 amount", async function () {
      await expect(
        bankAccount.withdraw(0)
      ).to.be.revertedWith("Withdrawal amount must be greater than 0");
    });

    it("Should revert withdrawal with insufficient balance", async function () {
      const withdrawAmount = ethers.parseEther("10.0");
      await expect(
        bankAccount.withdraw(withdrawAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should emit Withdrawal event", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      const tx = await bankAccount.withdraw(withdrawAmount);
      const receipt = await tx.wait();
      
      const events = receipt.logs;
      expect(events.length).to.be.greaterThan(0);
    });

    it("Should update last withdrawal time", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      const tx = await bankAccount.withdraw(withdrawAmount);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      expect(await bankAccount.getLastWithdrawalTime(owner.address)).to.equal(BigInt(block.timestamp));
    });
  });

  describe("Transfer", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseEther("5.0");
      await bankAccount.deposit({ value: depositAmount });
    });

    it("Should allow user to transfer ETH to another account", async function () {
      const transferAmount = ethers.parseEther("2.0");
      const tx = await bankAccount.transfer(addr1.address, transferAmount);
      await tx.wait();

      expect(await bankAccount.getBalance(owner.address)).to.equal(
        ethers.parseEther("3.0")
      );
      expect(await bankAccount.getBalance(addr1.address)).to.equal(transferAmount);
    });

    it("Should revert transfer with 0 amount", async function () {
      await expect(
        bankAccount.transfer(addr1.address, 0)
      ).to.be.revertedWith("Transfer amount must be greater than 0");
    });

    it("Should revert transfer with invalid recipient", async function () {
      const transferAmount = ethers.parseEther("1.0");
      await expect(
        bankAccount.transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWith("Invalid recipient address");
    });

    it("Should revert transfer with insufficient balance", async function () {
      const transferAmount = ethers.parseEther("10.0");
      await expect(
        bankAccount.transfer(addr1.address, transferAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should emit Transfer event", async function () {
      const transferAmount = ethers.parseEther("1.0");
      const tx = await bankAccount.transfer(addr1.address, transferAmount);
      const receipt = await tx.wait();
      
      const events = receipt.logs;
      expect(events.length).to.be.greaterThan(0);
    });

    it("Should create recipient account if new", async function () {
      const transferAmount = ethers.parseEther("1.0");
      await expect(
        bankAccount.transfer(addr2.address, transferAmount)
      )
        .to.emit(bankAccount, "AccountCreated")
        .withArgs(addr2.address);
    });
  });

  describe("Balance Queries", function () {
    it("Should return correct balance for getBalance()", async function () {
      const depositAmount = ethers.parseEther("3.0");
      await bankAccount.deposit({ value: depositAmount });

      expect(await bankAccount.getBalance(owner.address)).to.equal(depositAmount);
    });

    it("Should return correct balance for getMyBalance()", async function () {
      const depositAmount = ethers.parseEther("2.5");
      await bankAccount.connect(addr1).deposit({ value: depositAmount });

      expect(await bankAccount.connect(addr1).getMyBalance()).to.equal(depositAmount);
    });

    it("Should return correct contract balance", async function () {
      const amount1 = ethers.parseEther("1.0");
      const amount2 = ethers.parseEther("2.0");

      await bankAccount.deposit({ value: amount1 });
      await bankAccount.connect(addr1).deposit({ value: amount2 });

      expect(await bankAccount.getContractBalance()).to.equal(amount1 + amount2);
    });
  });

  describe("Account Holders", function () {
    it("Should track account holders", async function () {
      await bankAccount.deposit({ value: ethers.parseEther("1.0") });
      await bankAccount.connect(addr1).deposit({ value: ethers.parseEther("1.0") });

      expect(await bankAccount.getAccountHolderCount()).to.equal(2n);
    });

    it("Should retrieve account holder by index", async function () {
      await bankAccount.deposit({ value: ethers.parseEther("1.0") });
      await bankAccount.connect(addr1).deposit({ value: ethers.parseEther("1.0") });

      expect(await bankAccount.getAccountHolder(0)).to.equal(owner.address);
      expect(await bankAccount.getAccountHolder(1)).to.equal(addr1.address);
    });

    it("Should revert on invalid index", async function () {
      await expect(
        bankAccount.getAccountHolder(10)
      ).to.be.revertedWith("Index out of bounds");
    });
  });
});
