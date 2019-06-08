import { Request, Response, NextFunction, RequestHandler } from 'express';

const {
    AUTH_TOKEN = 'MEH'
} = process.env;

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

export const authGuard = (req: Request, res: Response, next: NextFunction)  => {
    
    const auth: string = req.header('Authorization') || '';
    if (auth === '') return res.status(401).end(); // unauthorized
    
    const token = auth.replace(/^Bearer\s+/i, '');
    if (token !== AUTH_TOKEN) return res.status(403).end(); // forbidden

    next();
};
