import express from 'express'
import { authenticationToken } from '../Middleware/Auth.js'
import { ReportHouse, ReportUserBroken, ReportUserReload, ReportUserReloadById, ReportUsers, pdfUserReload } from '../controllers/Report.js'
const route = express.Router()

route.get('/user', authenticationToken, ReportUsers)
route.get('/house', authenticationToken, ReportHouse)
route.get('/user/broken', authenticationToken, ReportUserBroken)

// ประวัติรียอด
route.post('/user/reload', authenticationToken , ReportUserReload)
route.get('/user/reload/:id', authenticationToken , ReportUserReloadById)
route.post('/user/reload/pdf', authenticationToken , pdfUserReload )



export default route