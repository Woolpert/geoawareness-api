const fs = require('fs');

const getStores = async () => {
    const storesFile = fs.readFileSync('./test/example-responses/getStores.json', 'utf8');
    return JSON.parse(storesFile);
};

const getGeofencesByStore = async storeName => {
    try {
        const geofencesFile = fs.readFileSync(`./test/example-responses/getGeofencesByStoreName-${storeName.toLowerCase()}.json`, 'utf8');
        return JSON.parse(geofencesFile);
    } catch (error) {
        return 'No geofences found for ' + storeName;
    }
};

const getOrdersByStore = async storeName => {
    try {
        const ordersFile = fs.readFileSync(`./test/example-responses/getOrdersByStoreName-${storeName.toLowerCase()}.json`, 'utf8');
        return JSON.parse(ordersFile);
    } catch (error) {
        return 'No orders found for ' + storeName;
    }
};

exports.getStores = getStores;
exports.getGeofencesByStore = getGeofencesByStore;
exports.getOrdersByStore = getOrdersByStore;
