const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("@nomicfoundation/hardhat-toolbox");

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
const networks = {
  hardhat: {},
};

if (sepoliaRpcUrl) {
  networks.sepolia = {
    url: sepoliaRpcUrl,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  };
}

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks,
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
};
