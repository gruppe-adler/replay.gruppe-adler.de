import express from 'express';
import { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';

import { wrapAsync, globalErrorHandler } from './utils';
import Replay from './models';

const REPLAY_BASE_PATH = path.join(__dirname, '../replays');

if (!fs.existsSync(REPLAY_BASE_PATH)) {
    fs.mkdirSync(REPLAY_BASE_PATH);
}

if (!fs.existsSync(`${REPLAY_BASE_PATH}/replays.json`)) {
    fs.writeFileSync(`${REPLAY_BASE_PATH}/replays.json`, JSON.stringify([]));
}

const replays: Replay[] = JSON.parse(fs.readFileSync(`${REPLAY_BASE_PATH}/replays.json`, 'utf8'));

const {
    PORT = 80,
    AUTH_TOKEN = 'MEH'
} = process.env;

const app = express();

// body parser
const bp = bodyParser.json();
app.use(bp);


app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'origin, Content-Type, Authorization');
    next();
});

// GET ALL REPLAYS
app.get('/', wrapAsync(async (req: Request, res: Response) => {
    res.status(200).json(replays);
}));

// GET SINGLE REPLAY
app.get('/:id', wrapAsync(async (req: Request, res: Response) => {
    const id: number = Number(req.params.id);

    if (isNaN(id)) return res.status(422).end();

    try {
        res.sendFile(`${REPLAY_BASE_PATH}/${id}.json`);
    } catch (err) {
        res.status(404).end();
    }
}));

// POST REPLAY
app.post('/', wrapAsync(async (req: Request, res: Response) => {
    const auth: string = req.header('Authorization') || '';

    // unauthorized
    if (auth === '') return res.status(401).end();

    const token = auth.replace(/^Bearer\s+/i, '');

    // forbidden
    if (token !== AUTH_TOKEN) return res.status(403).end();

    const lastID: number = replays.length > 0 ? replays[replays.length - 1].id : -1;
    const id: number = lastID + 1;
    const replay = { ...req.body, id } as Replay;

    // write complete replay
    fs.writeFileSync(`${REPLAY_BASE_PATH}/${id}.json`, JSON.stringify(replay));

    // add replay to list and write to fs
    delete replay.data;
    replays.push(replay);
    fs.writeFileSync(`${REPLAY_BASE_PATH}/replays.json`, JSON.stringify(replays));

    res.status(201).end();
}));

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
});
