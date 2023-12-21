
const { getConnection } = require('./db');
const { ObjectId } = require('mongodb');

const copyCleansingOps = async(sourceId, destId) => {
        console.log("copyCleansingOps: ", sourceId);
        let db = await getConnection(process.env.sourceDb)
        const mappings = await db
            .collection("CleansingOperations")
            .find({ reportId: new ObjectId(sourceId) })
            .toArray();
        if (!mappings || mappings.length === 0) {
            console.log("Column mappings not found.");
            return;
        }

        console.log("Found: ", mappings)

        for(var i in mappings){
                let mapping = mappings[i];
                console.log("Inserting ", mapping);
                delete mapping._id;
                mapping.reportId = new ObjectId(destId);
                // let newMapping = {
                //         "reportId": new ObjectId(destId),
                //         "order" : mapping.order? mapping.order : 1,
                //         "key" : mapping.key,
                //         "value" : mapping.value,
                //         "dataType" : mapping.dataType,
                //         "format" : mapping.format,
                //         "filter" : mapping.filter,
                //         "unique" : mapping.unique,
                //         "label" : mapping.label,
                //         "visible" : mapping.visible,
                //         "createdAt" : new Date(),
                //         "updatedAt" : new Date()
                // };
                await db.collection("CleansingOperations").insertOne(mapping);
        }

        process.exit(0);

}

console.log("Args: ", process.argv);
copyCleansingOps(process.argv[2], process.argv[3]);