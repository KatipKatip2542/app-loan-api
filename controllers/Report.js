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
   
      const [result] = await pool.query(sql , [process_id]);

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
