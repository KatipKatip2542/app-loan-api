import pool from "../Connect.js";
import bcrypt from "bcrypt";
const saltRounds = 10; // จำนวนรอบการเก็บ salt
import jwt from "jsonwebtoken";

export const getAllRegister = async (req, res) => {
  try {
    const { process_id, search } = req.query;

    if (process_id) {
      let sql = `SELECT id, name, status, tell, address FROM users WHERE name <> 'admin' AND process_id = ?  `;

      if (search) {
        sql += ` AND name LIKE '%${search}%' `;
      } else {
        // sql += `LIMIT 0,9`;
      }

      const [result] = await pool.query(sql, [process_id]);
      res.status(200).json(result);
    } else {
      throw new Error("ไม่พบข้อมูลสถานที่");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const postRegister = async (req, res) => {
  try {
    const { username, password, name, tell, address, process_id } = req.body;

    if (process_id) {
      // Check username ว่าบ้านนี้มีแล้วยัง
      const sqlCheck = `SELECT name FROM users WHERE name = ? AND process_id = ?`;
      const [resultCheck] = await pool.query(sqlCheck, [name, process_id]);

      // เข้ารหัส
      let hashedPassword = "";
      if (password) {
        const salt = bcrypt.genSaltSync(saltRounds);
        hashedPassword = bcrypt.hashSync(password, salt);
      }

      if (resultCheck.length > 0) {
        res.status(400).json({ message: "มีผู้ใช้งานนี้แล้ว" });
      } else {
        const sql = `INSERT INTO users (username, password, status, name, tell, address, process_id ) VALUES (?,?,?,?,?,?, ?)`;
        const [result] = await pool.query(sql, [
          username || "",
          hashedPassword || "",
          1,
          name || "",
          tell || "",
          address || "",
          process_id,
        ]);
        res.status(200).json({ message: "บันทึกสำเร็จ !!" });
      }
    } else {
      throw new Error("ไม่พบสถานที่");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const putRegister = async (req, res) => {
  try {
    const { id, name, tell, address } = req.body;

    // Check Username
    const sqlScheck = `SELECT name FROM users WHERE name = ? `;
    const [resultCheck] = await pool.query(sqlScheck, [name]);

    if (resultCheck[0]) {
      // มี name ในระบบแล้ว
      // เช็ค name กับ id
      const sqlCheckMyid = `SELECT name FROM users WHERE id = ? AND name = ?`;
      const [resultCheckMyId] = await pool.query(sqlCheckMyid, [id, name]);

      if (resultCheckMyId.length > 0) {
        // username ตรงกับ ID แสดงว่าคือ เราเอง แก้ได้เลย
        const sql = `UPDATE users SET  name = ?, tell = ?, address = ? WHERE id = ?`;
        await pool.query(sql, [name, tell, address, id]);
        res.status(200).json({ message: "แก้ไขสำเร็จ" });
      } else {
        // ไม่ตรงกับ ID เรา แสดงว่าเป็น username คนอื่น ไม่ให้ใช้นะ
        res.status(400).json({ message: "มีผู้ใช้งานนี้แล้ว" });
      }
    } else {
      // ยังไม่เคยมี Username ในระบบ
      const sql = `UPDATE users SET  name = ?, tell = ?, address = ? WHERE id = ?`;
      await pool.query(sql, [name, tell, address, id]);
      res.status(200).json({ message: "แก้ไขสำเร็จ !" });
    }
  } catch (error) {
    console.error(error);
  }
};

export const deleteRegister = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const sql = `DELETE FROM users WHERE id = ? `;
      await pool.query(sql, [id]);
      res.status(200).json({ message: "ทำรายการลบสำเร็จ !!" });
    }
  } catch (error) {
    console.error(error);
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const sqlCheckPassword = `SELECT id, username, password, name, status, tell, address FROM users WHERE username =   ?`;
    const [resultPassword] = await pool.query(sqlCheckPassword, [username]);
    const hashedPassword = resultPassword[0]?.password;


    if (hashedPassword) {
      // ถอดรหัส
      const isMatch = bcrypt.compare(password, hashedPassword);

      // สร้าง token
      const secretKey = "mySecretKey";
      const userData = {
        id: resultPassword[0].id,
        username: resultPassword[0].username,
        name: resultPassword[0].name,
        status: resultPassword[0].status,
        tell: resultPassword[0].tell,
        address: resultPassword[0].address,
      };

      const token = jwt.sign(userData, secretKey, { expiresIn: "1d" });

      if (isMatch) {
        res.status(200).json({ message: " เข้าสู่ระบบสำเร็จ", token });
      } else {
        res.status(401).json({ message: " ไม่พบผู้ใช้งานในระบบ" });
      }
    } else {
      res.status(401).json({ message: " ไม่พบผู้ใช้งานในระบบ" });
    }
  } catch (error) {
    console.error(error);
  }
};
