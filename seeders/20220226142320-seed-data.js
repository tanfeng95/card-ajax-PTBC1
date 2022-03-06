module.exports = {
  up: async (queryInterface, Sequelize) => {
    const userData = [
      {
        email: 'zaver1',
        password: 'zaver1',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'zaver2',
        password: 'zaver2',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'zaver',
        password: 'zaver',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'zaver3',
        password: 'zaver3',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    await queryInterface.bulkInsert('users', userData);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
