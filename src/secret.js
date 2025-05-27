require('dotenv').config();
const serverPort = process.env.PORT || 4001
const clientUrl = process.env.CLIENT_URL
const mongodbURL =  process.env.CONNECT_DB_URL_FROM_ATLAS || 'mongodb://localhost:27017/hospitalManagementDB'  


const smtpUsername = process.env.SMTP_USERNAME
const smtpPassword = process.env.SMTP_PASSWORD
const NODE_ENV = process.env.NODE_ENV 



const defaultImagePath = process.env.DEFAULT_IMAGE_PATH || '../public/image/user/default.png';
const uploadFileDestination = process.env.UPLOAD_FILE_DESTINATION
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE || 2097157
const ALLOWED_FILE_TYPE = process.env.ALLOWED_FILE_TYPE || ['jpg', 'jpeg', 'png']






module.exports = {serverPort, mongodbURL, defaultImagePath, clientUrl, smtpUsername, smtpPassword, uploadFileDestination, MAX_FILE_SIZE, ALLOWED_FILE_TYPE, NODE_ENV}
