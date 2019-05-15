import { Request, Response, NextFunction, RequestHandler } from 'express';

export const wrapAsync = (fn: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Make sure to `.catch()` any errors and pass them along to the `next()`
        // middleware in the chain, in this case the error handler.
        fn(req, res, next).catch(next);
    };
};

export const globalErrorHandler = (
    err: { status: number, message?: string },
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);
    res.status(err.status || 500).end();
};
