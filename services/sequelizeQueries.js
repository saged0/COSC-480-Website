const { sequelize, Event, Ticket } = require('../models')

async function createEvent(payload) {
  return Event.create(payload)
}

async function listEvents({ limit = 25, offset = 0 } = {}) {
  return Event.findAll({
    attributes: ['id', 'name', 'date', 'ticketPriceEth', 'maxTickets', 'contractAddress'],
    order: [['date', 'ASC']],
    limit,
    offset
  })
}

async function getEventById(eventId) {
  return Event.findByPk(eventId)
}

async function createTicket(payload) {
  return Ticket.create(payload)
}

async function listTicketsByWallet(walletAddress) {
  return Ticket.findAll({
    where: { walletAddress },
    include: [{ model: Event }],
    order: [['createdAt', 'DESC']]
  })
}

async function listTicketsByUserId(userId) {
  return Ticket.findAll({
    where: { userId },
    include: [{ model: Event }],
    order: [['createdAt', 'DESC']]
  })
}

async function countTicketsForEvent(eventId) {
  return Ticket.count({ where: { eventId } })
}

async function runQuery(sql, options = {}) {
  return sequelize.query(sql, options)
}

module.exports = {
  createEvent,
  listEvents,
  getEventById,
  createTicket,
  listTicketsByWallet,
  listTicketsByUserId,
  countTicketsForEvent,
  runQuery
}
