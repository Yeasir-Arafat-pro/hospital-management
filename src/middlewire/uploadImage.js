const multer  = require('multer')
const createErrors = require('http-errors')
const path = require('path')

const { uploadFileDestination, ALLOWED_FILE_TYPE, MAX_FILE_SIZE } = require('../secret')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadFileDestination)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + file.originalname
      cb(null, uniqueSuffix)
    }
  })

  const fileFilter = (req,file,cb) => {

    const extname = path.extname(file.originalname)

    if (!ALLOWED_FILE_TYPE.includes(extname.substring(1))) {
      return cb(createErrors(400, 'file type is not allowed. allowed file type are png, jpg, jpeg'))
    }

    


    cb(null, true)

  }
  
  const upload = multer({ 
    storage: storage,
    limits: {fileSize: Number(MAX_FILE_SIZE)},
    fileFilter: fileFilter
   })


  module.exports = upload