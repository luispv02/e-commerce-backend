const prisma = require("../../lib/prisma");

const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

const createUser = ({ name, email, password }) => {
  return prisma.user.create({
    data: {
      name,
      email,
      password,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
};

module.exports = {
  findUserByEmail,
  createUser,
};