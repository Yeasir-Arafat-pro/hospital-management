const express = require('express');
const { handleLogin, handleLogout, handleRefreshToken, handleProtectedRoute } = require('../controllers/authController');
const { isLoggedOut, isLoggedIn } = require('../middlewire/auth');
// const { validateUserLogin } = require('../validators/auth');
// const { runValidation } = require('../validators');

const authRouter = express.Router()



authRouter.post("/login", isLoggedOut, handleLogin)
authRouter.post("/logout", isLoggedIn, handleLogout)
authRouter.get("/refresh-token", handleRefreshToken)
authRouter.get("/protected", handleProtectedRoute)



module.exports = authRouter

