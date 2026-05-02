/* Minimal MetaMask / ethers.js helpers (v5) */
async function connectWallet() {
  if (!window.ethereum) {
    alert('MetaMask not found');
    return null;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
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
