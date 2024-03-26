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
require("./models/Postagem");
const postagem = mongoose.model("postagens")


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

   
//middleware
app.use(flash())
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    next()
})


//Handlebars
app.set('views', path.join(__dirname, 'views'));//adicionei esta
app.engine('handlebars', handlebars.engine({
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
/*app.get('/', (req, res) => {
    postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render("admin/index.handlebars", {postagens: postagens})
    }).catch((err) =>{
        req.flash('error_msg',"Houve um erro interno ! " )
        res.redirect('/404')
    } )
 

})*/
app.get("/", (req, res) => {
    postagem.find().lean().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render("admin/index", { postagens: postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno!")
        res.redirect("/404")
    })
})
//--------------------------------------------------------------------

app.get('/404', (req, res) => {
    res.send("Erro 404 !")
})



//--------------------------------------------------------------------
app.get('/posts', (req,res) =>{
    res.send("Lista de posts")
})

//---------------------------------------------------------------
app.use('/admin', admin);



//Outros
const Port = 27017;
app.listen(Port, () => {
    console.log("Servidor Rodando na url: http://localhost:27017")
})