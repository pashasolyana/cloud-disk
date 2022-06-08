const fileService = require('../services/fileService')
const User = require('../Models/User')
const File = require('../Models/File')
const config = require('config')
const fs = require('fs')
const Uuid = require('uuid')

class fileController {
    async createDir(req, res) {
        try {
            const {name, type, parent} = req.body
            const file = new File({name,type,parent, user : req.user.id})
            const parentFile = await File.findOne({_id : parent})
            if(!parentFile) {
                file.path = name
                await fileService.createDir(file)
            }else{
                file.path = `${parentFile.path}\\${file.name}`
                await fileService.createDir(file)
                parentFile.childs.push(file._id)
                await parentFile.save()
            }
            await file.save()
            return res.json(file)
        } catch (error) {
            console.log(error)
            return res.status(400).json(error)
        }
    }

    async getFiles(req, res) {
        try {
            const {sort} = req.query // получение из строки запроса
            let files
            switch (sort) {
                case 'name':
                    files = await File.find({user: req.user.id, parent : req.query.parent}).sort({name:1})
                    break
                case 'type':
                    files = await File.find({user: req.user.id, parent : req.query.parent}).sort({type:1})
                    break   
                case 'date':
                    files = await File.find({user: req.user.id, parent : req.query.parent}).sort({date:1})
                    break
                default:
                    const files = await File.find({user: req.user.id, parent : req.query.parent})
            }
            return res.json({files})
        } catch (error) {
            console.lor(error)
            return res.status(500).json({message : "We cant get this file"})
        }
    }

    async uploadFile(req,res) {
        try {
            const file = req.files.file; // получаем файл
            const parent = await File.findOne({user : req.user.id, _id : req.body.parent}) // ищем родительскую папку
            const user = await User.findOne({_id : req.user.id}) // получаем пользователя
            if(file.size + user.usedSpace > user.diskSpace) {
                return res.status(400).json({message: 'There no space on disk'})
            }
            user.usedSpace = user.usedSpace + file.size // убавляем размер свободного места
            let path;
            if(parent){
                path = `${config.get("filePath")}\\${user._id}\\${parent.path}\\${file.name}` 
            } else {
                path = `${config.get("filePath")}\\${user._id}\\${file.name}` 
            }

            if(fs.existsSync(path)){ // проверка существует ли такой файл по такому же пути
                return res.status(400).json({message: 'File alredy exist'})
            }
            file.mv(path) // перемещаем файл по созданому пути

            const type = file.name.split('.').pop() // получаем расширирение и закидываем в массив последнее значение
            let filePath = file.name
            if(parent) {
                filePath = parent.path + '\\' + file.name
            }
            const dbFile = new File({
                name : file.name,
                type,
                size : file.size,
                path : filePath,
                parent : parent?._id,
                user : user._id
            })

            await dbFile.save();
            await user.save();

            res.json(dbFile)

        } catch (error) {
            console.log(error)
            return res.status(500).json({message : "Upload error"})
        }
    }

    async downoloadFile(req, res) {
        try {
            const file = await File.findOne({_id: req.query.id, user : req.user.id}) // получаем файл
            const path = fileService.getPath(file) // путь до файла
            if(fs.existsSync(path)){
                return res.downoload(path, file.name)
            }
            return res.status(400).json({message : "Downoload error"})
        } catch (error) {
            console.log(error)
            return res.status(500).json({message : "Downoload error"})
        }
    }

    async deleteFile(req,res){
        try {
            const file = await File.findOne({_id : req.query.id, user: req.user.id})
            if(!file){
                return res.status(400).json({message : "File not found"})
            }
            fileService.deleteOneFile(file)
            await file.remove()
            return res.json({message : 'File was deleted'})
        } catch (error) {
            console.log(error)
            return res.status(500).json({message : "Dir is not empty"})
        }
    }

    async seachFile(req,res){
        try {
            const searchName = req.query.search
            let files = await File({user: req.user.id})
            files = files.filter(file => file.name.includes(searchName))
            return res.json(files)
        } catch (error) {
            console.log(error)
            return res.status(500).json({message : "Search error"})
        }
    }

    async uploadUserPic(req, res){
        try {
            const file = req.files.file
            const user = await User.findById({_id : req.user.id})
            const userPic = Uuid.v4() + ".jpg"
            file.mv(config.get('staticPath') + "\\" + userPic)
            user.avatar = userPic
            await user.save()
            return res.json({user})
        } catch (error) {
            console.log(error)
            return res.status(500).json({message : "Upload error"})
        }
    }

    async deleteUserPic(req, res){
        try {

            const user = await User.findById({_id : req.user.id})
            fs.unlinkSync(config.get('staticPath') + '\\' + user.avatar)
            user.avatar = null
            await user.save()
            return res.json({user})
        } catch (error) {
            console.log(error)
            return res.status(500).json({message : "Delete error"})
        }
    }
}

module.exports = new fileController()