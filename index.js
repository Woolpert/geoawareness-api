const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const repository = require('./src/repository');
const ingestPublisher = require('./src/publisher');

const { ErrorReporting } = require('@google-cloud/error-reporting');
const errors = new ErrorReporting({ reportMode: 'always' });
const wrap = fn => (...args) => fn(...args).catch(args[2]);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('REST API listening on port ', port);
});

app.get('/', wrap(async (req, res) => {
    res.send('Welcome to GeoAwareness REST API');
}));

app.get('/stores', wrap(async (req, res) => {
    try {
        const stores = await repository.getStores();
        res.json(stores);
    } catch (error) {
        next(error);
    }
}));

app.get('/geofences', wrap(async (req, res) => {
    try {
        const storeName = req.query.storeName;
        if (!storeName) {
            throw ('Store name is required.');
        }
        const geofences = await repository.getGeofencesByStore(storeName);
        res.json(geofences);
    } catch (error) {
        next(error);
    }
}));

app.get('/orders', wrap(async (req, res, next) => {
    try {
        const storeName = req.query.storeName;
        if (!storeName) {
            throw ('Store name is required.');
        }
        const status = req.query.status;
        const orders = await repository.getOrdersByStore(storeName, status);
        res.json(orders);
    } catch (error) {
        next(error);
    }
}));

app.patch('/orders/:orderId', wrap(async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        if (!orderId) {
            throw ('Order ID is required.');
        }
        let patch = req.body;

        const storeName = patch.storeName;
        if (!storeName) {
            throw ('Store name not found in request body.');
        }

        let orderOriginal = await repository.getOrder(orderId, storeName);
        if (!orderOriginal) {
            throw (`Order ${orderId} not found for store ${storeName}.`);
        }
        const order = {
            orderId: orderId,
            ...orderOriginal,
            ...patch
        }

        await repository.saveOrder(order);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}));

app.post('/events', wrap(async (req, res, next) => {
    try {
        const evt = req.body;
        console.log('event: ', evt);
        ingestPublisher.publishMessage(evt);
        res.status(201).send();
    } catch (error) {
        next(error);
    }
}));

function errorHandler(err, req, res, next) {
    errors.report(err);
    if (res.headersSent) {
        return next(err)
    }
    res.status(500);
    res.json({ error: err });
}
app.use(errorHandler);
app.use(errors.express);