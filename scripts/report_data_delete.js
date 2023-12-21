
const { getConnection } = require('./db');
const { ObjectId } = require('mongodb');

const reconDataDelete = async(reconId) => {
        console.log("reconDataDelete: ", reconId);
        let db = await getConnection(process.env.sourceDb)
        const recon = await db
            .collection(process.env.reconciliationCollection)
            .findOne({ _id: new ObjectId(reconId) });
        if(!recon){
                console.log("Recon not found.");
                return;
        }

        const mergeReport = await db
            .collection(process.env.reportSettingCollection)
            .findOne({ _id: recon.reportId });
        if(!mergeReport){
                console.log("Recon not found.");
                return;
        }

        await dropReportCollections(db, mergeReport._id);


        for(var i in recon.inputReports){
                let rId = recon.inputReports[i];
                await dropReportCollections(db, new ObjectId(rId));
        }

        process.exit(0);

}

const dropReportCollections = async (db, reportId) => {
        let report = await db
        .collection(process.env.reportSettingCollection)
        .findOne({ _id: reportId });
        if (!report) {
                console.log("Report[" + reportId + "] Not found.");
                return;
        }

        if(await db.listCollections({ name: report.reportName + "_source" }).hasNext()) {
                console.log("Deleting ", report.reportName + "_source");
                await db.collection(report.reportName + '_source').drop();
        }

        if (await db.listCollections({ name: report.reportName + "_cleansing" }).hasNext()) {
            console.log("Deleting ", report.reportName + "_cleansing");
            await db.collection(report.reportName + "_cleansing").drop();
        }

        if (await db.listCollections({ name: report.reportName + "_Collection" }).hasNext()) {
            console.log("Deleting ", report.reportName + "_Collection");
            await db.collection(report.reportName + "_Collection").drop();
        }

        console.log("Report Deleted: ", report.reportName);
}

console.log("Args: ", process.argv);
reconDataDelete(process.argv[2]);