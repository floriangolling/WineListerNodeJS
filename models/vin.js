const sequelize = require("../database/sequelize")
const Sequelize = require("sequelize")

module.exports = sequelize.define('vine', {
    Name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});