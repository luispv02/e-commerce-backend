const dbProvider = process.env.DB_PROVIDER || 'mongo';

const providers = {
  mongo: require('./mongo'),
  postgres: require('./postgres'),
};

module.exports = providers[dbProvider];