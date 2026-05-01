const CustomError = require("../utils/custom-error.util");
const { startOfUtcDay, subtractPeriod, getDateKey, getISOWeek } = require("../utils/date.util");

const PERIODS = {
  "7d": { amount: 7, unit: "day" },
  "30d": { amount: 30, unit: "day" },
  "3m": { amount: 3, unit: "month" },
  "6m": { amount: 6, unit: "month" },
  "1y": { amount: 1, unit: "year" },
};

const PERIOD_ALIASES = {
  7: "7d",
  30: "30d",
  90: "3m",
  week: "7d",
  month: "30d",
  year: "1y",
};

// Calculate current and previous date range according to a selected period
const getDateRange = (periodParam) => {
  const periodKey = PERIOD_ALIASES[periodParam] || periodParam;
  const period = PERIODS[periodKey];

  if (!period) throw new CustomError("Periodo no válido.", 400);

  const endDate = new Date();
  let startDate;

  if (period.unit === "day") {
    startDate = startOfUtcDay(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - (period.amount - 1));
  } else {
    startDate = startOfUtcDay(subtractPeriod(endDate, period));
  }

  const previousStartDate = subtractPeriod(startDate, period);

  return {
    endDate,
    previousStartDate,
    startDate,
  };
};

// Determine the type of grouping (days, weeks, months) according to the period, for income over time
const getGrouping = (period) => {
  if (["7d", "30d"].includes(period)) return "day";
  if (["3m", "6m"].includes(period)) return "week";
  if (["1y"].includes(period)) return "month";
  return "day";
};

// Create the revenue series, filling in the missing dates according to the grouping type, and set periods without sales to 0
const buildSalesTimeline = (salesParam, startDate, endDate, groupBy) => {
  const revenueMap = new Map(
    salesParam.map((row) => [JSON.stringify(row._id), Math.round(row.revenue)]),
  );

  const sales = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    let key;
    let label;

    if (groupBy === "day") {
      const date = getDateKey(cursor);
      key = date;
      label = date;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    } else if (groupBy === "week") {
      const week = getISOWeek(cursor);
      const year = cursor.getUTCFullYear();
      key = { year, week };
      label = `${year}-W${week}`;
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    } else if (groupBy === "month") {
      const month = cursor.getUTCMonth() + 1;
      const year = cursor.getUTCFullYear();
      key = { year, month };
      label = `${year}-${month}`;
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }

    sales.push({
      date: label,
      revenue: revenueMap.get(JSON.stringify(key)) || 0,
    });
  }

  return sales;
};

module.exports = {
  getDateRange,
  getGrouping,
  buildSalesTimeline,
};
