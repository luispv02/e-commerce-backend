const dbProvider = process.env.DB_PROVIDER || 'mongo';

module.exports = require(`./${dbProvider}`);
