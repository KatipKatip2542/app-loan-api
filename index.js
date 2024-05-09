import express from "express";
import pool from "./Connect.js";
import cors from 'cors'

// routers
import userRouter from "./routes/User.js";
import loginRouter from "./routes/Login.js";
import houseRouter from "./routes/House.js";
import processRouter from "./routes/Process.js";
import reportRouter from './routes/Report.js'

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://loandata-app.netlify.app', 'https://loandata-app-original.netlify.app', 'https://39f1-223-206-222-11.ngrok-free.app']
};
app.use(cors(corsOptions))
app.use(express.json())

app.get('/', (req,res)=> {
  res.send('test-001 sss หกหก')
})


app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/house", houseRouter);
app.use('/api/process', processRouter )
app.use('/api/report', reportRouter)


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});








