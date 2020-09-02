const express = require('express');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let session = require('express-session');
let cookieParser = require('cookie-parser');
let flash = require('express-flash');
const path = require('path')
const app = express();

require('./database/authen').then(() => {
    app.listen(process.env.PORT, () => console.log(''));
});

// 8080 process.env.PORT

app.set("view engine", "jade");
app.use("/", express.static(path.join(__dirname, "./public")));
app.use("/axios", express.static(__dirname + '/' + 'node_modules/axios/dist/'))
app.use(flash());
app.use(cookieParser())
app.use(session({secret: 'ssshhhhh',
                resave: false,
                saveUninitialized: false }));
app.use(urlencodedParser);
app.set("view engine", "jade")

const router = require('./routes/routes');
app.use("/", router);