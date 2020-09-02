const sequelize = require("./sequelize")
const User = require('./../models/user');
const Vine = require('./../models/vin');
const Stage = require('./../models/stage');

module.exports  =  sequelize
                    .authenticate()
                    .then(() => {
                        console.log('Connection à la DB effectuée');
                        })
                    .catch(err => {
                    console.error('Impossible de se connecter, ', err);
});

User.sync({ force : false });
Stage.sync({ force : false});
Vine.sync({ force: false })