
// middleware.js

import pool from "../Connect.js";
import jwt from "jsonwebtoken";


// export const authenticationToken = async (req, res, next) => {
//     const secret = "mySecretKey";

//     try {
//       const authHeader = req.headers.authorization;
//       let authToken = "";
//       if (authHeader) {
//         authToken = authHeader.split(" ")[1];
//       }
  
//       const user = jwt.verify(authToken, secret);
  
//       const SELECT_USER_BY_USERNAME = "SELECT username FROM `users` WHERE username = ?";
//       const [checkResults] = await pool.query(SELECT_USER_BY_USERNAME, user.username);
//       if (!checkResults[0]) {
//         throw { message: "user not found" };
//       }
//       next();
//     } catch (error) {
//       console.log(error);
//       res.status(401).json({
//         message: "Unauthorized",
//         error: error.message, // You can customize the error message sent to the client
//       });
//     }
//   };

export const authenticationToken = async (req, res, next) => {
  const secret = "mySecretKey"; // คีย์ลับที่ใช้สำหรับสร้างและตรวจสอบ JWT

  try {
    // ดึง Token จาก Headers
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header is missing" });
    }

    const authToken = authHeader.split(" ")[1];
    if (!authToken) {
      return res.status(401).json({ message: "Token is missing" });
    }

    // ตรวจสอบ Token ว่าถูกต้องหรือไม่
    const decoded = jwt.verify(authToken, secret);

    // ตรวจสอบ Token ในฐานข้อมูล
    const SELECT_TOKEN_QUERY = "SELECT token FROM `users` WHERE username = ?";
    const [results] = await pool.query(SELECT_TOKEN_QUERY, [decoded.username]);

    if (!results[0]) {
      return res.status(401).json({ message: "User not found" });
    }

    if (results[0].token !== authToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // ผ่านการตรวจสอบ
    req.user = decoded; // เก็บข้อมูลผู้ใช้ไว้ใน req เพื่อใช้ในขั้นตอนถัดไป
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({
      message: "Unauthorized",
      error: error.message, // ส่งข้อความข้อผิดพลาดให้กับ Client
    });
  }
};

  
