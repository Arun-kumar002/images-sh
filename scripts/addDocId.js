const { MongoClient, ObjectId } = require("mongodb");

const sourceURI = 'mongodb+srv://arun_dbuser:x3oBXS2pbRa0dj2W@devcluster1.wpupi.mongodb.net/uat_backup_latest?retryWrites=true&w=majority';
const sourceDatabase = 'uat_backup_latest';


const createLeftAndRightId = async () => {
    try {
        console.log('im here')
        const sourceClient = await MongoClient.connect(sourceURI);
        const db = sourceClient.db(sourceDatabase);
        let currPage = 0;
        let limit = 1000;
        while (true) {
            console.log('Im currentPage', currPage * limit)
            let pipeline =
                [
                    {
                        $lookup: {
                            from: "Swiggy_Collection",
                            localField: "swiggyRef",
                            foreignField: "swiggyRef",
                            as: "result"
                        }

                    },
                    {
                        $skip: currPage * limit
                    },
                    {
                        $limit: limit
                    }
                ]

            console.log(`await db.collection("OLO_vs_Swiggy_transformed").aggregate(${JSON.stringify(pipeline)})`)
            const result = await db.collection("OLO_vs_Swiggy_transformed").aggregate(pipeline).toArray()
a
            if (!result || result.length === 0) {
                break;
            }

            const bulk = []

            result.forEach((doc) => {
                let updateObj = {};

                if (doc.result && doc.result.length > 0) {
                    updateObj['rightId'] = new ObjectId(doc.result?.[0]?._id)

                    bulk.push({
                        updateOne: {
                            filter: { _id: new ObjectId(doc._id) },
                            update: {
                                $set: updateObj
                            }
                        }
                    })
                }

            })

            console.log(JSON.stringify(bulk[0]));
            if (bulk && bulk.length > 0) {
                const result = await db.collection("OLO_vs_Swiggy_transformed").bulkWrite(bulk);

                let matchedCount = result['matchedCount']
                let insertedCount = result['insertedCount']
                let upsertedCount = result['upsertedCount']
                let modifiedCount = result['modifiedCount']

                console.log(`Bulk Process of : ${bulk.length} updated:${modifiedCount, matchedCount}, upserted:${upsertedCount} , inserted: ${insertedCount}`);

            }


            currPage = currPage + 1

        }
        console.log('Update Finished');
        return
    } catch (error) {
        console.log('Error', error)
    }
}

createLeftAndRightId().then().catch((error) => console.log(error))