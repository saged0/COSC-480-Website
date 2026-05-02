// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BankAccount
 * @dev A simple but functional cryptocurrency bank account contract
 * Allows users to deposit, withdraw, and transfer funds
 */
contract BankAccount {
    // State variables
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lastWithdrawalTime;
    
    address[] public accountHolders;
    uint256 public totalDeposits;
    
    // Events
    event Deposit(address indexed account, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed account, uint256 amount, uint256 timestamp);
    event Transfer(address indexed from, address indexed to, uint256 amount, uint256 timestamp);
    event AccountCreated(address indexed account);

    /**
     * @dev Deposit ETH into the bank account
     * Emits a Deposit event
     */
    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        // Track new account holders
        if (balances[msg.sender] == 0) {
            accountHolders.push(msg.sender);
            emit AccountCreated(msg.sender);
        }
        
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Withdraw ETH from the bank account
     * @param amount The amount of ETH to withdraw
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        lastWithdrawalTime[msg.sender] = block.timestamp;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Transfer ETH to another account
     * @param recipient The address to receive the funds
     * @param amount The amount of ETH to transfer
     */
    function transfer(address recipient, uint256 amount) external {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Transfer amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[recipient] += amount;
        
        // Track new account holders
        if (balances[recipient] == amount) {
            accountHolders.push(recipient);
            emit AccountCreated(recipient);
        }
        
        emit Transfer(msg.sender, recipient, amount, block.timestamp);
    }

    /**
     * @dev Get the balance of an account
     * @param account The address to check
     * @return The balance in wei
     */
    function getBalance(address account) external view returns (uint256) {
        return balances[account];
    }

    /**
     * @dev Get the balance of the caller
     * @return The balance in wei
     */
    function getMyBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    /**
     * @dev Get the last withdrawal time for an account
     * @param account The address to check
     * @return The timestamp of the last withdrawal
     */
    function getLastWithdrawalTime(address account) external view returns (uint256) {
        return lastWithdrawalTime[account];
    }

    /**
     * @dev Get the total number of account holders
     * @return The number of accounts
     */
    function getAccountHolderCount() external view returns (uint256) {
        return accountHolders.length;
    }

    /**
     * @dev Get account holder by index
     * @param index The index in the accountHolders array
     * @return The address of the account holder
     */
    function getAccountHolder(uint256 index) external view returns (address) {
        require(index < accountHolders.length, "Index out of bounds");
        return accountHolders[index];
    }

    /**
     * @dev Get contract balance (total funds stored)
     * @return The total ETH balance of the contract
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Fallback function to accept ETH transfers
     */
    receive() external payable {
        if (balances[msg.sender] == 0) {
            accountHolders.push(msg.sender);
            emit AccountCreated(msg.sender);
        }
        
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
}
