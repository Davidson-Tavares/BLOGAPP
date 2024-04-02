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
require("./models/Categoria.js")
const categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario.js")
const passport = require("passport");
require("./config/auth.js")(passport)


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
//importante ficar nessa ordem
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())


//middleware
app.use(flash())
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
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
//------------ rota para pagina de postagem com cada pagina sendo criada atraves do slug.


app.get("/postagem/:slug", (req, res) => {
    postagem.findOne({ slug: req.params.slug }).lean().then((postagem) => {
        if (postagem) {
            res.render("postagem/index.handlebars", { postagem: postagem })
        } else {
            req.flash("error_msg", "Esta postagem não existe !")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
    })
})

//=========== rota da pagina categorias =============

app.get("/categorias", (req, res) => {
    categoria.find().lean().then((categorias) => {
        res.render("categorias/index.handlebars", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar categorias")
        res.redirect("/")
    })
})

// ===== rota para os links de cada categoria da pagina categoria

app.get("/categorias/:slug", (req, res) => {
    categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
        if (categoria) {
            postagem.find({ categoria: categoria._id }).lean().then((postagens) => {
                res.render("categorias/postagens", { postagens: postagens, categoria: categoria })
            }).catch((err) => {
                console.log("Eroo:: " + err)
                req.flash("error_msg", "Houve um erro ao listar os posts !")
                res.redirect("/")
            })
        }
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe !")
        res.redirect("/")
    })
})



//======================================================lista postagem
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
app.get('/posts', (req, res) => {
    res.send("Lista de posts")
})

//---------------------------------------------------------------


app.use('/admin', admin);
app.use('/usuarios', usuarios)



//Outros
const Port = 27017;
app.listen(Port, () => {
    console.log("Servidor Rodando na url: http://localhost:27017")
})