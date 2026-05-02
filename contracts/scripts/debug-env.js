const path = require('path');
const dotenv = require('dotenv');
console.log('cwd:', process.cwd());
console.log('env path:', path.resolve('.env'));
const result = dotenv.config();
console.log('config error:', result.error ? result.error.message : 'none');
console.log('parsed keys:', result.parsed ? Object.keys(result.parsed) : 'none');
console.log('SEPOLIA_RPC_URL:', process.env.SEPOLIA_RPC_URL);
console.log('PRIVATE_KEY present:', Boolean(process.env.PRIVATE_KEY));
