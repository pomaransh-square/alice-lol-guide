import express from 'express';
import { handle } from './yc';

const app = express();
app
    .use(express.json())
    .all('/', async (req, res) => {
        if (req.method === 'GET') return res.end('<h1>Not found 404</h1>');
        res.end(JSON.stringify(await handle(req.body)));
    });

const port = process.env.PORT || 3000;
app.listen(port, console.log.bind(null, `Server have been started on ${port}`));
