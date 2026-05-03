
const { getDateRange, getGrouping, buildSalesTimeline } = require("../helpers/dashboard.helper");
const Order = require("../models/Order.model");
const User = require("../models/User.model");
const CustomError = require("../utils/custom-error.util");

const getDashboardData = async (period = "30d") => {
  const { endDate, previousStartDate, startDate } = getDateRange(period);

  const groupBy = getGrouping(period);
  let groupId;

  if (groupBy === "day") {
    groupId = {
      $dateToString: {
        date: "$createdAt",
        format: "%Y-%m-%d",
        timezone: "UTC",
      },
    };
  } else if (groupBy === "week") {
    groupId = {
      year: { $year: "$createdAt" },
      week: { $isoWeek: "$createdAt" },
    };
  } else if (groupBy === "month") {
    groupId = {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" },
    };
  }

  const [summary, previousSummary, sales, topProducts, recentOrders, newUsers] =
    await Promise.all([
      Order.aggregate([
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
      ]),

      Order.aggregate([
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
      ]),

      Order.aggregate([
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
      ]),

      Order.aggregate([
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
      ]),

      Order.find({ createdAt: { $gte: startDate, $lte: endDate } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .lean(),

      User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        role: { $ne: "admin" },
      }),
    ]);

  const currentSummary = summary[0] || {};
  const totalRevenue = currentSummary.totalRevenue || 0;
  const totalOrders = currentSummary.totalOrders || 0;
  const unitsSold = currentSummary.unitsSold || 0;
  const averageOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders)) : 0;
  const previousRevenue = previousSummary[0]?.totalRevenue || 0;
  const growth = previousRevenue ? Number((((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)): 0;

  return {
    summary: {
      totalRevenue,
      totalOrders,
      unitsSold,
      averageOrderValue,
      growth,
      newUsers,
    },
    sales: buildSalesTimeline(sales, startDate, endDate, groupBy),
    recentOrders: recentOrders.map((order) => ({
      id: order._id,
      customerEmail: order.user.email || null,
      customerName: order.user.name || null,
      date: order.createdAt,
      total: order.total,
    })),
    topProducts: topProducts.map((product) => ({
      id: product._id,
      name: product.name,
      units: product.units,
      revenue: product.revenue,
      image: product.image.url ?? null,
      percentage: totalRevenue
        ? Number(((product.revenue / totalRevenue) * 100).toFixed(1))
        : 0,
    })),
  };
};

module.exports = {
  getDashboardData,
};
