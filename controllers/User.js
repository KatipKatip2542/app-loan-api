import  pool  from '../Connect.js';

export const getUser = async(req,res)=>{
    try {
        const [result] = await pool.query("SELECT * FROM users");
        res.json(result);
      } catch (error) {
        console.error(error);
        res.json(error);
      }
}

