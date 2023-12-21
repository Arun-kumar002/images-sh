const { MongoClient, ObjectId } = require("mongodb");
const { Sequelize, DataTypes, Model, UUID } = require('sequelize')

const options = {
    host: '172.19.0.2',
    port: '5432',
    database: 'user_service',
    dialect: 'postgres',
    username: 'root',
    password: 'root'
};

const postgress = {
    option: options,
    client: null
}

const connectDb = async () => {
    try {
        const db = new Sequelize(postgress.option)
        await db.authenticate()
        console.log('connection established successfully');
        return db
    } catch (error) {
        console.log('unable to connect', error);
    }
}

connectDb().then(() => { console.log(`DB Connected Successfully`) })




const sequelize = new Sequelize(options);



const dropOrTruncateTable = async ({ collectionName, truncate = false }) => {
    try {
        const tableModel = sequelize.define(collectionName, {});

        if (truncate) {
            await tableModel.destroy({ truncate: true });
            console.log(`Table "${collectionName}" truncated.`);
        } else {
            await tableModel.drop();
            console.log(`Table "${collectionName}" dropped.`);
        }

    } catch (error) {
        console.log('[dropOrTruncateTable] SQL', error);
    }
}

const tableExists = async ({ collectionName }) => {
    try {
        const tableNames = await sequelize.getQueryInterface().showAllTables();
        return tableNames.includes(collectionName);
    } catch (error) {
        console.log('[tableExists] SQL', error);
    }
}

const createTableIfNotExists = async ({ collectionName, attributes }) => {
    try {
        let res = await sequelize.getQueryInterface().createTable(collectionName, attributes, { logging: false });
        console.log('Table Created Successfully', res);
    } catch (error) {
        console.log('[createTableIfNotExists]', error);
    }
}


const createAttribute = ({ mappings, isHash = false }) => {
    try {
        let attributes = {
            _id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                primaryKey: true,
                autoIncrement: true
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW
            },
            rightId: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
            },
            LEFT_SIDE_REPORT_PRESENT: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: null
            },
            RIGHT_SIDE_REPORT_PRESENT: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: null
            },
            reconciled: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: null
            },
            discrepancy: {
                type: DataTypes.STRING(4000),
                allowNull: true,
                defaultValue: null
            },
            variance: {
                allowNull: true,
                defaultValue: null,
                type: DataTypes.FLOAT(100, 2),

            },
            absVariance: {
                allowNull: true,
                defaultValue: null,
                type: DataTypes.FLOAT(100, 2),

            }
        }


        if (isHash) {
            attributes['hash'] = {
                type: DataTypes.STRING(4000),
                allowNull: true,
                primaryKey: true,
            }
        }

        if (mappings && Array.isArray(mappings) && mappings.length > 0) {
            for (let x of mappings) {

                if (x.dataType.toLocaleLowerCase() === 'string') {
                    attributes[x.value] = {
                        allowNull: true,
                        defaultValue: null,
                        type: DataTypes.STRING(4000)
                    }
                }

                if (x.dataType.toLocaleLowerCase() === 'float') {
                    attributes[x.value] = {
                        allowNull: true,
                        defaultValue: null,
                        type: DataTypes.FLOAT(100, 2)

                    }
                }

                if (x.dataType.toLocaleLowerCase() === 'number') {
                    attributes[x.value] = {
                        type: DataTypes.INTEGER,
                        allowNull: true,
                        defaultValue: null,
                        length: 100
                    }
                }

                if (x.dataType.toLocaleLowerCase() === 'date') {
                    attributes[x.value] = {
                        type: DataTypes.DATE,
                        allowNull: true,
                        defaultValue: DataTypes.NOW
                    }
                }
            }
        };


        return attributes;
    } catch (error) {
        console.log('[createAttribute]', error)
    }
}

const sourceURI = 'mongodb+srv://jfl-db-user:ETVQb6c03f7RKAyj@jflcluster0.vcryi.mongodb.net/uat?retryWrites=true&w=majority';
const sourceDatabase = 'uat';


const mongoToSql = async (reportId) => {
    try {
        const sourceClient = await MongoClient.connect(sourceURI);
        const db = sourceClient.db(sourceDatabase);

        const report = await db.collection('ReportSettings').findOne({ _id: new ObjectId(reportId) });
        const mappings = await db.collection('ColumnMappings').find({ reportId: new ObjectId(reportId) }).toArray();

        console.log(mappings.length, report)

        let collectionName = report.transform.targetCollectionName;

        // const model = await createModel(`${collectionName.toLowerCase()}_test_${Date.now()}`, mapping);


        let currPage = 0;
        let limit = 5000;

        const attributes = createAttribute({ mappings });

        let isExists = await tableExists({ collectionName: collectionName.toLowerCase() });

        console.log("Table Exists", isExists)
        if (!isExists) {
            await createTableIfNotExists({ collectionName: collectionName.toLowerCase(), attributes })
        }


        const model = sequelize.define(
            collectionName.toLowerCase(),
            attributes,
            {
                tableName: collectionName.toLowerCase()
            }
        );


        while (true) {
            console.log('Im currentPage', currPage * limit)

            let pipeline =
                [
                    // {
                    //     $lookup: {
                    //         from: "OLO_Collection",
                    //         localField: "leftId",
                    //         foreignField: "_id",
                    //         as: "OLO_Collection"
                    //     }

                    // },
                    // {
                    //     $lookup: {
                    //         from: "Swiggy_Collection",
                    //         localField: "rightId",
                    //         foreignField: "_id",
                    //         as: "Swiggy_Collection"
                    //     }

                    // },
                    {
                        $skip: currPage * limit
                    },
                    {
                        $limit: limit
                    },
                    {
                        $project: {
                            _id: 0
                        }

                    }
                ]

            const result = await db.collection(collectionName).aggregate(pipeline).toArray();


            if (!result || result.length === 0) {
                break;
            }

            let altered = []

            for (let x of result) {
                let obj = {}
                x instanceof Object && Object.keys(x).forEach(key => {
                    if (key !== "_id" && key != "requestId" && key != "Swiggy_requestId" && key != "rightId" && key != "leftId") {

                        if (key != "Swiggy_Collection" && key != "OLO_Collection") {
                            obj[key] = x[key] && x[key];
                        } else {
                            obj = { ...obj, ...x[key][0] }
                        }
                    }

                })

                delete obj["_id"]
                delete obj["requestId"]
                delete obj["Swiggy_requestId"]
                delete obj["rightId"]
                delete obj["leftId"]
                delete obj["OLO_requestId"]


                altered.push(obj)
            }

            console.log('Inserting Data into Sql', altered[0]);




            await model.bulkCreate(altered, { logging: false });

            currPage = currPage + 1

        }

        console.log('Data Uploaded Sql Successfully');
        return
    } catch (error) {
        console.log(error)
    }
}

mongoToSql('6479a235575d3a65a147974b').then(() => { })


//64821e2ab12f587efbb3fede olo vs swiggy
//6479a235575d3a65a147974b swiggy
// ALTER TABLE old_table_name
// RENAME TO new_table_name;
