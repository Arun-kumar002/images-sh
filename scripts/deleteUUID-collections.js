const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb+srv://jfl-db-user:ETVQb6c03f7RKAyj@jflcluster0.vcryi.mongodb.net/uat?retryWrites=true&w=majority'; // Replace with your MongoDB connection string
const dbName = 'uat_db';

const regexPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function deleteUuidCollections() {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName);

        const collections = await db.listCollections().toArray();

        for (const collection of collections) {
            const collectionName = collection.name;

            const hasUuidField = regexPattern.test(collectionName.split("_")[0])

            if (hasUuidField) {
                await db.collection(collectionName).drop();
                console.log(`Deleted documents with UUID fields in collection: ${collectionName}`);
            } else {
                console.log(`Skipped collection without UUID fields: ${collectionName}`);
            }
        }
    } finally {
        await client.close();
    }
}

deleteUuidCollections();
