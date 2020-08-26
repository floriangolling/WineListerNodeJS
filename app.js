const express = require('express');
const { request, Router } = require('express');
const app = express();
const port = process.env.PORT

// CONFIGURATION DE SEQUELIZE LE LANGAGE UTILISE + SON REPERTOIRE

const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

// Pour récuperer les infos des forms et les parser (urlencoded pour moi)

let bodyParser = require('body-parser');
const { updateLanguageServiceSourceFile } = require('typescript');
let jsonParser = bodyParser.json();
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let session = require('express-session');

// CREATION D'UN SCHEMA DE TABLE SELON LE MODEL (déjà des valeurs par default genre date id etc...)

let sess;

// VARIABLE GLOBALE DE SESSION

const Model = Sequelize.Model;
class User extends Model {}
User.init({
  firstName: {
    type: Sequelize.STRING,
    allowNull: false
  },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }}, {
    sequelize,
    modelName: 'user'
});

class Vine extends Model {}
Vine.init({
    Name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    Description: {
          type: Sequelize.STRING,
          allowNull: false
    },
    Quantity: {
          type: Sequelize.INTEGER,
          allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    }} , {
    sequelize,
    modelName: 'vine'
});

// CREATION DE LA TABLE DANS LA DB

app.use(session({secret: 'ssshhhhh',
                resave: true,
                saveUninitialized: true
}));

app.use(urlencodedParser);
app.set("view engine", "jade");

//Permet de parser tout automatique + utiliser jade.

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection à la DB effectuée');
  })
  .catch(err => {
    console.error('Impossible de se connecter, ', err);
});

User.sync({ force: false });
Vine.sync({ force: false });

//Se connecte a la DB , le force permet d'ecraser la table si elle existe déjà.
//Les différentes routes de l'app, app.get pour les gets, sinon post, et pour tout app.all.

app.get('/', (req, res, next) => {
    console.log('GET ACCUEIL');
    console.log(sess);
    if (!sess)
        res.render('accueil');
    else
        res.render('connected');
});

app.get('/vins', async function(req, res) {
    console.log('VINE GET');
    if (!sess)
        res.redirect('/');
    else {
        const vine = await Vine.findAll({ where: { username: sess.user }});
        if (vine == null)
            res.redirect('/add');
        else {
            console.log('les vins sont bien trouvés');
            res.render('vins', {Vines: vine});
        }
    }
});

//PERMET D'AJOUTER UN VIN SI T'ES CONNECTE

app.post('/add', async function(req, res) {
    console.log('ADD');
    console.log(req.body);
    if (!sess)
        res.redirect('/');
    else {
        await Vine.create({ username: sess.user, Quantity: req.body.quantity, Description: req.body.description, Name: req.body.name });
        console.log('vin bien rajouté');
        console.log('username =' + sess.user);
        res.redirect('/vins');
    }
});

//MINUS BUTTON
app.post('/minus', async function(req, res) {
    console.log('MINUS');
    console.log(req.body);
    if (!sess)
        res.redirect('/');
    else {
        const thisone = await Vine.findOne({ where: { username: sess.user, id: req.body.minus }} )
        console.log(thisone);
        let quan = thisone.Quantity - 1;
        if (quan < 0)
            quan = 0;
        console.log('NEW QUANTITY =' + quan)
        await Vine.update({ Quantity: quan }, {where:{ id: req.body.minus, username: sess.user }})
        console.log('vin bien réduit');
        console.log('username =' + sess.user);
        res.redirect('/vins');
    }
});

//PLUS BUTTON

app.post('/plus', async function(req, res) {
    console.log('PLUS');
    console.log(req.body);
    if (!sess)
        res.redirect('/');
    else {
        const thisone = await Vine.findOne({ where: { username: sess.user, id: req.body.plus }} )
        console.log(thisone);
        let quan = thisone.Quantity + 1;
        console.log('NEW QUANTITY =' + quan)
        await Vine.update({ Quantity: quan }, {where:{ id: req.body.plus, username: sess.user }})
        console.log('vin bien ajouté');
        console.log('username =' + sess.user);
        res.redirect('/vins');
    }
});

app.get('/add', (req, res, next) => {
    console.log('GET ADD');
    console.log(sess);
    if (!sess)
        res.redirect('/');
    else {
        res.render('add');
    }
});

// DESTROY LA SESSION SI IL APPUIE SUR LOGOUT

app.post('/logout', function(req, res) {
    console.log('POST LOGOUT');
    console.log('loggin out');
    req.session.destroy();
    sess = req.session;
    res.redirect('/');
});

app.get('/register', function(req, res) {
    console.log('GET REGISTER');
    res.render('register');
});

app.get('/login', function(req, res) {
    console.log('GET LOGIN');
    res.render('login');
});

//PERMET LA CONNECTION FACTICE, CHECK SI LE COMPTE EXISTE, ET SI IL EXISTE IL VERIFIE QUE LE MOT DE PASSE EST BON, REDIRIGE VERS L'ACCUEIL SI TOUT EST BON
// RAJOUT DE LA SESSION

app.post('/login', async function(req, res) {
    console.log('POST LOGIN');
    console.log(req.body);
    const username = await User.findOne({ where: { firstName: req.body.prenom }});
    if (username != null) {
        if (username.password == req.body.password) {
            console.log('correct password i let you in :)');
            sess = req.session;
            sess.user = req.body.prenom;
            console.log(sess);
            res.redirect('/');
        } else {
            console.log('invalid password');
            res.redirect('/login')
        }
    } else {
        console.log('invalid account');
        res.redirect('/login');
    }
});

//CHECK SI LE COMPTE EXISTE DEJA ET SINON IL LE CREER DANS LA DATABASE, JE NE VERIFIE PAS ENCORE LES STRINGS ENVOYE ISNON

app.post('/register', async function(req, res) {
    console.log('POST REGISTER');
    console.log(req.body);
    const found = await User.findOne({ where: { firstName: req.body.prenom }});
    if (found == null) {
        console.log('le compte n existe pas et peut être créer');
        await User.create({ firstName: req.body.prenom, password: req.body.password });
        res.redirect('/login')
    } else {
        console.log('le compte existe déjà');
        res.render('register');
    }
});

//utilisé si aucune route prévue est demandé, retour d'erreur.

app.use(function(req, res){
    res.status(404).send('Page introuvable !');
});

// Message lancé au démarrage de l'app.

app.listen(port, () => {
    console.log(`App running on : http://localhost:${port}`);
});