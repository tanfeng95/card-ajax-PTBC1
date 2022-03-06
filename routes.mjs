import db from './models/index.mjs';

import initGamesController from './controllers/games.mjs';
import initUserController from './controllers/users.mjs';

export default function bindRoutes(app) {
  const GamesController = initGamesController(db);
  const UsersController = initUserController(db);
  // main page
  app.get('/', GamesController.index);
  // create a new game
  app.post('/games', GamesController.create);
  // update a game with new cards
  app.put('/games/:id/deal', GamesController.deal);

  app.post('/startGame', GamesController.startGame);
  app.get('/games/:id/refresh', GamesController.refresh);
  app.put('/games/:id/winner', GamesController.winner);
  app.post('/users/signin', UsersController.getUserById);
  app.get('/users/findall', UsersController.findAllUser);
}
