const Router = require("express");
const User = require('../Models/User');
const bcrypt = require("bcryptjs");
const {check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config")
const router = new Router();
const authMiddleware = require('../middleware/auth.middleware')
const fileService = require('../services/fileService')
const File = require('../Models/File')

router.post('/reg',
[
    check('email', "Uncorrect email").isEmail(),
    check('password', 'Uncorrect password').isLength({min: 3, max :12})
], 
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()) {
                return res.status(400).json({message : "Uncorrect request", errors})
            }
            const {email, password } = req.body;

            const currentUser = await User.findOne({email});

            if(currentUser){
            return res.status(400).json({message : `User with ${email} already exist`})
            }
            const hashPass = await bcrypt.hash(password, 8)
            const user = new User({email, password : hashPass});
            await user.save();
            await fileService.createDir(new File({user: user.id,name : ''}))
            return res.json({message : "User was created"})
        }catch(error) {
         console.log(error)
            res.send({message : "server error"})
        }
})

router.get('/auth', authMiddleware,
    async (req, res) => {
        try {
            const user = await User.findOne({ _id: req.user.id })
            const token = jwt.sign({ id: user.id }, config.get("secretKey"), { expiresIn: "1h" }) // создание токена для пользователя
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar
                }
            })
        } catch (error) {
            console.log(error)
            res.send({ message: "server error" })
        }
    })

router.post('/login',
    async (req, res) => {
        try {
           const {email, password} = req.body;
           const user = await User.findOne({email})
           if(!user) {
               return res.status(404).json({message : "User not found"});
           }
           const isValidPass = bcrypt.compareSync(password, user.password) // compareSync сравнивает зашифрованный пароль и пришедший из req.body
           if(!isValidPass) {
                return res.status(404).json({message : "Invalid password"});
           }
           const token = jwt.sign({id : user.id} , config.get("secretKey"), {expiresIn : "1h"}) // создание токена для пользователя
           return res.json({
               token,
               user : {
                   id : user.id,
                   email : user.email,
                   diskSpace : user.diskSpace,
                   usedSpace : user.usedSpace,
                   avatar : user.avatar
               }
           })
        }catch(error) {
         console.log(error)
            res.send({message : "server error"})
        }
})

module.exports = router