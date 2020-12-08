import { Router } from "express";
import { authGuard, wrapAsync } from "./utils";
import { Request, Response } from 'express';
import { Replay, Frame, Record, Config } from './database'

const router = Router();

// GET ALL REPLAYS
router.get('/', wrapAsync(async (req: Request, res: Response) => {
    res.status(200).json(await Replay.findAll());
}));

// GET SINGLE REPLAY
router.get('/:id', wrapAsync(async (req: Request, res: Response) => {
    const id: number = Number(req.params.id);

    if (isNaN(id)) return res.status(422).end();

    const replay = await Replay.findByPk(id);

    if (replay === null) return res.status(404).end();

    res.status(200).json(replay);
}));

// GET REPLAY DATA
router.get('/:id/data/:offset', wrapAsync(async (req: Request, res: Response) => {
    const id: number = Number(req.params.id);
    const offset: number = Number(req.params.offset);

    if (isNaN(id) || isNaN(offset)) return res.status(422).end();

    const data = await Frame.findAll({ where: { replayId: id }, limit: 10, offset: offset*10 });

    res.status(200).json(data);
}));

// POST REPLAY
router.post('/', [authGuard], wrapAsync(async (req: Request, res: Response) => {

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

// DELETE replay
router.delete('/:id', [authGuard], wrapAsync(async (req: Request, res: Response) => {
    
    const id: number = Number(req.params.id);
    if (isNaN(id)) return res.status(422).end(); // unprocessable entity
    
    await Replay.destroy({ where: { id }});

    res.status(200).end();
}));

export default router;