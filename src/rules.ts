import { body, param } from 'express-validator';
import { authGuard, return422 } from './utils';

export default {
    get: [
        param('id').isInt({ gt: -1 }).toInt(),
        return422
    ],
    data: [
        param('id').isInt({ gt: -1 }).toInt(),
        param('offset').isInt({ gt: -1 }).toInt(),
        return422
    ],
    post: [
        authGuard,
        body('worldName').isString(),
        body('missionName').isString(),
        body('date').custom(val => !isNaN(Date.parse(val))),
        body('config.precision').isInt({ gt: 0 }),
        body('config.sendingChunkSize').isInt({ gt: 0 }),
        body('config.stepsPerTick').isInt({ gt: 0 }),
        body('config.trackShots').isBoolean(),
        body('config.trackedAI').isBoolean(),
        body('config.trackedVehicles').isBoolean(),
        body('config.trackedSides').isArray(),
        body('config.trackedSides.*').isIn(['west', 'east', 'civilian', 'independent']),
        body('data').isArray(),
        body('data.*.time').isString(),
        body('data.*.data').isArray(),
        body('data.*.data.*.color').isArray({ min: 4, max: 4 }),
        body('data.*.data.*.color.*').isFloat({ min: 0, max: 1 }),
        body('data.*.data.*.direction').isFloat(),
        body('data.*.data.*.group').isString(),
        body('data.*.data.*.icon').isString(),
        body('data.*.data.*.name').isString(),
        body('data.*.data.*.position').isArray({ min: 2, max: 3 }),
        body('data.*.data.*.position.*').isFloat(),
        return422
    ],
    delete: [
        authGuard,
        param('id').isInt({ gt: -1 }).toInt(),
        return422
    ]
};
