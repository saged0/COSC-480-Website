module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ticketPriceEth: {
      type: DataTypes.DECIMAL(30, 18),
      allowNull: false,
    },
    maxTickets: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contractAddress: {
      type: DataTypes.STRING(66),
      allowNull: true,
    }
  }, {
    tableName: 'events',
    timestamps: true,
  });

  Event.associate = (models) => {
    Event.hasMany(models.Ticket, { foreignKey: 'eventId' });
  };

  return Event;
};
