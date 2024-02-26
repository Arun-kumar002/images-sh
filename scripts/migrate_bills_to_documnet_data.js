const gconfig = require("../server/config");
const db = require('../server/common/db');
const MONGO_URL = db.getDBURL();
const GenericForm = require('../server/models/GenericForm');
const Bills = require('../server/models/Bill');
const SubmittedBills = require('../server/models/SubmittedBill');
const DocumentData = require('../server/models/DocumentData');

const mongoose = require("mongoose");

const { v4: uuid } = require("uuid");

/*
    outletId to find the bills for perticular outlet and migrate that bills to documentData
*/
const outletId = process.argv[2] || "988c62fe245a1a9c6ca55548"
const isBill = process.argv[3];


mongoose.set("strictQuery", false);
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, dbName: gconfig.config.MONGO.DB }).then((err) => {
    console.log('Connected to MongoDB: ' + gconfig.config.MONGO.DB);
    migrateBills();
});

const migrateBills = async () => {
    try {


        let bills = [];

        if (isBill) {
            bills = await Bills.find({ $and: [{ outletId: outletId }, { outletId: new mongoose.Types.ObjectId(outletId) }, { formId: { $exists: true } }, { uuid: { $exists: true } }] });
        } else {
            bills = await SubmittedBills.find({ $and: [{ outletId: outletId }, { outletId: new mongoose.Types.ObjectId(outletId) }, { formId: { $exists: true } }, { uuid: { $exists: true } }] });
        }

        if (Array.isArray(bills) && bills.length > 0) {
            console.log("Total bills found > > > > > ", bills.length);

            const formIds = [];

            bills.map((v) => { formIds.push(new mongoose.Types.ObjectId(v.formId)) });

            const genericForm = await GenericForm.find({ _id: { $in: formIds } });

            let tables = {};

            if (Array.isArray(genericForm) && genericForm.length > 0) {
                for (let form of genericForm) {
                    if (Array.isArray(form.fields) && form.fields.length > 0) {
                        for (let field of form.fields) {
                            if (["FormTable", "Table"].includes(field.section)) {
                                let previous = tables[field.tableName] || []
                                tables[field.tableName] = [...previous, field.name];
                            }
                        }
                    }
                }
            }


            const newbills = [];
            for (let bill of bills) {
                let newBillObj = {}
                if (bill.form && bill.form.hasOwnProperty("headerFields")) {
                    newBillObj = { ...newBillObj, ...bill.form.headerFields }
                }

                if (bill.form && bill.form.hasOwnProperty("tables") && bill?.form?.tables?.length > 0) {
                    if (Object.keys(tables).length == 0) {
                        console.error("Table config not found");
                    }
                    for (let value of bill?.form?.tables) {
                        let newTableValue = [];
                        if (value.tableValues && value.tableValues.length > 0) {
                            value.tableValues.map((v) => {
                                let obj = {}
                                v.map((tv, ti) => {
                                    obj[tables[value.name][ti]] = tv;
                                })
                                newTableValue.push(obj);
                            })
                        }
                        newBillObj = { ...newBillObj, [value.name]: newTableValue }
                    }
                }

                const update = {
                    data: { form: newBillObj },
                    docId: bill.uuid
                }

                if (mongoose.Types.ObjectId.isValid(bill.merchantId)) {
                    update['merchantId'] = new mongoose.Types.ObjectId(bill.merchantId)
                }
                if (mongoose.Types.ObjectId.isValid(bill.outletId)) {
                    update['outletId'] = new mongoose.Types.ObjectId(bill.outletId)
                }

                newbills.push({
                    updateOne: {
                        filter: { docId: bill.uuid },
                        update: {
                            $set: update
                        },
                        upsert: true
                    }
                })


            }

            if (newbills.length > 0) {
                console.log("Total bills for migration for document data > > > > ", newbills.length);
                let res = await DocumentData.bulkWrite(newbills);
                console.log(res);
            }
        } else {
            console.error("bills not found",)
        }
    }
    catch (err) {
        console.error("Error:[migrateBillsToDocumentData]", err);
    }
}