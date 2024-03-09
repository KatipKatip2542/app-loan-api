import pool from "../Connect.js";

export const getAllHouse = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `SELECT id, name, tell, address FROM house `;
    if (search) {
      sql += `WHERE name LIKE '%${search}%' `;
    } else {
      sql += ``;
    }
    // sql += `LIMIT 0,9`
    const [result] = await pool.query(sql)
    res.status(200).json(result)
    
  } catch (error) {
    console.error(error);
  }
};

export const postHouse = async (req, res) => {
  try {
    const { name, tell, address } = req.body;
    // Check name
    const sqlCheckName = `SELECT name FROM house WHERE name = ?`;
    const [resultCheck] = await pool.query(sqlCheckName, [name]);

    if (resultCheck.length > 0) {
      res.status(400).json({ message: "มีข้อมูลนี้ในระบบแล้ว" });
    } else {
      const sql = `INSERT INTO house (name, tell, address) VALUES (?, ?, ?)`;
      await pool.query(sql, [name, tell, address]);
      res.status(200).json({ message: "บันทึกสำเร็จ" });
    }
  } catch (error) {
    console.error(error);
  }
};

export const putHouse = async (req, res) => {
  try {
    const { id, name, tell, address } = req.body;

    // Check Username
    const sqlScheck = `SELECT name FROM house WHERE name = ? `;
    const [resultCheck] = await pool.query(sqlScheck, [name]);

    if (resultCheck[0]) {
      // มี name ในระบบแล้ว
      // เช็ค name กับ id
      const sqlCheckMyid = `SELECT name FROM house WHERE id = ? AND name = ?`;
      const [resultCheckMyId] = await pool.query(sqlCheckMyid, [id, name]);

      if (resultCheckMyId.length > 0) {
        // username ตรงกับ ID แสดงว่าคือ เราเอง แก้ได้เลย
        const sql = `UPDATE house SET  name = ?, tell = ?, address = ? WHERE id = ?`;
        await pool.query(sql, [name, tell, address, id]);
        res.status(200).json({ message: "แก้ไขสำเร็จ" });
      } else {
        // ไม่ตรงกับ ID เรา แสดงว่าเป็น username คนอื่น ไม่ให้ใช้นะ
        res.status(400).json({ message: "มีผู้ใช้งานนี้แล้ว" });
      }
    } else {
      // ยังไม่เคยมี Username ในระบบ
      const sql = `UPDATE house SET  name = ?, tell = ?, address = ? WHERE id = ?`;
      await pool.query(sql, [name, tell, address, id]);
      res.status(200).json({ message: "แก้ไขสำเร็จ !" });
    }
  } catch (error) {
    console.error(error);
  }
};

export const deleteHouse = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const sql = `DELETE FROM house WHERE id = ? `;
      await pool.query(sql, [id]);
      res.status(200).json({ message: "ทำรายการลบสำเร็จ !!" });
    }
  } catch (error) {
    console.error(error);
  }
};
