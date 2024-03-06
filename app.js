//carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
//const bodyparser = require('body-parser');
const app = express();
const admin = require("./routes/admin.js");
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require("connect-flash")


//configurações
//Body Parser
//app.use(bodyparser.urlencoded({ extended: true }))
//app.use(bodyparser.json())
//essa consfiguração substitui o body parser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//sessão
app.set('trust proxy', 1)
app.use(session({
    secret: "curso de node",
    proxy: true, //adicionei esta
    resave: true,// estava resove
    saveUninitialized: true
}))
app.use(flash())

//middleware
//midleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    next()
})

//Handlebars
app.set('views', path.join(__dirname, 'views'));//adicionei esta
app.engine('.handlebars', handlebars.engine({
    defaultLayouts: 'main',
    extname: '.handlebars'
}))
app.set('view engine', '.handlebars')


//mongoose
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://127.0.0.1:27017/blogapp").then(() => {
    console.log("Conectado ao Mongo.")
}).catch((err) => {
    console.log("Erro ao se conectar :" + err)
})

//Public
app.use(express.static(path.join(__dirname + "/public")));

//Rotas
app.use('/admin', admin);


//Outros
const Port = 27017;
app.listen(Port, () => {
    console.log("Servidor Rodando na url: http://localhost:27017")
})