module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    walletAddress: {
      type: DataTypes.STRING(66),
      allowNull: false,
    },
ticketId: {
  type: DataTypes.STRING(100),
  allowNull: false,
},
    txHash: {
      type: DataTypes.STRING(100),
      allowNull: true,
    }
  }, {
    tableName: 'tickets',
    timestamps: true,
  });

  Ticket.associate = (models) => {
    Ticket.belongsTo(models.Event, { foreignKey: 'eventId' });
    Ticket.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Ticket;
};
