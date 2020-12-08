import { wrapAsync } from './utils';
import { Router, Request, Response } from 'express';
import { Replay, Frame, Record, Config } from './database';
import rules from './rules';
import { matchedData } from 'express-validator';

const router = Router();

// GET ALL REPLAYS
router.get('/', wrapAsync(async (req: Request, res: Response) => {
    res.status(200).json(await Replay.findAll());
}));

// GET SINGLE REPLAY
router.get('/:id', rules.get, wrapAsync(async (req: Request, res: Response) => {
    const { id } = matchedData(req) as { id: number };

    const replay = await Replay.findByPk(id);

    if (replay === null) return res.status(404).end();

    res.status(200).json(replay);
}));

// GET REPLAY DATA
router.get('/:id/data/:offset', rules.data, wrapAsync(async (req: Request, res: Response) => {
    const { id, offset } = matchedData(req) as { id: number, offset: number };

    const data = await Frame.findAll({ where: { replayId: id }, limit: 10, offset: offset * 10 });

    res.status(200).json(data);
}));

// POST REPLAY
router.post('/', rules.post, wrapAsync(async (req: Request, res: Response) => {
    const { data, ...replayData } = matchedData(req) as {
        worldName: string,
        missionName: string,
        date: string,
        config: {
            precision: number,
            sendingChunkSize: number,
            stepsPerTick: number,
            trackShots: boolean,
            trackedAI: boolean,
            trackedVehicles: boolean,
            trackedSides: string[]
        },
        data: Array<{
            time: string,
            data: Array<{
                color: [number, number, number, number],
                direction: number,
                group: string,
                icon: string,
                name: string,
                position: [number, number]|[number, number, number],
            }>
        }>
    };

    const replay: Replay = await Replay.create({ ...replayData, frameCount: data.length }, { include: [{ model: Config }] });

    const records = [];
    for (const item of data) {
        const frame = await Frame.create({ ...item, replayId: replay.id });

        for (const rec of item.data) {
            records.push({ ...rec, frameId: frame.id });
        }
    }

    await Record.bulkCreate(records);

    res.status(201).end();
}));

// DELETE replay
router.delete('/:id', rules.delete, wrapAsync(async (req: Request, res: Response) => {
    const { id } = matchedData(req) as { id: number };

    await Replay.destroy({ where: { id } });

    res.status(200).end();
}));

export default router;
