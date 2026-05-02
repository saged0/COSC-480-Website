'use strict'

async function tableExists(queryInterface, tableName) {
  try {
    await queryInterface.describeTable(tableName)
    return true
  } catch (_error) {
    return false
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      if (!(await tableExists(queryInterface, 'events'))) {
        await queryInterface.createTable(
          'events',
          {
            id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              autoIncrement: true,
              primaryKey: true
            },
            name: {
              type: Sequelize.STRING(200),
              allowNull: false
            },
            date: {
              type: Sequelize.DATE,
              allowNull: false
            },
            ticketPriceEth: {
              type: Sequelize.DECIMAL(30, 18),
              allowNull: false
            },
            maxTickets: {
              type: Sequelize.INTEGER,
              allowNull: false
            },
            contractAddress: {
              type: Sequelize.STRING(66),
              allowNull: true
            },
            createdAt: {
              type: Sequelize.DATE,
              allowNull: false
            },
            updatedAt: {
              type: Sequelize.DATE,
              allowNull: false
            }
          },
          { transaction }
        )
      }

      if (!(await tableExists(queryInterface, 'tickets'))) {
        await queryInterface.createTable(
          'tickets',
          {
            id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              autoIncrement: true,
              primaryKey: true
            },
            eventId: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: {
                model: 'events',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            },
            walletAddress: {
              type: Sequelize.STRING(66),
              allowNull: false
            },
            ticketId: {
              type: Sequelize.BIGINT,
              allowNull: false
            },
            txHash: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            createdAt: {
              type: Sequelize.DATE,
              allowNull: false
            },
            updatedAt: {
              type: Sequelize.DATE,
              allowNull: false
            }
          },
          { transaction }
        )
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('tickets', { transaction })
      await queryInterface.dropTable('events', { transaction })
    })
  }
}
