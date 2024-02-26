const gconfig = require("../server/config");
const db = require('../server/common/db');
const MONGO_URL = db.getDBURL();
const GenericForm = require('../server/models/GenericForm');
const mongoose = require("mongoose");
const formIoJson = require("./genericForm.json");
const { v4: uuid } = require("uuid");

/*
    outletId to find the data for perticular outlet and migrate that to latest v2 configuration
*/
const outletId = process.argv[2] || "988c62fe245a1a9c6ca55548"


/*
    server end point and api key required for form configuration . basically to load the dropdown options
*/
const serverEndPoint = process.argv[3] || "http://localhost:4000";
const apikey = process.argv[4] || "a58693abaa7c68fa422722707d6fdc2e5a7d5c851ba42808d7e71a3ba7dcbf96"

mongoose.set("strictQuery", false);
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, dbName: gconfig.config.MONGO.DB }).then((err) => {
    console.log('Connected to MongoDB: ' + gconfig.config.MONGO.DB);
    migrateForm();
});

const migrateForm = async () => {
    try {
        const genericForm = await GenericForm.find({ $or: [{ outletId: outletId }, { outletId: new mongoose.Types.ObjectId(outletId) }] });

        if (Array.isArray(genericForm) && genericForm.length > 0) {
            const newGenericForm = [];
            for (let form of genericForm) {
                let test = []
                const tables = {};
                let comp = [];
                if (Array.isArray(form.fields) && form.fields.length > 0) {
                    for (let field of form.fields) {
                        if (formIoJson.hasOwnProperty(field.type)) {
                            let payload = JSON.parse(JSON.stringify(formIoJson[field.type]));
                            payload["key"] = field.name;
                            payload["label"] = field.label;
                            payload["data"] = { values: field.choices }
                            if (field.readonly) {
                                payload["disabled"] = true
                            }

                            if (field.type == "LABEL") {
                                payload["defaultValue"] = field.label || field.name;
                            }

                            if (["LOYALTY_OUTLETS", "ROOM_TYPE", "OUTLETS"].includes(field.type)) {
                                const isExists = await GenericForm.GenericFormConfigModal.find({ formId: new mongoose.Types.ObjectId(form._id), inputKey: field.name });
                                if (isExists.length == 0) {
                                    console.log("form config created", field.name, field.type);
                                    const config = formIoJson[`${field.type}_CONFIG`];

                                    if (config?.api?.apiDataEndpoint) {
                                        config.api.apiDataEndpoint = config.api.apiDataEndpoint.replace("server_end_point", serverEndPoint);
                                        config.api.apiDataEndpoint = config.api.apiDataEndpoint.replace("api_key", apikey);
                                    }

                                    await GenericForm.GenericFormConfigModal.create({
                                        ...config,
                                        merchantId: new mongoose.Types.ObjectId(form.merchantId),
                                        outletId: new mongoose.Types.ObjectId(form.outletId),
                                        formId: new mongoose.Types.ObjectId(form._id),
                                        inputKey: field.name,
                                    })
                                }

                            }

                            if (["FormTable", "Table"].includes(field.section)) {
                                let old = tables[field.tableName] || []
                                tables[field.tableName] = [...old, payload];
                            } else {
                                const t = JSON.parse(JSON.stringify(comp));
                                t.push(payload)
                                comp = t;
                            }

                        } else {
                            console.log("Form field type not found", field.type);
                        }

                    }


                    if (Object.keys(tables).length > 0) {
                        for (let table in tables) {
                            if (Array.isArray(tables[table]) && tables[table].length > 0) {
                                comp.push({ ...formIoJson["TABLE"], label: table, key: table, components: tables[table] });
                            }
                        }
                    }

                    comp.push({ ...formIoJson["CHECKBOX"], label: "Submit Form", key: "submitForm" });
                    comp.push(formIoJson["SAVE"]);

                    // console.log("uuid", form.uuid, comp)
                    newGenericForm.push({
                        updateOne: {
                            filter: { _id: new mongoose.Types.ObjectId(form._id) },
                            update: {
                                $set: { ...form, uuid: form.uuid ? form.uuid : uuid(), components: comp }
                            }
                        }
                    })
                }
            }
            if (newGenericForm.length > 0) {
                console.log("Total forms for migration", newGenericForm.length);
                let res = await GenericForm.bulkWrite(newGenericForm);
            }
        } else {
            console.log("Generic form not found", genericForm)
        }
    }
    catch (err) {
        console.log("Error:[migrateForm]", err);
    }
}