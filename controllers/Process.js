import pool from "../Connect.js";
import moment from "moment";

export const getProcessTitle = async (req, res) => {
  try {
    const { search } = req.query;

    let sql = `
    SELECT  process.name, process.tell, process.address,  process.id, process.total, process.paid, process.overdue
    FROM process
    `;

    if (search) {
      sql += `WHERE name LIKE '%${search}%' `;
    } else {
      sql += ` LIMIT 20`;
    }

    const [result] = await pool.query(sql);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

export const postNewProcess = async (req, res) => {
  try {
    const { name, tell, address } = req.body;

    if (name && tell) {
      // เช็ค ค่าซ้ำ
      const sqlCheck = `SELECT id FROM process WHERE name = ? LIMIT 1`;
      const [resultCheck] = await pool.query(sqlCheck, [name]);

      if (resultCheck.length > 0) {
        throw new Error("สถานที่นี้ถูกสร้างไปแล้ว");
        console.log(111);
      } else {
        const sql = `INSERT INTO process (name, tell, address) VALUES (?, ?, ?)`;
        await pool.query(sql, [name, tell, address]);
        res.status(200).json({ message: "บันทึกสำเร็จ" });
      }
    } else {
      throw new Error("ไม่พบชื่อและเบอร์โทรลูกค้า");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProcess = async (req, res) => {
  try {
    const { id, name, tell, address } = req.body;

    // Check Username
    const sqlScheck = `SELECT name FROM process WHERE name = ? `;
    const [resultCheck] = await pool.query(sqlScheck, [name]);

    if (resultCheck[0]) {
      // มี name ในระบบแล้ว
      // เช็ค name กับ id
      const sqlCheckMyid = `SELECT name FROM process WHERE id = ? AND name = ?`;
      const [resultCheckMyId] = await pool.query(sqlCheckMyid, [id, name]);

      if (resultCheckMyId.length > 0) {
        // username ตรงกับ ID แสดงว่าคือ เราเอง แก้ได้เลย
        const sql = `UPDATE process SET  name = ?, tell = ?, address = ? WHERE id = ?`;
        await pool.query(sql, [name, tell, address, id]);
        res.status(200).json({ message: "แก้ไขสำเร็จ" });
      } else {
        // ไม่ตรงกับ ID เรา แสดงว่าเป็น username คนอื่น ไม่ให้ใช้นะ
        res.status(400).json({ message: "มีผู้ใช้งานนี้แล้ว" });
      }
    } else {
      // ยังไม่เคยมี Username ในระบบ
      const sql = `UPDATE process SET  name = ?, tell = ?, address = ? WHERE id = ?`;
      await pool.query(sql, [name, tell, address, id]);
      res.status(200).json({ message: "แก้ไขสำเร็จ !" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteProcess = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const sql = `DELETE FROM process WHERE id = ? `;
      await pool.query(sql, [id]);
      res.status(200).json({ message: "ทำรายการลบสำเร็จ !!" });
    }
  } catch (error) {
    console.error(error);
  }
};

// Users

export const getProcessUserByProcessId = async (req, res) => {
  try {
    const { status, process_id } = req.query;
    console.log(req.query);

    let sql = `
        SELECT process_user.id, process_user.price, process_user.count_day, process_user.status, process_user.total, process_user.paid, process_user.overdue,  users.name
        FROM process_user 
        LEFT JOIN users ON process_user.user_id = users.id
        WHERE process_user.process_id = ?  
        `;

    if (process_id) {
      // if (status) {
      //   sql += ` AND process_user.status = ? `;
      // } else if(status == 0){
      //   sql += ` AND (process_user.status = ? OR process_user.status = ?)`;

      // }

      // else {
      //   sql += ` ;`;
      // }

      //   if (status !== undefined) {
      //     if (status === 0) {
      //         sql += ` AND (process_user.status = 0 OR process_user.status = 3)`;
      //     } else {
      //         sql += ` AND process_user.status = ?`;
      //         values.push(status);
      //     }
      // }

      //   const [result] = await pool.query(sql, [process_id, status]); 1

      let values = [process_id];

      if (status !== undefined && status !== "") {
        if (status == 0) {
          sql += ` AND (process_user.status = 0 OR process_user.status = 3)`;
        } else {
          sql += ` AND process_user.status = ?`;
          values.push(status);
        }
      }

      // sql += ` LIMIT 20 `;

      const [result] = await pool.query(sql, values);

      const newResult = result.map((item) => {
        return {
          id: item.id,
          price: item.price,
          count_day: item.count_day,
          // start_day: `${moment(item.start_day).format("DD-MM-")}${moment(
          //   item.start_day
          // )
          //   .add(543, "year")
          //   .format("YYYY")}`,
          // end_day: `${moment(item.end_day).format("DD-MM-")}${moment(
          //   item.end_day
          // )
          //   .add(543, "year")
          //   .format("YYYY")}`,
          status: item.status,
          total: item.total,
          paid: item.paid,
          overdue: item.overdue,
          name: item.name,
        };
      });
      res.status(200).json(newResult);
    }
  } catch (error) {
    console.error(error);
  }
};

export const postNewProcessUser = async (req, res) => {
  try {
    const { process_id, user_id, price, count_day } = req.body;

    // console.log(process_id);

    if (process_id) {
      const sqlCheck = `SELECT id, total, paid FROM process_user WHERE process_id = ? AND user_id = ? ORDER BY id DESC LIMIT 1`;
      const [resultCheck] = await pool.query(sqlCheck, [process_id, user_id]);
      let sql = "";
      let check = false;
      console.log(resultCheck);

      if (resultCheck.length > 0) {
        if (resultCheck[0].paid < resultCheck[0].total) {
          check = false;
          throw new Error("ผู้ใช้งานนี้ กำลังดำเนินการอยู่");
        } else {
          check = true;
        }
      } else {
        check = true;
      }

      if (check === true) {
        const sql = `INSERT INTO process_user (process_id, user_id, price, count_day, total, overdue) VALUES (?, ?, ?, ?, ?, ?)`;
        const [resultInsert] = await pool.query(sql, [
          process_id,
          user_id,
          price,
          count_day,
          price,
          price,
        ]);

        // UPDATE ยอดรวม PROCESS
        // หาจำนวนล่าสุดก่อน
        const sqlSumTotalProcess = `SELECT total, paid, overdue FROM process WHERE id = ? LIMIT 3 `;
        const [resultSumTotalProcess] = await pool.query(sqlSumTotalProcess, [
          process_id,
        ]);

        const sumTotal = Number(resultSumTotalProcess[0].total) + Number(price);
        const overdueTotal =
          Number(resultSumTotalProcess[0].overdue) + Number(price);

        const updateTotalProcess = `UPDATE process SET total = ?, overdue = ? WHERE id = ?`;
        const [resultUpdateTotalProcess] = await pool.query(
          updateTotalProcess,
          [sumTotal, overdueTotal, process_id]
        );

        if (resultUpdateTotalProcess) {
          // INSERT PROCESS_USER_LIST
          // ID ล่าสุดที่พึ่ง insert
          const lastInsertedId = resultInsert.insertId;
          // เก่า 208  = 5000 / 24
          // const newPrice = price / count_day;

          // ใหม่ 5 = 5000 / 1000
          //  5 * 50 = 250
          const price01 = Number(price) / 1000;
          const newPrice = price01 * 50;

          for (let i = 0; i < count_day; i++) {
            // const newDate = moment(start_day)
            //   .add(i, "days")
            //   .format("YYYY-MM-DD");

            const sql =
              "INSERT INTO process_user_list ( process_user_id) VALUES (?)";
            await pool.query(sql, [lastInsertedId]);
          }
        }
        res.status(200).json({ message: "บันทึกสำเร็จ" });
      }
    } else {
      throw new Error("ไม่พบสถานที่");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const putProcessUser = async (req, res) => {
  try {
    const { id, status, price, date, process_id } = req.body;

    if (id && status >= 0 && price) {
      // อยากให้ sql หาจำนวน priceที่จ่ายแล้ว
      const sqlCheck = `SELECT SUM(price) AS sum_price FROM process_user_list WHERE process_user_id = ?`;
      const [resultCheck] = await pool.query(sqlCheck, [id]);
      const sum_price = resultCheck[0].sum_price;

      // หาค่า 1000 ละ 50 = งวดละ 250
      const sum_day = (Number(price) / 1000) * 50;
      // เช่น ยืม 24 วัน ถึงจะได้ กำไรมา 1000 เช่น ยอด 5000 กำไร 1000 เป็น 6000 (250 * 24) = 6000
      const sum_process = Number(sum_day) * Number(date);
      // ลบ ที่จ่ายแล้ว 2000 จาก price 5000 เหลือ  6000 - 2000 คงเหลือ 4000
      const sum_total = Number(sum_process) - Number(sum_price);

      if (sum_total) {
        // CHECK TOTAL PROCESS
        const sqlCheckProcess = `SELECT total, paid, overdue FROM process WHERE id = ? LIMIT 3  `;
        const [resultCheckProcess] = await pool.query(sqlCheckProcess, [
          process_id,
        ]);

        let totalProcess = resultCheckProcess[0].total;
        let paidProcess = resultCheckProcess[0].paid;
        let overdueProcess = resultCheckProcess[0].overdue;

        //   CHECK TOTAL PROCESS_USER
        const sqlCheck = `SELECT paid, overdue, total, status FROM process_user WHERE id = ? LIMIT 3  `;
        const [resultCheck] = await pool.query(sqlCheck, [id]);

        let totalProcessUser = resultCheck[0].total;
        let paidProcessUser = resultCheck[0].paid;
        let overdueProcessUser = resultCheck[0].overdue;

        if (status == 2) {
          // Process
          totalProcess =
            price > resultCheckProcess[0].paid
              ? price
              : resultCheckProcess[0].paid;
          paidProcess = paidProcess - sum_price;
          overdueProcess =
            price > resultCheckProcess[0].paid
              ? price
              : resultCheckProcess[0].paid;
        } else if (status == 0) {
          // Process
          totalProcess =
            price > resultCheckProcess[0].paid
              ? price
              : resultCheckProcess[0].paid;
          paidProcess = Number(sum_price);
          overdueProcess = totalProcess - sum_price;
        } else {
          throw new Error("ไม่พบสถานะผู้่ใช้งาน ");
        }

        // Process_User
        totalProcessUser =
          price > resultCheck[0].paid ? price : resultCheck[0].paid;
        paidProcessUser = Number(sum_price);
        overdueProcessUser = totalProcess - sum_price;

        //   SQL UPDATE PROCESS
        const sqlUpdateProcess = `UPDATE process SET total = ?, paid = ?, overdue = ?  WHERE id = ?   `;
        await pool.query(sqlUpdateProcess, [
          totalProcess,
          paidProcess,
          overdueProcess,
          process_id,
        ]);

        // update process_user
        const sql = ` UPDATE process_user SET status = ? , total = ? , paid = ? , overdue = ? WHERE id = ? `;
        await pool.query(sql, [
          status,
          totalProcessUser,
          paidProcessUser,
          overdueProcessUser,
          id,
        ]);
        res.status(200).json({ message: "ทำรายการสำเร็จ" });
      }
    } else {
      throw new Error("ไม่สามารถทำรายการได้ หห");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

// User_List

export const getUserListByProcessUserId = async (req, res) => {
  try {
    const { process_user_id } = req.query;

    if (process_user_id) {
      const sql = `SELECT id, date, price, status FROM process_user_list WHERE process_user_id = ?`;
      const [result] = await pool.query(sql, [process_user_id]);

      const newResult = result.map((item) => {
        return {
          id: item.id,
          date: `${moment(item.date).format("DD-MM-")}${moment(item.date)
            .add(543, "years")
            .format("YYYY")}`,
          price: item.price,
          status: item.status,
        };
      });

      res.status(200).json(newResult);
    }
  } catch (error) {
    console.log(error);
  }
};

// export const putUserList = async (req, res) => {
//   try {
//     const { id, status, price, process_user_id, process_id, date } = req.body;

//     if (id && status > 0) {
//       // เช็ค index ก่อนหน้าว่า จ่ายเงินหรือยัง
//       const sqlCheckProcessUserListStatus = `SELECT status, id FROM process_user_list WHERE process_user_id = ?`;
//       const [resultCheckProcessUserListStatus] = await pool.query(
//         sqlCheckProcessUserListStatus,
//         [process_user_id]
//       );

//       const newData = await Promise.all(
//         resultCheckProcessUserListStatus.map(async (item, index, array) => {
//           const MyId = item.id == id;
//           if (MyId) {
//             if (index == 0) {
//               // INSERT SQL
//               const sql = `UPDATE process_user_list SET status = ?, date = ?, price = ? WHERE id = ? `;
//               await pool.query(sql, [status, date, price, id]);
//               return { success: true, message: "อัปเดตข้อมูลสำเร็จ" };
//             } else {
//               // หา INDEX น้อยกว่า
//               if (index > 0 && array[index - 1].status == 1) {
//                 // INSERT SQL
//                 const sql = `UPDATE process_user_list SET status = ?, date = ?, price = ? WHERE id = ?`;
//                 await pool.query(sql, [status, date, price, id]);
//                 return { success: true, message: "อัปเดตข้อมูลสำเร็จ" };
//               } else {
//                 throw new Error("ข้อมูลก่อนหน้านี้ยังไม่ชำระเงิน");
//               }
//             }
//           } else {
//             return null; // กระโดดออกจากการทำงานหากไม่ใช่ MyId
//           }
//         })
//       );

//       const successUpdates = newData.filter((data) => data && data.success);

//       // ถ้า UPDATE STATUS แล้ว ให้ไป UPDATE ค่าอื่นๆ ด้วย
//       if (successUpdates.length > 0) {
//         // CHECK TOTAL PROCESS
//         const sqlCheckProcess = `SELECT total, paid, overdue FROM process WHERE id = ? LIMIT 3  `;
//         const [resultCheckProcess] = await pool.query(sqlCheckProcess, [
//           process_id,
//         ]);

//         //   CHECK TOTAL PROCESS_USER
//         const sqlCheck = `SELECT paid, overdue, total, status FROM process_user WHERE id = ? LIMIT 3  `;
//         const [resultCheck] = await pool.query(sqlCheck, [process_user_id]);

//         //   console.log(resultCheck[0]);

//         let paidTotal = resultCheck[0].paid; //25
//         let overdueTotal = resultCheck[0].overdue; //75

//         let paidProcess = resultCheckProcess[0].paid;
//         let overdueProcess = resultCheckProcess[0].overdue;

//         if (status == 1) {
//           // Process_User
//           paidTotal = Number(paidTotal) + Number(price);
//           overdueTotal = Number(overdueTotal) - Number(price);
//           // Process
//           paidProcess = Number(paidProcess) + Number(price);
//           overdueProcess = Number(overdueProcess) - Number(price);
//         } else {
//           throw new Error("ไม่พบสถานะ");
//         }

//         if (resultCheck[0].status === 0) {
//           //   SQL UPDATE PROCESS
//           const sqlUpdateProcess = `UPDATE process SET paid = ?, overdue = ?  WHERE id = ?   `;
//           await pool.query(sqlUpdateProcess, [
//             paidProcess,
//             overdueProcess,
//             process_id,
//           ]);
//         }

//         //   SQL UPDATE PROCESS_USER
//         const sqlUpdate = `UPDATE process_user SET paid = ?, overdue = ?  WHERE id = ?   `;
//         const [resultSqlUpdate] = await pool.query(sqlUpdate, [
//           paidTotal,
//           overdueTotal,
//           process_user_id,
//         ]);

//         if (resultSqlUpdate) {
//           // เช็ค ถ้า Process_user_list จ่ายหมดแล้ว ให้ process_user เปลี่ยน status เป็น 1
//           const sqlCheckUpdateProcessUserStatus = `SELECT COUNT(*) AS total_rows, SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS total_status_1
//                     FROM process_user_list
//                     WHERE process_user_id = ?`;

//           const [resultCheckUpdateProcessUserStatus] = await pool.query(
//             sqlCheckUpdateProcessUserStatus,
//             [process_user_id]
//           );

//           const totalRows = resultCheckUpdateProcessUserStatus[0].total_rows;
//           const totalStatus1 =
//             resultCheckUpdateProcessUserStatus[0].total_status_1;

//           if (resultCheck[0].status === 0) {
//             if (totalRows > 0 && totalRows == totalStatus1) {
//               const sqlUpdateProcessUserStatus = `UPDATE process_user SET status = 1 WHERE id = ?`;
//               await pool.query(sqlUpdateProcessUserStatus, [process_user_id]);
//               console.log(11111);
//             } else {
//               const sqlUpdateProcessUserStatus = `UPDATE process_user SET status = 0 WHERE id = ?`;
//               await pool.query(sqlUpdateProcessUserStatus, [process_user_id]);
//             }
//           }

//           res.status(200).json({ message: "ทำรายการสำเร็จ" });
//         }
//       } else {
//         throw new Error("ไม่สามารถทำรายการได้");
//       }
//     } else {
//       throw new Error("นอก");
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json(error.message);
//   }
// };

export const putUserList = async (req, res) => {
  try {
    const { id, status, price, process_user_id, process_id, date } = req.body;
    const sql = `UPDATE process_user_list SET status = ?, date = ?, price = ? WHERE id = ? `;
    await pool.query(sql, [status, date, price, id]);

    // ให้ไป UPDATE ค่าอื่นๆ ด้วย
    //  CHECK TOTAL PROCESS
    const sqlCheckProcess = `SELECT total, paid, overdue FROM process WHERE id = ? LIMIT 3  `;
    const [resultCheckProcess] = await pool.query(sqlCheckProcess, [
      process_id,
    ]);

    //   CHECK TOTAL PROCESS_USER
    const sqlCheck = `SELECT paid, overdue, total, status, count_day FROM process_user WHERE id = ? LIMIT 3  `;
    const [resultCheck] = await pool.query(sqlCheck, [process_user_id]);

    //   console.log(resultCheck[0]);

    let paidTotal = resultCheck[0].paid; //25
    let overdueTotal = resultCheck[0].overdue; //75

    let paidProcess = resultCheckProcess[0].paid;
    let overdueProcess = resultCheckProcess[0].overdue;

    if (status == 1) {
      // Process_User
      paidTotal = Number(paidTotal) + Number(price);
      overdueTotal = Number(overdueTotal) - Number(price);
      // Process
      paidProcess = Number(paidProcess) + Number(price);
      overdueProcess = Number(overdueProcess) - Number(price);
    } else {
      throw new Error("ไม่พบสถานะ");
    }

    // console.log('paidTotal', paidTotal);
    // console.log('overdueTotal', overdueTotal);

    // console.log('paidProcess', paidProcess);
    // console.log('overdueProcess', overdueProcess);

    if (resultCheck[0].status === 0) {
      //   SQL UPDATE PROCESS
      const sqlUpdateProcess = `UPDATE process SET paid = ?, overdue = ?  WHERE id = ?   `;
      await pool.query(sqlUpdateProcess, [
        paidProcess,
        overdueProcess,
        process_id,
      ]);
    }

    //   SQL UPDATE PROCESS_USER
    const sqlUpdate = `UPDATE process_user SET paid = ?, overdue = ?  WHERE id = ?   `;
    const [resultSqlUpdate] = await pool.query(sqlUpdate, [
      paidTotal,
      overdueTotal,
      process_user_id,
    ]);

    if (resultSqlUpdate) {
      res.status(200).json("บันทึกสำเร็จ");

      // ถ้าจ่ายครบ จะ UPDATE Process_user ว่า จ่ายแล้ว
      const sqlCheckProcessUserList = `SELECT COUNT(status) AS count FROM process_user_list WHERE process_user_id = ? AND status = 1`;
      const [resultCheckProcessUserList] = await pool.query(
        sqlCheckProcessUserList,
        [process_user_id]
      );
      const count = resultCheckProcessUserList[0].count;
      if (count == resultCheck[0].count_day) {
        const sqlUpdateProcessUserStatus = `UPDATE process_user SET status = ? WHERE id = ?`;
        await pool.query(sqlUpdateProcessUserStatus, [1, process_user_id]);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};
export const putUserListCancel = async (req, res) => {
  try {
    const { id, status, price, process_user_id, process_id, date } = req.body;

    // console.log(req.body);
    if (id && status < 1) {
      // เช็ค index ก่อนหน้าว่า จ่ายเงินหรือยัง
      const sqlCheckProcessUserListStatus = `SELECT status, id FROM process_user_list WHERE process_user_id = ?`;
      const [resultCheckProcessUserListStatus] = await pool.query(
        sqlCheckProcessUserListStatus,
        [process_user_id]
      );

      // console.log(resultCheckProcessUserListStatus);

      const newData = await Promise.all(
        resultCheckProcessUserListStatus.map(async (item, index, array) => {
          const MyId = item.id == id;

          if (MyId) {
            if (index == 0) {
              // INSERT SQL
              const sql = `UPDATE process_user_list SET status = ?, date = ?, price = ? WHERE id = ? `;
              await pool.query(sql, [status, null, null, id]);
              return { success: true, message: "อัปเดตข้อมูลสำเร็จ" };
            } else {
              const sql = `UPDATE process_user_list SET status = ?, date = ?, price = ? WHERE id = ?`;
              await pool.query(sql, [status, null, null, id]);
              return { success: true, message: "อัปเดตข้อมูลสำเร็จ" };

              // หา INDEX น้อยกว่า
              // if (index > 0 && array[index - 1].status == 1) {
              //   // INSERT SQL
              //   const sql = `UPDATE process_user_list SET status = ?, date = ?, price = ? WHERE id = ?`;
              //   await pool.query(sql, [status, null, 0, id]);
              //   return { success: true, message: "อัปเดตข้อมูลสำเร็จ" };
              // } else {
              //   throw new Error("ข้อมูลก่อนหน้านี้ยังไม่ชำระเงิน");
              // }
            }
          } else {
            return null; // กระโดดออกจากการทำงานหากไม่ใช่ MyId
          }
        })
      );

      const successUpdates = newData.filter((data) => data && data.success);

      // ถ้า UPDATE STATUS แล้ว ให้ไป UPDATE ค่าอื่นๆ ด้วย

      if (successUpdates.length > 0) {
        // const sql = `UPDATE process_user_list SET status = ? WHERE id = ?`;
        // await pool.query(sql, [status, id]);

        // CHECK TOTAL PROCESS
        const sqlCheckProcess = `SELECT total, paid, overdue FROM process WHERE id = ? LIMIT 3  `;
        const [resultCheckProcess] = await pool.query(sqlCheckProcess, [
          process_id,
        ]);

        //   CHECK TOTAL PROCESS_USER
        const sqlCheck = `SELECT paid, overdue, total, status FROM process_user WHERE id = ? LIMIT 3  `;
        const [resultCheck] = await pool.query(sqlCheck, [process_user_id]);

        //   console.log(resultCheck[0]);

        let paidTotal = resultCheck[0].paid; //25
        let overdueTotal = resultCheck[0].overdue; //75

        let paidProcess = resultCheckProcess[0].paid;
        let overdueProcess = resultCheckProcess[0].overdue;

        if (status == 0) {
          // Process_User
          paidTotal = Number(paidTotal) - Number(price);
          overdueTotal = Number(overdueTotal) + Number(price);

          // Process
          paidProcess = Number(paidProcess) - Number(price);
          overdueProcess = Number(overdueProcess) + Number(price);
        } else {
          throw new Error("ไม่พบสถานะ");
        }

        if (resultCheck[0].status === 0) {
          //   SQL UPDATE PROCESS
          const sqlUpdateProcess = `UPDATE process SET paid = ?, overdue = ?  WHERE id = ?   `;
          await pool.query(sqlUpdateProcess, [
            paidProcess,
            overdueProcess,
            process_id,
          ]);
        }

        //   SQL UPDATE PROCESS_USER
        const sqlUpdate = `UPDATE process_user SET paid = ?, overdue = ?  WHERE id = ?   `;
        const [resultSqlUpdate] = await pool.query(sqlUpdate, [
          paidTotal,
          overdueTotal,
          process_user_id,
        ]);
        if (resultSqlUpdate) {
          res.status(200).json({ message: "ทำรายการสำเร็จ" });
        }
      } else {
        throw new Error("ไม่สามารถทำรายการได้ ");
      }
    } else {
      throw new Error("นอก");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json(error.message);
  }
};

// reload

export const putreLoad = async (req, res) => {
  try {
    const { process_user_id, process_id, price, count_day } = req.body;

    const sqlCheckProcessUserList = `SELECT  id, date, price FROM process_user_list WHERE process_user_id = ? AND status = ? ORDER BY date ASC  `;

    const [resultCheckProcessUserList] = await pool.query(
      sqlCheckProcessUserList,
      [process_user_id, 1]
    );

    // จำนวนวันที่ยังไม่จ่าย จำนวนคงเหลืออีก xx งวด
    const countSQl = resultCheckProcessUserList.length;

    if (countSQl >= 6) {
      // หาค่าใช้ จ่ายต่องวด
      const sumForPay = (price / 1000) * 50;

      // หายอดที่ยัง จ่ายไม่ครบ
      const sumNoForPayCount = sumForPay * countSQl;
      const sumNoForPay = price - sumNoForPayCount;

      // หายอดที่จ่ายแล้ว
      let paySum = 0;
      for (const item of resultCheckProcessUserList) {
        paySum += item.price;
      }

      // หาจำนวนเงินที่จ่ายเกิน ระหว่างงวดที่ กดรียอด (คืนให้ลูกค้า)
      const newPaySum = paySum - sumNoForPayCount;

      // คำนวณการยืมใหม่ *******************************************************************

      // ต้องการยืมใหม่ xxx - ยอดที่เหลือ
      const newSumCount = price - sumNoForPay;

      // สูตรใหม่ *******
      // ( งวดที่จ่ายมาแล้ว - 6 = xxx ) * (ราคาต่องวด = เงินที่จะได้)   //  (12 - 6 ) * (250) = 1500
      const calculate = (countSQl - 6) * sumForPay;

      // console.log(`จำนวนหักสุทธิ = ` , calculate);
      // console.log(`จำนวนเงินที่จ่ายเกิน = ` , newPaySum);

      // UPDATE SQL ***********************************************************************
      const sqlSelect = `SELECT id FROM process_user_list WHERE process_user_id = ? `;
      const [resultSqlSelect] = await pool.query(sqlSelect, [process_user_id]);

      // หาวันที่ล่าสุด
      let latestDate = null;

      for (let i = 0; i < resultCheckProcessUserList.length; i++) {
        const data = resultCheckProcessUserList[i];
        if (
          data.date &&
          (!latestDate || moment(data.date).isAfter(latestDate))
        ) {
          latestDate = moment(data.date);
        }
      }

      if (latestDate) {
        latestDate = latestDate.format("YYYY-MM-DD");
      }

      // UPDATE process_user_list
      const sqlUpdateProcessUserList = `UPDATE process_user_list SET date = ?, status = ? , price = ? WHERE id = ? `;

      for (let i = 0; i < resultSqlSelect.length; i++) {
        const data = resultSqlSelect[i];

        await pool.query(sqlUpdateProcessUserList, [
          i === 0 ? latestDate : null,
          i === 0 ? 1 : 0,
          i === 0 ? sumForPay : null,
          data.id,
        ]);
      }

      // UPDATE ยอดรวม ต่าง ๆ **********************************************

      //   CHECK TOTAL PROCESS
      const sqlCheckProcess = `SELECT total, paid, overdue FROM process WHERE id = ? LIMIT 3  `;
      const [resultCheckProcess] = await pool.query(sqlCheckProcess, [
        process_id,
      ]);

      //   CHECK TOTAL PROCESS_USER
      const sqlCheck = `SELECT paid, overdue, total FROM process_user WHERE id = ? LIMIT 3  `;
      const [resultCheck] = await pool.query(sqlCheck, [process_user_id]);

      const paidTotal = sumForPay;
      const overdueTotal =
        Number(resultCheck[0].overdue) +
        Number(resultCheck[0].paid) -
        sumForPay;

      const paidProcess = resultCheckProcess[0].paid - paySum + sumForPay;
      const overdueProcess =
        Number(resultCheckProcess[0].overdue + paySum) - sumForPay;

      console.log(`paidProcess = `, paidProcess);
      console.log(`resultCheckProcess = `, overdueProcess);

      // SQL UPDATE PROCESS_USER
      const sqlUpdate = `UPDATE process_user SET paid = ?, overdue = ?  WHERE id = ?   `;
      await pool.query(sqlUpdate, [paidTotal, overdueTotal, process_user_id]);

      //SQL UPDATE PROCESS
      const sqlUpdateProcess = `UPDATE process SET paid = ?, overdue = ?  WHERE id = ?   `;
      const [resultUpdarteProcess] = await pool.query(sqlUpdateProcess, [
        paidProcess,
        overdueProcess,
        process_id,
      ]);

      if (resultUpdarteProcess) {

      res.status(200).json({
        message: "ทำรายการสำเร็จ",
        newSum: price,
        totalSum: calculate,
        qty_overpay : newPaySum || 0
      });
      }
    } else {
      throw new Error("จ่ายไม่ถึง 6 งวด ไม่สามารถทำรายการได้");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

// Update
export const UpdateProcess = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      const sql = `SELECT total, paid, overdue FROM process WHERE id = ? LIMIT 3 `;
      const [result] = await pool.query(sql, [id]);
      console.log(result[0]);
      res.status(200).json(result[0]);
    } else {
      throw new Error("ไม่พบข้อมูล");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const UpdateProcessUser = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      const sql = `SELECT id, total, paid, overdue , count_day FROM process_user WHERE id = ? LIMIT 3 `;
      const [result] = await pool.query(sql, [id]);
      const data = [];
      for (const item of result) {
        const sqlCheck = `SELECT COUNT(id) AS pay_date FROM process_user_list WHERE process_user_id = ? AND  status = ? `;
        const [resultCheck] = await pool.query(sqlCheck, [item.id, 1]);
        const newItem = { ...item, pay_date: resultCheck[0].pay_date };
        data.push(newItem);
      }
      // console.log(data[0]);

      res.status(200).json(data[0]);
    } else {
      throw new Error("ไม่พบข้อมูล");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};
