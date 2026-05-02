const path = require("path");
// Try loading a local .env next to the contracts folder first, then fallback to the repo root .env
const localEnv = path.resolve(__dirname, ".env");
const rootEnv = path.resolve(__dirname, "..", ".env");

const dotenv = require("dotenv");
let loaded = null;

if (require('fs').existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
  loaded = localEnv;
} else if (require('fs').existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
  loaded = rootEnv;
}

const missing = [];

if (!process.env.SEPOLIA_RPC_URL) {
  missing.push("SEPOLIA_RPC_URL");
}

if (!process.env.PRIVATE_KEY) {
  missing.push("PRIVATE_KEY");
}

if (missing.length > 0) {
  console.error("Missing required environment variables for Sepolia deployment:");
  for (const name of missing) {
    console.error(`- ${name}`);
  }

  if (loaded) {
    console.error(`\nTried loading environment from: ${loaded}`);
  } else {
    console.error('\nNo .env file found in contracts/ or repository root.');
  }

  console.error("\nAdd them to your .env file, then run npm run deploy:sepolia again.");
  process.exit(1);
}

console.log("Environment check passed.", loaded ? `(loaded from ${loaded})` : '');