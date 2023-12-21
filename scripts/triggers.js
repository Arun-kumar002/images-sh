
const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ accessKeyId: "AKIASPKX72U5JKRRQTI6", secretAccessKey: "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", region: "ap-south-1" });
const { MongoClient, ObjectId } = require("mongodb");

const sourceURI = 'mongodb+srv://jfl-db-user:ETVQb6c03f7RKAyj@jflcluster0.vcryi.mongodb.net/uat_db?retryWrites=true&w=majority';
const sourceDatabase = 'uat_db';

const trigger = async (reportId) => {
    try {


        const sourceClient = await MongoClient.connect(sourceURI);
        const db = sourceClient.db(sourceDatabase);


        const report = await db.collection('ReportSettings').findOne({ _id: new ObjectId(reportId) });

        //console.log(report)

        if (report === null) {
            throw new Error('report not found')
        }

        let isReportLog = await db.collection('Logs').find({ reportId: new ObjectId(reportId) }).toArray();

        // //console.log(isReportLog)

        if (isReportLog.length == 0) {
            throw new Error(`Report Logs not found-${reportId}`)
        }


        let requestId = []

        for (let x of isReportLog) {
            requestId.push(x.requestId);
        }

        //console.log(requestId)
        if (Array.isArray(requestId) && requestId.length > 0) {
            for (let req of requestId) {

                //console.log(req);
                if (!req) {
                    continue;
                }
                if (!reportId && !isValidId(reportId)) {
                    throw new Error('mongo id is required & valid')
                }

                const queueParams = {
                    MessageBody: JSON.stringify({ longQueue: true, reportId, requestId: req, userEmail: "arun@gmail.com", userId: "", reset: true }),
                    QueueUrl: "https://sqs.ap-south-1.amazonaws.com/170372617530/longCleansingQueue",
                };

                console.log('queueParams', queueParams);

                await sqs.sendMessage(queueParams).promise();

                console.log('Cleansing Triggered Successfully')

            }
        }


        console.log("================================all Cleansing Operation Triggered================================")
    } catch (error) {
        console.log(error);
    }
}
trigger("64e5b529e2af8b49ed0ef4e4").then((c) => console.log('done')).catch((error) => console.log(error));



// const sequelize = new Sequelize({
//     dialectOptions: {
//       dateStrings: true,
//       typeCast: true,
//     },
//     timezone: '+00:00',
//     dialect: 'postgres',
//     define: {
//       timestamps: true,
//       freezeTableName: true,
//     },
//     dialectOptions: {
//       dateformat: 'DD-MM-YYYY',
//     },
//   });
