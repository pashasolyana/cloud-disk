const fs = require('fs')
const File = require('../Models/File')
const config = require('config')

class FileService {
    createDir(file){
        const filePath = `${config.get('filePath')}\\${file.user}\\${file.path}`
        return new Promise(((resolve, reject) =>{
            try {
                if(!fs.existsSync(file)) {
                    fs.mkdirSync(filePath)
                    console.log('File was created')
                    return resolve({message : 'File was created'})
                } else {
                    console.log('File already exist')
                    return reject({message : 'File already exist'})
                }
            } catch (error) {
                console.log(error)
                return reject({message : 'file error'})
            }
        }))
    }

    getPath(file){
        return config.get('filePath') + '\\' + file.user + '\\' + file.path
    }

    deleteOneFile(file) {
        console.log(file)
        const path = this.getPath(file)
        if(file.type === 'dir') {
            fs.mkdirSync(path)
        } else{
            fs.unlinkSync(path)
        }
    }

}

module.exports = new FileService()