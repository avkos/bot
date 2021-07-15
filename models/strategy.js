const { Model, DataTypes } = require('sequelize')

class Strategy extends Model {
  static associate(models) {
    Strategy.hasMany(models.Order, {
      foreignKey: 'strategyId',
      sourceKey: 'id',
      as: 'orders'
    });
  }
}
module.exports = function (sequelize) {
  return Strategy.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false
      },
      profit: {
        type: DataTypes.REAL,
        allowNull: true
      },
      positionSide: {
        type: DataTypes.STRING,
        allowNull: true
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true
      },
      options:{
        type: DataTypes.JSONB,
        allowNull: true,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: {
            tableName: 'user'
          },
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
    },
    {
      sequelize,
      tableName: 'strategy',
      timestamps: true,
    },
  )
}

module.exports.Strategy = Strategy
