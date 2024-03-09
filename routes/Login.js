import express from 'express'
import { deleteRegister, getAllRegister, login, postRegister, putRegister } from '../controllers/Login.js'
import { authenticationToken } from '../Middleware/Auth.js'
const route = express.Router()

route.get('/register', authenticationToken ,  getAllRegister)
route.post('/', login)
route.post('/register', postRegister)
route.put('/register', authenticationToken,  putRegister)
route.delete('/register/:id', authenticationToken , deleteRegister)





export default route