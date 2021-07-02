const { Model, DataTypes } = require('sequelize')

class Order extends Model {
  // static associate(models) {
  //
  // }
}
module.exports = function (sequelize) {
  return Order.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      unique: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      accountId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      commission: {
        type: DataTypes.REAL,
        allowNull: true,
      },
      cumQuote: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      executedQty: {
        type: DataTypes.REAL,
        allowNull: true,
      },
      origQty: {
        type: DataTypes.REAL,
        allowNull: true,
      },
      qty: {
        type: DataTypes.REAL,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      price: {
        type: DataTypes.REAL,
        allowNull: true,
      },
      avgPrice: {
        type: DataTypes.REAL,
        allowNull: true,
      },
      activatePrice: {
        type: DataTypes.REAL,
        allowNull: true,
      },
      priceRate: {
        type: DataTypes.REAL,
        allowNull: true,
      },
      stopPrice: {
        type: DataTypes.REAL,
        allowNull: true,
      },
      side: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      positionSide: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      timeInForce: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      originalOrderType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      updateTime: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      workingType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trade: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      tableName: 'order',
      timestamps: true,
    },
  )
}

module.exports.Order = Order
