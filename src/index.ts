import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';

import { globalErrorHandler } from './utils';
import router from './router';

const app = express();

// body parser
app.use(bodyParser.json({ limit: '1gb' }));

// logger
app.use(morgan('[:date[clf]] :remote-addr - :remote-user | :method :url :req[content-length] | :status :response-time ms'));

// cors
app.use(cors({
    credentials: false,
    origin: [
        /^https?:\/\/(.+\.)?gruppe-adler\.de$/i,
        /^https?:\/\/localhost:[0-9]+$/i,
        /^https?:\/\/127.0.0.1:[0-9]+$/i,
        /^https?:\/\/127.0.0.1$/i,
        /^https?:\/\/localhost$/i
    ]
}));

app.get('/robots.txt', (req, res) => {
    res.status(200);
    res.header('Content-Type', 'text/plain');
    res.status(200).send('User-agent: *\nDisallow: /');
});

app.use('/', router);
app.use(globalErrorHandler);

const {
    PORT = '80'
} = process.env;

app.listen(PORT, () => {
    console.log(`
    server started at http://localhost:${PORT}
    `);
});
