export default function initUserController(db) {
  const getUserById = async (request, response) => {
    try {
      console.log('sadasdasds');
      console.log(request.body.username);
      console.log(request.body.password);

      const getUser = await db.User.findAll(
        {
          where: {
            email: request.body.username,
          },
        },
      );
      console.log(getUser);
      if (getUser.length === 0) {
        response.send(false);
      }

      // console.log(getUser[0]);
      const { dataValues } = getUser[0];
      console.log(dataValues.email);
      if (dataValues.email === dataValues.password) {
        response.send({ getUser });
      } else {
        response.send(false);
      }

      // response.send({ getUser });
    } catch (error) {
      console.log(error);
    }
  };
  const findAllUser = async (request, response) => {
    try {
      const findAll = await db.User.findAll();
      console.log(findAll);
      response.send({ findAll });
    } catch (ex) {
      console.log(ex);
    }
  };

  return {
    getUserById,
    findAllUser,
  };
}
