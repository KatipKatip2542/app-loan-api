import pool from "../Connect.js";

export const ReportUsers = async (req, res) => {
  try {
    const { process_id, search } = req.query;

    if (process_id) {
      let sql = `SELECT process_user.id , process_user.status, users.name, process_user.total, process_user.paid, process_user.overdue, process.name AS house_name
    FROM process_user 
    JOIN users ON process_user.user_id = users.id
    JOIN process ON process_user.process_id = process.id
    WHERE process_user.status = 0 AND process_user.process_id = ?   `;
      if (search) {
        sql += ` AND users.name LIKE '%${search}%'  `;
      } else {
        sql += ``;
      }

      const [result] = await pool.query(sql, [process_id]);

      if (result) {
        const totals = { total: 0, price: 0, overdue: 0 };

        const summedData = result.reduce((acc, curr) => {
          acc.total += curr.total;
          acc.price += curr.paid;
          acc.overdue += curr.overdue;
          return acc;
        }, totals);

        res.status(200).json({ data: result, totals: summedData });
      }
    } else {
      throw new Error("ไม่พบสถานที่");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const ReportHouse = async (req, res) => {
  try {
    const { process_id } = req.query;

    if (process_id) {
      let sql = `SELECT process_user.id , process_user.status, users.name, process_user.total, process_user.paid, process_user.overdue, process.name AS house_name
          FROM process_user 
          JOIN users ON process_user.user_id = users.id
          JOIN process ON process_user.process_id = process.id
          WHERE process_user.status = 0 AND  process_user.process_id = ?  `;

      const [result] = await pool.query(sql, [process_id]);

      if (result) {
        const totals = { total: 0, price: 0, overdue: 0 };

        const summedData = result.reduce((acc, curr) => {
          acc.total += curr.total;
          acc.price += curr.paid;
          acc.overdue += curr.overdue;
          return acc;
        }, totals);

        res.status(200).json({ data: result, totals: summedData });
      }
    } else {
      throw new Error("ไม่พบสถานที่");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const ReportUserBroken = async (req, res) => {
  try {
    const { process_id } = req.query;

    if (process_id) {
      let sql = `SELECT process_user.id , process_user.status, users.name, process_user.total, process_user.paid, process_user.overdue, process.name AS house_name
  FROM process_user 
  JOIN users ON process_user.user_id = users.id
  JOIN process ON process_user.process_id = process.id
  WHERE process_user.status = 2 AND process_user.process_id = ? `;

      const [result] = await pool.query(sql, [process_id]);

      if (result) {
        const totals = { total: 0, price: 0, overdue: 0 };

        const summedData = result.reduce((acc, curr) => {
          acc.total += curr.total;
          acc.price += curr.paid;
          acc.overdue += curr.overdue;
          return acc;
        }, totals);

        res.status(200).json({ data: result, totals: summedData });
      }
    } else {
      throw new Error("ไม่พบสถานที่");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

// ประวัตืรียอด
export const ReportUserReload = async (req, res) => {
  try {
    const { process_id, date, search } = req.body;

    if (process_id) {
      let sqlCheck = `SELECT 
      users.name AS user , 
      story_reload.price AS price ,
      story_reload.price_pay AS price_pay , 
      DATE_FORMAT(story_reload.date, '%Y-%m-%d') AS date,
      story_reload.total_sum AS total_sum ,
      story_reload.qty_overpay AS  qty_overpay ,
      process_user.id AS process_user_id ,
      story_reload.id AS id , 
      COUNT(story_reload_list.id) AS count_day

      FROM story_reload
      LEFT JOIN process_user ON story_reload.process_user_id = process_user.id
      LEFT JOIN users ON process_user.user_id = users.id
      LEFT JOIN story_reload_list ON story_reload.id = story_reload_list.story_reload_id
      WHERE process_user.process_id = ? 
    
      `;

      if (date && search) {
        sqlCheck += ` AND  story_reload.date LIKE '%${date}%' AND  users.name LIKE '%${search}%' `;
      } else if (date) {
        sqlCheck += ` AND story_reload.date LIKE '%${date}%'  `;
      } else if (search) {
        sqlCheck += `AND  users.name LIKE '%${search}%'`;
      } else {
        sqlCheck += ` `;
      }

      sqlCheck += ` GROUP BY   users.name, process_user.price, process_user.count_day, story_reload.price_pay, story_reload.date, story_reload.total_sum, story_reload.qty_overpay, process_user.id, story_reload.id `

      const [resultCheck] = await pool.query(sqlCheck, [process_id]);
      // console.log(resultCheck);

      res.status(200).json(resultCheck);
    } else {
      throw new Error("ไม่พบบ้าน");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

export const ReportUserReloadById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const sql = `SELECT  DATE_FORMAT(date, '%Y-%m-%d') AS date , price   FROM story_reload_list WHERE story_reload_id = ?`;
    const [result] = await pool.query(sql, [id]);

    if (result) {
      res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

export const pdfUserReload = async (req, res) => {
  try {
    const { process_id, date, search } = req.body;

    if (process_id) {
      let sqlCheck = `SELECT 
      users.name AS user , 
      process_user.price AS price ,
      process_user.count_day AS count_day , 
      story_reload.price_pay AS price_pay , 
      DATE_FORMAT(story_reload.date, '%Y-%m-%d') AS date,
      story_reload.total_sum AS total_sum ,
      story_reload.qty_overpay AS  qty_overpay ,
      process_user.id AS process_user_id ,
      story_reload.id AS id
      FROM story_reload
      LEFT JOIN process_user ON story_reload.process_user_id = process_user.id
      LEFT JOIN users ON process_user.user_id = users.id
      WHERE process_user.process_id = ? 
      `;

      if (date && search) {
        sqlCheck += ` AND  story_reload.date LIKE '%${date}%' AND  users.name LIKE '%${search}%' `;
      } else if (date) {
        sqlCheck += ` AND story_reload.date LIKE '%${date}%'  `;
      } else if (search) {
        sqlCheck += `AND  users.name LIKE '%${search}%'`;
      } else {
        sqlCheck += ` `;
      }

      const [resultCheck] = await pool.query(sqlCheck, [process_id]);

      let data = [];
      for (const item of resultCheck) {
        const sql = `SELECT  DATE_FORMAT(date, '%Y-%m-%d') AS date , price , story_reload_id   FROM story_reload_list  WHERE story_reload_id = ?`;
        const [result] = await pool.query(sql, [item.id]);
        const data_list = result
        const test = {
          user: item.user,
          price: item.price,
          count_day : item.count_day,
          price_pay : item.price_pay,
          date : item.date, 
          total_sum : item.total_sum, 
          qty_overpay : item.qty_overpay, 
          data_list : data_list
        }
        data.push(test)
    
      }


      res.status(200).json(data)
    } else {
      throw new Error("ไม่พบบ้าน");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};



// ประวัติ บ้านที่ยังจ่ายเงินไม่ครบ
export const reportCheckMyHome = async(req,res)=> {
  let db = await pool.getConnection()
  try {
    const sql = `SELECT process.name , process.id
    FROM process
    INNER JOIN process_user ON process.id = process_user.process_id
    WHERE process_user.status = ? 
    GROUP BY process.id, process.name 
    HAVING COUNT(process_user.id) > 0
    `
    const [result] = await db.query(sql, [0])

    return res.status(200).json(result)
    
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  } finally {
    if(db) db.release()
  }
}

export const reportCheckMyHomeList = async(req,res)=> {
  let db = await pool.getConnection()
  const {id} = req.body
  
  try {

 
    // List
    const sql = `SELECT DISTINCT  process_user.id , users.name  ,process_user.total, process_user.paid, process_user.overdue, process_user.status
    FROM process_user 
    INNER JOIN process_user_list ON process_user.id = process_user_list.process_user_id
    INNER JOIN users ON users.id = process_user.user_id
    WHERE process_user.process_id = ? AND process_user.status = ?
    `
    const [result] = await db.query(sql, [id, 0])
    
    // sum_all
    const sqlSum = `SELECT  process_user.id , process_user.total, process.name AS name
    FROM process_user 
    INNER JOIN process ON process_user.process_id = process.id
    WHERE process_user.process_id = ? 
    `
    const [resultSum] = await db.query(sqlSum, [id])


    // ราคารวม
    const sum_all = resultSum.reduce((sum, row)=> sum + row.total, 0)
    // ยังไม่จ่าย
    const sum_remaining = result.reduce((sum, row)=> sum + row.total, 0 )
    // คงเหลือ
    const sum_paying  = sum_all - sum_remaining

    const process_name = resultSum[0].name
    
    
    const data = {
      result : result,
      count_pay : resultSum.length,
      count_no_pay : result.length,
      sum_all : sum_all,
      sum_paying : sum_paying,
      sum_remaining : sum_remaining ,
      name : process_name
    
    }
    return res.status(200).json(data)

  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  } finally {
    if(db) db.release()
  }
}