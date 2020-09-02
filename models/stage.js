const sequelize = require("../database/sequelize")
const Sequelize = require("sequelize")

module.exports = sequelize.define('stage', {
    Week: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Description: {
        type: Sequelize.STRING(65535),
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    }
});