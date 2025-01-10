import express from 'express'
import { authenticationToken } from '../Middleware/Auth.js'
import { ReportHouse, ReportUserBroken, ReportUserReload, ReportUserReloadById, ReportUsers, pdfUserReload, reportCheckMyHome, reportCheckMyHomeList } from '../controllers/Report.js'
const route = express.Router()

route.get('/user', authenticationToken, ReportUsers)
route.get('/house', authenticationToken, ReportHouse)
route.get('/user/broken', authenticationToken, ReportUserBroken)

// ประวัติรียอด
route.post('/user/reload', authenticationToken , ReportUserReload)
route.get('/user/reload/:id', authenticationToken , ReportUserReloadById)
route.post('/user/reload/pdf', authenticationToken , pdfUserReload )

// ประวัติบ้านที่ยังจ่ายไม่ครบ
route.get('/check/home', authenticationToken, reportCheckMyHome)
route.post('/check/home/list', authenticationToken, reportCheckMyHomeList)



export default route