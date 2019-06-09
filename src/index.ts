import express from 'express';
import { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { Sequelize } from 'sequelize-typescript';

import { wrapAsync, globalErrorHandler, authGuard } from './utils';
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
    storage: `${REPLAY_BASE_PATH}/replays.sqlite`
});

sequelize.addModels([ Replay, Frame, Record, Config ]);
sequelize.sync({ force: true });

const {
    PORT = 80,
    AUTH_TOKEN = 'MEH'
} = process.env;

const app = express();

// body parser
const bp = bodyParser.json({ limit: '1gb'});
app.use(bp);

// logger
app.use(morgan('[:date[clf]] :remote-addr - :remote-user | :method :url :req[content-length] | :status :response-time ms'));

app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'origin, Content-Type, Authorization');
    next();
});

// GET ALL REPLAYS
app.get('/', wrapAsync(async (req: Request, res: Response) => {
    res.status(200).json(await Replay.findAll());
}));

// GET SINGLE REPLAY
app.get('/:id', wrapAsync(async (req: Request, res: Response) => {
    const id: number = Number(req.params.id);

    if (isNaN(id)) return res.status(422).end();

    const replay = await Replay.findByPk(id);

    if (replay === null) return res.status(404).end();

    res.status(200).json(replay);
}));

// GET REPLAY DATA
app.get('/:id/data/:offset', wrapAsync(async (req: Request, res: Response) => {
    const id: number = Number(req.params.id);
    const offset: number = Number(req.params.offset);

    if (isNaN(id) || isNaN(offset)) return res.status(422).end();

    const data = await Frame.findAll({ where: { replayId: id }, limit: 10, offset: offset*10 });

    res.status(200).json(data);
}));

// POST REPLAY
app.post('/', [authGuard], wrapAsync(async (req: Request, res: Response) => {

    const body = req.body as { 
        missionName: string,
        date: string,
        duration: number,
        worldName: string,
        config: object,
        data: Array<{ time: string, data: object }>
    };
   
    const replay: Replay = await Replay.create({ ...body, frameCount: body.data.length }, { include: [ { model: Config } ] });

    const records = [];

    for (const item of body.data) {
        const frame = await Frame.create({ ...item, replayId: replay.id });

        for (const rec of item.data as any[]) {
            records.push({ ...rec, frameId: frame.id });
        }
    }

    res.status(201).end();

    await Record.bulkCreate(records);

}));

app.delete('/:id', [authGuard], wrapAsync(async (req: Request, res: Response) => {
    
    const id: number = Number(req.params.id);
    if (isNaN(id)) return res.status(422).end(); // unprocessable entity
    
    await Replay.destroy({ where: { id }});

    res.status(200).end();
}))

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
});
