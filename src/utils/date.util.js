
// Returns a date in UTC adjusted to the start of the day (00:00:00)
const startOfUtcDay = (date) => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

// Subtract an amount of time (days, months, years) from a date
const subtractPeriod = (date, period) => {
  const result = new Date(date);

  if (period.unit === "day") {
    result.setUTCDate(result.getUTCDate() - period.amount);
  }

  if (period.unit === "month") {
    result.setUTCMonth(result.getUTCMonth() - period.amount);
  }

  if (period.unit === "year") {
    result.setUTCFullYear(result.getUTCFullYear() - period.amount);
  }

  return result;
};

// returns the date in "YYYY-MM-DD" format
const getDateKey = (date) => {
  return date.toISOString().slice(0, 10)
};

// Calculate the ISO(1-52/53) week number of a date in UTC
const getISOWeek = (date) => {
  const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));

  return Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
};

module.exports = {
  startOfUtcDay,
  subtractPeriod,
  getDateKey,
  getISOWeek
}