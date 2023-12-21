const { MongoClient } = require("mongodb");

const sourceURI = 'mongodb+srv://jfl-db-user:ETVQb6c03f7RKAyj@jflcluster0.vcryi.mongodb.net/uat_db?retryWrites=true&w=majority';
const sourceDatabase = 'uat_db';


const deleteCollection = async (collectionName) => {

    try {
        let limit = 1000
        const sourceClient = await MongoClient.connect(sourceURI);
        const db = sourceClient.db(sourceDatabase);


        let checkCollectionExist = await db.listCollections({ name: collectionName }).toArray();

        if (checkCollectionExist.length > 0) {
            let currPage = 0;
            // let totalRecords = await db.collection(collectionName).getDocumentCount();
            while (true) {

                let pipeline =
                    [
                        {
                            $limit: limit
                        }
                    ]

                const result = await db.collection(collectionName).aggregate(pipeline).toArray()

                if (!result || result.length === 0) {
                    break;
                }

                const bulk = []

                result.forEach((doc) => {
                    bulk.push({
                        deleteOne: {
                            filter: { _id: doc._id },
                        }
                    })
                })

                // console.log(bulk);
                if (bulk && bulk.length > 0) {
                    await db.collection(collectionName).bulkWrite(bulk);
                }

                currPage = currPage + 1

            }
            const collection = db.collection(collectionName)
            await collection.drop()
            console.log(`collection ${collectionName} droped successfully`)
            return
        }

        return


    } catch (error) {
        throw error
    }
}


const removeRequestIdCollections = async (arr) => {
    try {
        for (let requestId of arr) {
            await deleteCollection(`${requestId}_source`);
            await deleteCollection(`${requestId}_transformed`);
        }

        console.log('All RequestId Collection deleted ')
    } catch (error) {
        console.error(error);
    }
}

removeRequestIdCollections([
    "83f5b3fc-7d0f-4411-a016-64ff88aaad88",
    "98642aed-dd7f-4545-8064-a45d90286e56"
]).then().catch((err) => console.error(err));


