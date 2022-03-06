import { Sequelize } from 'sequelize';
import allConfig from '../config/config.js';

import gameModel from './game.mjs';
import usersModel from './user.mjs';

const env = process.env.NODE_ENV || 'development';

const config = allConfig[env];

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

// add your model definitions to db here
db.Game = gameModel(sequelize, Sequelize.DataTypes);
db.User = usersModel(sequelize, Sequelize.DataTypes);

// in order for the many-to-many to work we must mention the join table here.
db.Game.belongsToMany(db.User, { through: 'games_users' });
db.User.belongsToMany(db.Game, { through: 'games_users' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
