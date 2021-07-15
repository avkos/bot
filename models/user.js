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
      binanceApiKey: {
        type: DataTypes.STRING,
        allowNull: true
      },
      binanceApiSecret: {
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
