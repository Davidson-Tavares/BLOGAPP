//carregando módulos
    const express = require('express');
    const handlebars= require('express-handlebars');
    const bodyparser= require('body-parser');
    const app = express();
    const admin = require("./routes/admin");
    //const mongoose= require('mongoose');

//configurações
    //Body Parser
        app.use(bodyparser.urlencoded({extended: true}))
        app.use(bodyparser.json())
    //Handlebars
        app.engine('handlebars',handlebars.engine({defaultLayout:'main'}));
        app.set('view engine','handlebars');
    //mongoose

//Rotas
app.use('/admin', admin);


//Outros
const Port = 8081;
app.listen(Port, () => {
    console.log("Servidor Rodando ! ")
})