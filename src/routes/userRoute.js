const { handleGetAllUsers, handleGetUserById, handleDeleteUserById, handleProcessRegister, handleActivateUserAccount, handleUpdateUserById } = require('../controllers/userController');
const upload = require('../middlewire/uploadImage');
const runValidation = require('../validators');
const { validateUserRagistration } = require('../validators/auth');

const userRouter = require('express').Router();

userRouter.get('/:id', handleGetUserById)
userRouter.delete('/:id', handleDeleteUserById)
userRouter.put('/:id', handleUpdateUserById)
userRouter.get('/', handleGetAllUsers)
userRouter.post('/process-register', upload.single('image'), validateUserRagistration, runValidation, handleProcessRegister)
userRouter.post('/verify', handleActivateUserAccount)



module.exports = userRouter