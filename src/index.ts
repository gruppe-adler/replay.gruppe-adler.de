import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';

import { globalErrorHandler } from './utils';
import router from './router';

const app = express();

// body parser
app.use(bodyParser.json({ limit: '1gb'}));

// logger
app.use(morgan('[:date[clf]] :remote-addr - :remote-user | :method :url :req[content-length] | :status :response-time ms'));

// cors
app.use(cors({
    credentials: false,
    origin: [
        new RegExp('gruppe-adler\.de$', 'i'),
        new RegExp('localhost:[0-9]+$', 'i'),
        new RegExp('127.0.0.1:[0-9]+$', 'i'),
        new RegExp('127.0.0.1$', 'i'),
        new RegExp('localhost$', 'i')
    ]
}));

app.use('/', router);
app.use(globalErrorHandler);

const {
    PORT = '80',
} = process.env;

app.listen(PORT, () => {
    console.log(`
    server started at http://localhost:${PORT}
    `);
});
