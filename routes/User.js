import express from 'express'
import { getUser } from "../controllers/User.js";
const route = express.Router()

route.get('/', getUser)



export default route

