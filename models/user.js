const sequelize = require("../database/sequelize")
const Sequelize = require("sequelize")

module.exports = sequelize.define('user', {
    firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});