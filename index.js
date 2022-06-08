const express = require("express");
const mongoose = require("mongoose");
const config = require("config")
const fileUpload = require('express-fileupload')
const app = express()
const authRouter = require("./Routes/auth.routes")
const fileRouter = require("./Routes/file.routes")
const PORT = config.get('serverPort')
const corsMiddleWare = require('./middleware/cors.middleware')

app.use(express.json())
app.use(corsMiddleWare)
app.use(fileUpload({}))
app.use(express.static('static'))

app.use("/api/auth",authRouter)
app.use("/api/files",fileRouter)

const start = async () => {
    try{
        mongoose.connect(config.get('dbUrl', 
        {
            useNewUrlParser : true,
            useUnifiedTopology : true
        }));

    app.listen(PORT, () => {
        console.log('start')
    })
    }catch(error){
        console.log(error)

    }
}

start()