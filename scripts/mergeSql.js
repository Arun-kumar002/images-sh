const { Sequelize, DataTypes, Model, UUIDV4 } = require('sequelize')
const sourceURI = 'mongodb+srv://jfl-db-user:ETVQb6c03f7RKAyj@jflcluster0.vcryi.mongodb.net/uat?retryWrites=true&w=majority';
const sourceDatabase = 'uat';
const { MongoClient, ObjectId } = require("mongodb");
const { v4 } = require('uuid')
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

const merge = async () => {


    try {

        console.time('start')



        const query = `SELECT merge_dynamic_tables2(  
                            'mergetableolovsswiggy',
                            'olo_collection',
                            'swiggy_collection',
                            'faOrderRef',
                            'swiggyRef'
                        )`
        const result = await sequelize.query(query, { raw: true });

        console.log('Merge operation completed:', result);



        console.timeEnd('start')
    } catch (error) {
        console.log('Error:', error);
    }
}

merge().then(() => console.log('merged successfully')).catch((err) => console.log(err));



