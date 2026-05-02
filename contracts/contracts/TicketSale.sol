// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketSale is Ownable {
    struct EventInfo {
        string name;
        uint256 date; // unix timestamp
        uint256 priceWei;
        uint256 maxTickets;
        uint256 sold;
        bool exists;
    }

    struct Ticket {
        uint256 eventId;
        address owner;
    }

    uint256 public eventCount;
    uint256 public ticketCounter;

    mapping(uint256 => EventInfo) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) internal ownerTickets;

    event EventCreated(uint256 indexed eventId, string name, uint256 date, uint256 priceWei, uint256 maxTickets);
    event TicketPurchased(uint256 indexed ticketId, uint256 indexed eventId, address indexed buyer, uint256 value);

    function createEvent(string calldata name, uint256 date, uint256 priceWei, uint256 maxTickets) external onlyOwner {
        require(bytes(name).length > 0, "Name required");
        require(maxTickets > 0, "maxTickets>0");

        eventCount++;
        events[eventCount] = EventInfo({
            name: name,
            date: date,
            priceWei: priceWei,
            maxTickets: maxTickets,
            sold: 0,
            exists: true
        });

        emit EventCreated(eventCount, name, date, priceWei, maxTickets);
    }

    function buyTicket(uint256 eventId) external payable returns (uint256) {
        EventInfo storage ev = events[eventId];
        require(ev.exists, "Event does not exist");
        require(ev.sold < ev.maxTickets, "Sold out");
        require(msg.value == ev.priceWei, "Incorrect payment");

        ev.sold++;
        ticketCounter++;
        tickets[ticketCounter] = Ticket({ eventId: eventId, owner: msg.sender });
        ownerTickets[msg.sender].push(ticketCounter);

        emit TicketPurchased(ticketCounter, eventId, msg.sender, msg.value);
        return ticketCounter;
    }

    function getMyTickets() external view returns (uint256[] memory) {
        return ownerTickets[msg.sender];
    }

    function getEvent(uint256 eventId) external view returns (string memory, uint256, uint256, uint256, uint256) {
        EventInfo storage ev = events[eventId];
        require(ev.exists, "Event missing");
        return (ev.name, ev.date, ev.priceWei, ev.maxTickets, ev.sold);
    }

    function getTicket(uint256 ticketId) external view returns (uint256, address) {
        Ticket storage t = tickets[ticketId];
        return (t.eventId, t.owner);
    }
}
