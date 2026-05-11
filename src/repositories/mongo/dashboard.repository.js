const Order = require("../../models/Order.model");
const User = require("../../models/User.model");

const getOrdersSummary = async (startDate, endDate) => {
  return Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$_id",
        total: { $first: "$total" },
        units: { $sum: { $ifNull: ["$items.quantity", 0] } },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total" },
        totalOrders: { $sum: 1 },
        unitsSold: { $sum: "$units" },
      },
    },
  ]);
};

const getPreviousOrdersSummary = async (previousStartDate, startDate) => {
  return Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: previousStartDate,
          $lt: startDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total" },
      },
    },
  ]);
};

const getSalesTimeline = async ({ startDate, endDate, groupId }) => {
  return Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: groupId,
        revenue: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

const getTopProducts = async (startDate, endDate) => {
  return Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        name: { $first: "$items.title" },
        units: { $sum: "$items.quantity" },
        revenue: {
          $sum: { $multiply: ["$items.quantity", "$items.pricePaid"] },
        },
        image: { $first: { $arrayElemAt: ["$items.images", 0] } },
      },
    },
    { $sort: { units: -1, revenue: -1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 1,
        name: 1,
        units: 1,
        revenue: 1,
        image: 1,
      },
    },
  ]);
};

const getRecentOrders = async (startDate, endDate) => {
  return Order.find({ createdAt: { $gte: startDate, $lte: endDate } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name email")
    .lean();
};

const countNewUsers = async (startDate, endDate) => {
  return User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    role: { $ne: "admin" },
  });
};

module.exports = {
  getOrdersSummary,
  getPreviousOrdersSummary,
  getSalesTimeline,
  getTopProducts,
  getRecentOrders,
  countNewUsers,
};
