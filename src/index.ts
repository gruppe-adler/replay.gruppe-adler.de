import express from 'express';
import { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';

import { wrapAsync, globalErrorHandler } from './utils';

const REPLAY_BASE_PATH = path.join(__dirname, '../replays');

if (!fs.existsSync(REPLAY_BASE_PATH)) {
    fs.mkdirSync(REPLAY_BASE_PATH);
}

if (!fs.existsSync(`${REPLAY_BASE_PATH}/replays.json`)) {
    fs.writeFileSync(`${REPLAY_BASE_PATH}/replays.json`, JSON.stringify([]));
}

let replays: Array<any> = JSON.parse(fs.readFileSync(`${REPLAY_BASE_PATH}/replays.json`, 'utf8'));

const {
    PORT = 80,
    AUTH_TOKEN = 'MEH'
} = process.env;

const app = express();

// body parser
const bp = bodyParser.json({ limit: '1gb'});
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

    const replay = replays.find(r => r.id === id);

    if (replay === null) return res.status(404).end();

    try {
        const data = JSON.parse(fs.readFileSync(`${REPLAY_BASE_PATH}/${id}.json`, 'utf8'));
        res.status(200).json({ ...replay, data });
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
    const replay = { ...req.body, id } as any;

    // write complete replay
    fs.writeFileSync(`${REPLAY_BASE_PATH}/${id}.json`, JSON.stringify(replay.data, undefined, 4));

    // add replay to list and write to fs
    delete replay.data;
    replays.push(replay);
    fs.writeFileSync(`${REPLAY_BASE_PATH}/replays.json`, JSON.stringify(replays, undefined, 4));

    res.status(201).end();
}));

app.delete('/:id', wrapAsync(async (req: Request, res: Response) => {

    const auth: string = req.header('Authorization') || '';
    if (auth === '') return res.status(401).end(); // unauthorized
    const token = auth.replace(/^Bearer\s+/i, '');
    if (token !== AUTH_TOKEN) return res.status(403).end(); // forbidden

    
    const id: number = Number(req.params.id);
    if (isNaN(id)) return res.status(422).end(); // unprocessable entity
    const replay = replays.find(r => r.id === id);
    if (!replay) return res.status(404).end(); // not found

    replays = replays.filter(r => r.id !== id);
    fs.writeFileSync(`${REPLAY_BASE_PATH}/replays.json`, JSON.stringify(replays, undefined, 4));

    fs.unlinkSync(`${REPLAY_BASE_PATH}/${id}.json`);

    res.status(200).end();
}))

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
});
