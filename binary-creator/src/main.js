import express from 'express';
import cors from 'cors';
import queue from 'express-queue';
import { createMapImage } from './services/map-image.js';
import { getResource } from './services/cache.js';
import log from './utils/logger.js';

const app = express();
const port = 5003;

app.use(express.json({ limit: '10mb' }));
app.use(cors());

const queueMw = queue({ activeLimit: 5, queuedLimit: -1 });
app.use(queueMw);

app.post('/binary/create/map-image', async (req, res) => {
    try {
        const { data, error } = await createMapImage(req.body);

        if (error !== null) {
            log.error(error);
            res.status(500).send('Internal server error');
            return;
        }

        const img = Buffer.from(data, 'base64');

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        });

        res.end(img);
    } catch (error) {
        log.error(error.message);
        res.status(500).send('Internal server error');
    }
});

app.get('/binary/cache', async (req, res) => {
    try {
        const { resource, status } = await getResource(req.query.url);

        if (resource === null) {
            res.status(status.code).send(status.text);
            return;
        }

        res.writeHead(200, {
            'Content-Type': resource.contentType,
            'Content-Length': resource.data.length
        });

        res.end(resource.data);
    } catch (error) {
        log.error(error.message);
        res.status(500).send('Internal server error');
    }
});

app.listen(port, () => {
    console.log(`The application is running and listening on port ${port}`)
});