const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
require("../models/Categoria");
const categoria = mongoose.model("categorias")
require("../models/Postagem");
const postagem = mongoose.model("postagens")
const{eAdmin} = require("../helpers/eAdmin")

router.get('/',eAdmin, (req, res) => {
    res.render('admin/index.handlebars')
})

//====================================
router.get('/categorias', eAdmin, (req, res) => {
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
router.get('/categorias/add',eAdmin, (req, res) => {
    res.render('admin/addcategoria.handlebars')
})
//============================= validaçao do formulario e envio para o bd

router.post("/categorias/nova",eAdmin, (req, res) => {
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

router.post('/categorias/deletar',eAdmin, (req, res) => {
    categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso !')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao deletar categoria !' + err)
        res.redirect('/admin/categorias')
    })
})

//===================== EDITAR CATEGORIAS

router.get('/categorias/edit/:id', eAdmin,(req, res) => {
    categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render("admin/editcategorias", { categoria: categoria })
    }).catch((err) => {
        req.flash('error_msg', "Esta categoria não existe !")
        res.redirect('/admin/categorias')
    })

})


router.post('/categorias/edit',eAdmin, (req, res) => {
    categoria.findOne({ _id: req.body.id }).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash('success_msg', "Categoria editada com sucesso !")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro interno ao editar categoria !" + err)
            res.redirect('/admin/categorias')
        })

    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao editar categorias  " + err)
        res.redirect('/admin/categorias')
    })
})

//=========================== todas as postagens

router.get("/posts",eAdmin, (req, res) => {
    res.render("postagem.index.handlebars")
})
       

//=============  POSTAGEM  =========== abaixo da rota estamos listado as postagens

router.get("/postagens",eAdmin, (req, res) => {
    postagem.find().lean().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render("admin/postagens", { postagens: postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar postagens !")
        res.redirect("/admin")
    })
})

router.get('/postagens/add',eAdmin, (req, res) => {
    categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagem', { categorias: categorias })
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao carregar o formulário")
        res.redirect('/admin')
    })

})

//===================== adicionar as postagem no bd e validar os campos do imputs. aqui so estmos validando o selec.

router.post('/postagens/nova',eAdmin, (req, res) => {
    var erros = []
    if (req.body.categoria == "0") {
        erros.push({ texto: "categoria invalida, registre uma categoria" })
    }

    if (erros.length > 0) {
        res.render("admin/addpostagem.handlebars", { erros: erros })
    } else {
        const novapostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new postagem(novapostagem).save().then(() => {
            req.flash("success_msg", " postagem criada com sucesso")
            req.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro ao salvar ! " + err)
            res.redirect('/admin/postagens')
        })
    }
})

//=====================editar postagens ==================

router.get('/postagens/edit/:id',eAdmin, (req, res) =>{
    
    postagem.findOne({_id:req.params.id}).lean().then((postagem) => { 
        
        categoria.find().lean().then((categorias) => {
                res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao listar as categoria')
                res.redirect('/admin/postagens')
            })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário de atualização')
        res.redirect('/admin/postagens')
    })
})


router.post('/postagens/edit', eAdmin,(req, res) => {

    postagem.findByIdAndUpdate({_id:req.body.id}).sort({data: 'desc'}).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        // postagem.data = req.body.date   // se esta linha for valida não aparece a data depois da atualização

        postagem.save().then(() => {

            req.flash('success_msg', 'Postagem atualizada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Erro na atualização da postagem')
            res.redirect('/admin/postagens')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro na edição da postagem ' )
        res.redirect('/admin/postagens')
    })

})
//------------------deletar postagens


router.get('/postagens/deletar/:id',eAdmin, (req, res) => {
    postagem.deleteOne({_id: req.params.id}).then(()=>{
        req.flash('success_msg', "Postagem deletada com sucesso !")
        res.redirect('/admin/postagens')
    }).catch((err) => {
        console.log("Erro ao deletar postagem: " + err )
        req.flash('error_msg', "Houve um erro ao deletar a postagem !")
        res.redirect("/admin/postagens")
    })
})










module.exports = router







