const Router = require("express");
const router = new Router();
const authMiddleware = require('../middleware/auth.middleware')
const fileController = require('../controllers/fileController')


router.post('', authMiddleware, fileController.createDir)
router.post('/upload', authMiddleware, fileController.uploadFile)
router.post('/avatar', authMiddleware, fileController.uploadUserPic)
router.get('', authMiddleware, fileController.getFiles)
router.get('/search', authMiddleware, fileController.seachFile)
router.get('/download', authMiddleware, fileController.downoloadFile)
router.delete('/', authMiddleware, fileController.deleteFile)
router.delete('/avatar', authMiddleware, fileController.deleteUserPic)


module.exports = router