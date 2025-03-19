const Sequelize = require('sequelize');
const dbConfig = require('../db_config');

const dataManager = new Sequelize(dbConfig.dbName, dbConfig.dbUser, dbConfig.dbPass, {
	host: dbConfig.dbHost,
	dialect: 'postgres',
	pool: {
		max: 5,
		min: 0,
		idle: 10000
	}
});

// const dataManager = new Sequelize({
// 	dialect: 'sqlite',
// 	storage: '../db.sqlite'
// });

dataManager
	.authenticate()
	.then(() => {
		console.log('Connection has been established successfully.');
	})
	.catch(err => {
		console.error('Unable to connect to the database:', err);
	});

module.exports = dataManager;