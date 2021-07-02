const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static associate(models) {

  }
}

module.exports = function (sequelize) {
  return User.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      binance_api_key: {
        type: DataTypes.STRING,
        allowNull: true
      },
      binance_api_secret: {
        type: DataTypes.STRING,
        allowNull: true
      },
    },
    {
      sequelize,
      tableName: 'user',
      timestamps: true,
      paranoid: true
    }
  );
};

module.exports.User = User;
