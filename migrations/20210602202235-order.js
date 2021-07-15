'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user', {
      id: {
        autoIncrement: true,
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      order_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      unique: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cum_quote: {
        type: Sequelize.STRING,
        allowNull: true
      },
      executed_qty: {
        type: Sequelize.REAL,
        allowNull: true
      },
      orig_qty: {
        type: Sequelize.REAL,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true
      },
      price: {
        type: Sequelize.REAL,
        allowNull: true
      },
      avg_price: {
        type: Sequelize.REAL,
        allowNull: true
      },
      activate_price: {
        type: Sequelize.REAL,
        allowNull: true
      },
      price_rate: {
        type: Sequelize.REAL,
        allowNull: true
      },
      stop_price: {
        type: Sequelize.REAL,
        allowNull: true
      },
      side: {
        type: Sequelize.STRING,
        allowNull: true
      },
      position_side: {
        type: Sequelize.STRING,
        allowNull: true
      },
      symbol: {
        type: Sequelize.STRING,
        allowNull: true
      },
      time_in_force: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      original_order_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      update_time: {
        type: Sequelize.STRING,
        allowNull: true
      },
      working_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      trade: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      commission: {
        type: Sequelize.REAL,
        allowNull: true
      },
      qty: {
        type: Sequelize.REAL,
        allowNull: true
      },
      user_id: {
        type: Sequelize.BIGINT,
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    })
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('user');
  }
};
