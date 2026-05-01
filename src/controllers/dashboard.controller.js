const { getDashboardData } = require("../services/dashboard.service");


const getDashboard = async(req, res, next) => {
  try {

    const period = req.query.period;

    const data = await getDashboardData(period);

    return res.status(200).json(data)
    
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getDashboard
};