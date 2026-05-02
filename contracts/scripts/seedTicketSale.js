const hre = require('hardhat');

const SAMPLE_EVENTS = [
  {
    name: 'Midnight Express',
    date: Math.floor(new Date('2026-05-12T00:00:00Z').getTime() / 1000),
    priceWei: hre.ethers.parseEther('0.002'),
    maxTickets: 100
  },
  {
    name: 'Sunset Limited',
    date: Math.floor(new Date('2026-05-18T00:00:00Z').getTime() / 1000),
    priceWei: hre.ethers.parseEther('0.0035'),
    maxTickets: 100
  },
  {
    name: 'Heritage Morning Run',
    date: Math.floor(new Date('2026-05-24T00:00:00Z').getTime() / 1000),
    priceWei: hre.ethers.parseEther('0.005'),
    maxTickets: 100
  }
];

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS is required in contracts/.env');
  }

  const [deployer] = await hre.ethers.getSigners();
  const ticketSale = await hre.ethers.getContractAt('TicketSale', contractAddress, deployer);

  const currentEventCount = await ticketSale.eventCount();
  if (currentEventCount > 0n) {
    console.log(`TicketSale already has ${currentEventCount.toString()} events. Skipping seed.`);
    return;
  }

  console.log(`Seeding TicketSale at ${contractAddress}...`);
  for (const eventData of SAMPLE_EVENTS) {
    const tx = await ticketSale.createEvent(
      eventData.name,
      eventData.date,
      eventData.priceWei,
      eventData.maxTickets
    );
    await tx.wait();
    console.log(`Created event: ${eventData.name}`);
  }

  console.log('TicketSale seed complete.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
