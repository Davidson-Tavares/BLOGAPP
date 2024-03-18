const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
require("../models/Categoria");
const categoria = mongoose.model("categorias")

router.get('/', (req, res) => {
    res.render('admin/index.handlebars')
})
//===========================

router.get("/posts", (req, res) => {
    res.send("Pagina de posts")
})
//====================================
router.get('/categorias', (req, res) => {
    categoria
        .find()
        .sort({ date: 'desc' })
        .lean()
        .then((categorias) => res.render("admin/categorias", { categorias }))
        .catch((err) => {
            req.flash('error_msg', 'Houve um problema ao listar as categorias');
            res.redirect('/admin');
            console.error(err);
        });
});
//===============================
router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategoria.handlebars')
})
//=============================

router.post("/categorias/nova", (req, res) => {
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido !" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria é muito pequeno !" })
    }

    if (erros.length > 0) {
        res.render('admin/addcategoria.handlebars', { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso !");
            res.redirect('/admin/categorias')

        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente!')
            res.redirect('/admin')
        })

    }
})

//=================== DELETAR CATEGORIA

router.post('/categorias/deletar', (req, res) => {
    categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso !')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao deletar categoria !' + err)
        res.redirect('/admin/categorias')
    })
})

//===================== EDITAR CATEGORIAS

router.get('/categorias/edit/:id', (req, res) => {
    categoria.findOne({_id: req.params.id}).lean().then((categoria)=> {
        res.render("admin/editcategorias",{categoria: categoria})
    }).catch((err)=> {
        req.flash('error_msg',"Esta categoria não existe !")
        res.redirect('/admin/categorias')
    })
    
})


router.post('/categorias/edit', (req, res)=>{
    categoria.findOne({_id: req.body.id}).then((categoria) =>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        
        categoria.save().then(()=>{
            req.flash('success_msg', "Categoria editada com sucesso !") 
            res.redirect('/admin/categorias')}).catch((err)=>{
                req.flash('error_msg',"Houve um erro interno ao editar categoria !" + err )
                res.redirect('/admin/categorias')
            })

    }).catch((err)=>{
        req.flash('error_msg',"Houve um erro ao editar categorias  " + err)
        res.redirect('/admin/categorias')
    })
})


module.exports = router







