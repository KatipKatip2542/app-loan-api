import express from 'express'
import { deleteRegister, getAllRegister, getEmail, login, postRegister, putEmail, putRegister, sendEmailForChangePassword } from '../controllers/Login.js'
import { authenticationToken } from '../Middleware/Auth.js'
const route = express.Router()

route.get('/register', authenticationToken ,  getAllRegister)
route.post('/', login)
route.post('/register', postRegister)
route.put('/register', authenticationToken,  putRegister)
route.delete('/register/:id', authenticationToken , deleteRegister)

// Change Password
route.get('/getEmail', authenticationToken, getEmail)
route.put('/getEmail', authenticationToken, putEmail)
route.post('/getEmail/newPassword', sendEmailForChangePassword)





export default route