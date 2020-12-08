import path from 'path';
import fs from 'fs';
import { Sequelize } from 'sequelize-typescript';
import { Replay } from './models/Replay';
import { Frame } from './models/Frame';
import { Record } from './models/Record';
import { Config } from './models/Config';

const REPLAY_BASE_PATH = path.join(__dirname, '../replays');

if (!fs.existsSync(REPLAY_BASE_PATH)) {
    fs.mkdirSync(REPLAY_BASE_PATH);
}

const sequelize =  new Sequelize({
    dialect: 'sqlite',
    logging: false,
    define: {
        timestamps: false
    },
    storage: `${REPLAY_BASE_PATH}/replays.sqlite`
});

sequelize.addModels([ Replay, Frame, Record, Config ]);
sequelize.sync();

export { sequelize, Replay, Frame, Record, Config };