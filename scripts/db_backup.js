const { MongoClient } = require('mongodb');



async function copyDatabase(sourceURI, destinationURI, sourceDatabase, destinationDatabase) {
    // Connect to the source cluster
    const sourceClient = await MongoClient.connect(sourceURI);
    const sourceDB = sourceClient.db(sourceDatabase);



    // Connect to the destination cluster
    const destinationClient = await MongoClient.connect(destinationURI);
    const destinationDB = destinationClient.db(destinationDatabase);



    // Get a list of all collections in the source database
    const collectionNames = await sourceDB.listCollections().toArray();


    let limit = 1000
    // Copy each collection from the source database to the destination database
    for (const collectionInfo of collectionNames) {
        let currentPage = 0
        while (true) {


            let pipeline =
                [
                    {
                        $skip: currentPage * limit
                    },
                    {
                        $limit: limit
                    },
                 
                ]
            const collectionName = collectionInfo.name;

            const data = await sourceDB.collection(collectionName).aggregate(pipeline).toArray()


            if (!data || data.length === 0) {
                break;
            }


            // break
            currentPage = currentPage + 1


            const destinationCollection = destinationDB.collection(collectionName);

            console.log('Inserting data to destination collection======>', collectionName)
            // Insert the documents into the destination collection
            await destinationCollection.insertMany(data);
        }

    }



    // Close the database connections
    sourceClient.close();
    destinationClient.close();



    console.log('Database copy completed.');
}



// Usage example
const sourceURI = 'mongodb+srv://jfl-db-user:ETVQb6c03f7RKAyj@jflcluster0.vcryi.mongodb.net/uat?retryWrites=true&w=majority';
const destinationURI = 'mongodb+srv://arun_dbuser:x3oBXS2pbRa0dj2W@devcluster1.wpupi.mongodb.net/uat_backup?retryWrites=true&w=majority';
const sourceDatabase = 'uat';
const destinationDatabase = 'uat_backup_latest';



copyDatabase(sourceURI, destinationURI, sourceDatabase, destinationDatabase)
    .catch((error) => console.error(error));
