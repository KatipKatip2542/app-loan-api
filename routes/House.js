import express from 'express'
import { deleteHouse, getAllHouse, postHouse, putHouse } from '../controllers/House.js'
import { authenticationToken } from '../Middleware/Auth.js'
const route = express.Router()

route.get('/', authenticationToken,  getAllHouse)
route.post('/', authenticationToken , postHouse)
route.put('/', authenticationToken , putHouse)
route.delete('/:id', authenticationToken , deleteHouse)

export default route