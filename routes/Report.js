import express from 'express'
import { authenticationToken } from '../Middleware/Auth.js'
import { ReportHouse, ReportUserBroken, ReportUsers } from '../controllers/Report.js'
const route = express.Router()

route.get('/user', authenticationToken, ReportUsers)
route.get('/house', authenticationToken, ReportHouse)
route.get('/user/broken', authenticationToken, ReportUserBroken)



export default route