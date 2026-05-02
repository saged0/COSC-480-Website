'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Drop FK/index from tickets referencing users, alter users, then re-add FK/index
      await queryInterface.sequelize.query(
        "ALTER TABLE `tickets` DROP FOREIGN KEY `tickets_userId_foreign_idx`",
        { transaction }
      )
      await queryInterface.sequelize.query(
        "ALTER TABLE `tickets` DROP INDEX `tickets_userId_foreign_idx`",
        { transaction }
      )

      await queryInterface.sequelize.query(
        "ALTER TABLE `users` MODIFY `user_id` INT NOT NULL AUTO_INCREMENT",
        { transaction }
      )

      await queryInterface.sequelize.query(
        "ALTER TABLE `tickets` ADD INDEX `tickets_userId_foreign_idx` (`userId`)",
        { transaction }
      )

      await queryInterface.sequelize.query(
        "ALTER TABLE `tickets` ADD CONSTRAINT `tickets_userId_foreign_idx` FOREIGN KEY (`userId`) REFERENCES `users`(`user_id`) ON DELETE CASCADE",
        { transaction }
      )
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Drop FK/index, remove AUTO_INCREMENT, then re-add FK/index
      await queryInterface.sequelize.query(
        "ALTER TABLE `tickets` DROP FOREIGN KEY `tickets_userId_foreign_idx`",
        { transaction }
      )
      await queryInterface.sequelize.query(
        "ALTER TABLE `tickets` DROP INDEX `tickets_userId_foreign_idx`",
        { transaction }
      )

      await queryInterface.sequelize.query(
        "ALTER TABLE `users` MODIFY `user_id` INT NOT NULL",
        { transaction }
      )

      await queryInterface.sequelize.query(
        "ALTER TABLE `tickets` ADD INDEX `tickets_userId_foreign_idx` (`userId`)",
        { transaction }
      )

      await queryInterface.sequelize.query(
        "ALTER TABLE `tickets` ADD CONSTRAINT `tickets_userId_foreign_idx` FOREIGN KEY (`userId`) REFERENCES `users`(`user_id`) ON DELETE CASCADE",
        { transaction }
      )
    })
  }
}
