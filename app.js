///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                /* WINE LISTER 2020 GOLLING FLORIAN EPITECH STAGE */
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const express = require('express');
const { request, Router } = require('express');
const app = express();
const port = process.env.PORT;
const Sequelize = require('sequelize');
let bodyParser = require('body-parser');
const { updateLanguageServiceSourceFile } = require('typescript');
let jsonParser = bodyParser.json();
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let session = require('express-session');
let cookieParser = require('cookie-parser');
const Model = Sequelize.Model;
const sequelize = new Sequelize('postgres://smwtvuyw:yq9QMmFpJQzzhEgEp7rtslRouQsQyGFv@kandula.db.elephantsql.com:5432/smwtvuyw')
let flash = require('express-flash');

/*      //VARIABLE GLOBALE                                                                                                              ////////////////////////////////////////////////////////////////////
        PORT: utilisation sur le site de déploiement "process.env.PORT" et en local 8080;
        BOYPARSER: Le bodyparser permet le parsing des forms en urlencoded dans ce cas afin de les recup et les lire;
        SESSION: permet les sessions, permet des connexions simultanées au site, avec email + password qui s'enregistre "dynamiquement";
        SEQUELIZE: permet de faire des modeles de DB, et c'est ce qui permet aussi les query etc..;
        APP/EXPRESS: permet de faire les différentes routes, avec des methodes différentes;
        DIALECT/STORAGE: Permet d'identifier le langage utilié + donne un dossier ou il peut créer la DB locale, tout est automatique;
        //VARIABLE GLOBALE                                                                                                              ////////////////////////////////////////////////////////////////////
*/

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

class Stage extends Model {}
Stage.init({
  Week: {
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
    }} , {
    sequelize,
    modelName: 'stage'
});

/*      //MODEL TABLE                                                                                                              ////////////////////////////////////////////////////////////////////
        La création de tout les models nécessaires dans la DB, en gros le schéma des tables, ici deux tables;
        Déjà des valeurs de base comme ID, et les timestamps;
        VINE: nom du vin, description et quantité;
        User: password, username;
*/      //MODEL TABLE                                                                                                              ////////////////////////////////////////////////////////////////////

app.use(flash());
app.use(cookieParser())
app.use(session({secret: 'ssshhhhh',
                resave: false,
                saveUninitialized: false }));
app.use(urlencodedParser);
app.set("view engine", "jade");

/*      //APPUSE                                                                                                                     ////////////////////////////////////////////////////////////////////
        CookieParser et session permet la session différent chez chaque personne, encore un peu flou mais ça marche;
        urlencodedParser: permet de récuperer les infos des forms et les parser;
        viewengine: explique que j'utiliserai jade et pas du html pur.
*/      //APPUSE                                                                                                                     ////////////////////////////////////////////////////////////////////

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
Stage.sync({ force: false });

/*      //SEQUELIZE                                                                                                                     ////////////////////////////////////////////////////////////////////
        SEQUELIZE: permet de se connecter a la DB, renvoie une erreur si ce n'est pas possible.
        SYNC: Permet de se synchroniser a la DB locale, false permet de récuperer celle déjà existante, sinon true permet d'écraser une déjà existante
*/      //SEQUELIZE                                                                                                                    ////////////////////////////////////////////////////////////////////

app.get('/', (req, res, next) => {
    console.log('GET ACCUEIL');
    if (!req.session.email) {
        res.redirect('/login');
        req.flash('info','Veuillez vous connecter');
    }
    else {
        req.flash('Co','Se déconnecter');
        res.render('accueil');
    }
});

app.get('/vins', async function(req, res) {
    console.log('VINE GET');
    if (!req.session.email) {
        req.flash('info','Veuillez vous connecter');
        res.redirect('/login');
    } else {
        const vine = await Vine.findAll({ where: { username: req.session.email }, order: [
            ['id', 'ASC'],
        ]});
        if (vine == null)
            res.redirect('/add');
        else {
            console.log('les vins sont bien trouvés');
            req.flash('Co','Se déconnecter');
            res.render('vins', {Vines: vine});
        }
    }
});

app.get('/stage', async function(req, res) {
    console.log('STAGE GET');
    if (!req.session.email) {
        req.flash('info','Veuillez vous connecter');
        res.redirect('/login');
    } else {
        const sta = await Stage.findAll({ where: { username: req.session.email }});
        if (sta == null)
            res.redirect('/addstage');
        else {
            req.flash('Co','Se déconnecter');
            res.render('stage', {Stages: sta});
        }
    }
});

app.post('/add', async function(req, res) {
    console.log('ADD');
    console.log(req.body);
    if (!req.session.email)
        res.redirect('/');
    else {
        await Vine.create({ username: req.session.email, Quantity: req.body.quantity, Description: req.body.description, Name: req.body.name });
        console.log('vin bien rajouté');
        res.redirect('/vins');
    }
});

app.post('/add2/:name/:description/:quantity', async function(req, res) {
    console.log('ADD');
    if (!req.session.email)
        res.redirect('/');
    else {
        let newvine = await Vine.create({ username: req.session.email, Quantity: req.params.quantity, Description: req.params.description, Name: req.params.name });
        console.log('vin bien rajouté');
        res.send(newvine);
    }
});


app.put('/minus/:id', async function(req, res) {
    console.log('MINUS');
    if (!req.session.email)
        res.redirect('/');
    else {
        const thisone = await Vine.findOne({ where: { username: req.session.email, id: req.params.id }} )
        console.log(thisone);
        let quan = thisone.Quantity - 1;
        if (quan < 0)
            quan = 0;
        console.log('NEW QUANTITY =' + quan)
        let send = await Vine.update({ Quantity: quan }, {where:{ id: req.params.id, username: req.session.email }})
        console.log('vin bien réduit');
        res.sendStatus(200)
    }
});

app.delete('/rm/:id', async function(req, res) {
    console.log('RM');

    if (!req.session.email)
        res.redirect('/');
    else {
        let send = await Vine.destroy({ where: { username: req.session.email, id: req.params.id }} )
        console.log('vin bien supprimé');
        res.sendStatus(200)
    }
});

app.put('/plus/:id', async function(req, res) {
    console.log('PLUS');
    console.log(req.body);
    if (!req.session.email)
        res.redirect('/');
    else {
        const thisone = await Vine.findOne({ where: { username: req.session.email, id: req.params.id }} )
        console.log(thisone);
        let quan = thisone.Quantity + 1;
        console.log('NEW QUANTITY =' + quan)
        let send = await Vine.update({ Quantity: quan }, {where:{ id: req.params.id, username: req.session.email }})
        console.log('vin bien ajouté');
        console.log('username =' + req.session.email);
        res.sendStatus(200)
    }
});

app.get('/add', (req, res, next) => {
    console.log('GET ADD');
    if (!req.session.email) {
        req.flash('info','Veuillez vous connecter');
        res.redirect('/login');
    } else {
        req.flash('Co','Se déconnecter');
        res.render('add');
    }
});

app.get('/addstage', (req, res, next) => {
    console.log('GET ADD');
    if (!req.session.email) {
        req.flash('info','Veuillez vous connecter');
        res.redirect('/login');
    } else {
        req.flash('Co','Se déconnecter');
        res.render('addstage');
    }
});

app.get('/logout', function(req, res) {
    console.log('POST LOGOUT');
    console.log('loggin out');
    req.session.destroy();
    res.redirect('/');
});

app.get('/register', function(req, res) {
    if (!req.session.email) {
        console.log('GET REGISTER');
        res.render('register');
    } else {
        res.redirect('/')
    }
});

app.get('/login', function(req, res) {
    if (!req.session.email) {
        console.log('GET LOGIN');
        res.render('login');
    } else {
        res.redirect('/')
    }
});

app.post('/login', async function(req, res) {
    console.log('POST LOGIN');
    console.log(req.body);
    const username = await User.findOne({ where: { firstName: req.body.prenom }});
    if (username != null) {
        if (username.password == req.body.password) {
            console.log('correct password i let you in :)');
            req.session.email = req.body.prenom;
            req.session.password = req.body.password;
            res.redirect('/');
        } else {
            console.log('invalid password');
            req.flash('info','Mauvais mot de passe');
            res.redirect('/login');
        }
    } else {
        console.log('invalid account');
        req.flash('info',"Le compte n'existe pas");
        res.redirect('/login');
    }
});

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
        req.flash('info','Le compte existe déjà');
        res.render('register');
    }
});

app.use("/", express.static(__dirname));
app.use("/axios", express.static(__dirname + '/' + 'node_modules/axios/dist/'))

app.use(function(req, res){
    res.status(404).send('Page introuvable !');
});

app.listen(port, () => {
    console.log(`App running on : http://localhost:${port}`);
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2020 GOLLING FLORIAN WINELISTER
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
