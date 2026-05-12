/* Minimal MetaMask / ethers.js helpers (v5) */
async function connectWallet() {
  console.log('connectWallet called');
  if (!window.ethereum) {
    console.log('MetaMask not found');
    alert('MetaMask not found');
    return null;
  }

  console.log('Connecting to MetaMask...');
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  console.log('Connected address:', address);
  sessionStorage.setItem('walletAddress', address);
  return address;
}

async function buyTicket(contractAddress, ticketPriceEth, eventId) {
  if (!window.ethereum) {
    alert('MetaMask required');
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const abi = [
    'function buyTicket(uint256) payable returns (uint256)',
    'function getMyTickets() view returns (uint256[])'
  ];
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const value = ethers.utils.parseEther(ticketPriceEth);

  try {
    const tx = await contract.buyTicket(eventId, { value });
    const receipt = await tx.wait();
    // fetch tickets and take last ticket as purchased
    const readContract = new ethers.Contract(contractAddress, abi, provider);
    const tickets = await readContract.getMyTickets();
    const ticketId = tickets[tickets.length - 1]?.toString();

    // POST to server to persist
    await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, walletAddress: await signer.getAddress(), ticketId, txHash: receipt.transactionHash })
    });

    alert('Ticket purchased: ' + ticketId);
    return ticketId;
  } catch (err) {
    console.error(err);
    alert('Purchase failed');
  }
}

async function loadMyTickets(contractAddress, walletAddress) {
  try {
    if (walletAddress) {
      const response = await fetch(`/api/tickets?walletAddress=${encodeURIComponent(walletAddress)}`);
      if (response.ok) {
        const data = await response.json();
        return (data.tickets || []).map((ticket) => ticket.ticketId?.toString?.() || String(ticket.ticketId));
      }
    }

    if (!window.ethereum) return [];
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const abi = ['function getMyTickets() view returns (uint256[])'];
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const list = await contract.getMyTickets();
    return list.map((v) => v.toString());
  } catch (err) {
    console.error(err);
    return [];
  }
}

window.connectWallet = connectWallet;
window.buyTicket = buyTicket;
window.loadMyTickets = loadMyTickets;

async function getAdminBalance(contractAddress) {
  if (!window.ethereum) {
    alert('MetaMask required');
    return null;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const abi = ['function adminBalance() view returns (uint256)'];
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const balance = await contract.adminBalance();
    return ethers.utils.formatEther(balance);
  } catch (err) {
    console.error('Error fetching admin balance:', err);
    return null;
  }
}

async function withdrawAdminBalance(contractAddress) {
  if (!window.ethereum) {
    alert('MetaMask required');
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const abi = ['function withdrawAdminBalance() external'];
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const tx = await contract.withdrawAdminBalance();
    const receipt = await tx.wait();
    alert('Withdrawal successful! Tx: ' + receipt.transactionHash);
    return receipt;
  } catch (err) {
    console.error('Error withdrawing:', err);
    alert('Withdrawal failed: ' + err.message);
    return null;
  }
}

window.getAdminBalance = getAdminBalance;
window.withdrawAdminBalance = withdrawAdminBalance;
