const { MongoClient } = require("mongodb");
require('dotenv').config();
const DB_URI = process.env.environment === 'production' ? process.env.prodMongoUrl : process.env.devMongoUrl
let client = undefined;
exports.getConnection = async (dbName) => {
    try {
        if (client) {
            return client.db(dbName)
        }
        console.log("Connecting to DB URI: " + DB_URI + ", DBName: " + dbName);
        client = new MongoClient(DB_URI)
        return client.db(dbName)

    } catch (error) {
        console.log(error)
    }
}
