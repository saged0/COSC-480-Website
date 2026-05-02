'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tickets', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onDelete: 'CASCADE'
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tickets', 'userId')
  }
}
