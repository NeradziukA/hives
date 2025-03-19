const Sequelize = require('sequelize');
const dataManager = require('../managers/DataManager');

const User = dataManager.define('user', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  },
  coords: {
    type: Sequelize.GEOMETRY('POINT')
  }
});

module.exports = User;