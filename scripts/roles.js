const axios = require("axios");
const { MongoClient } = require('mongodb');
require("dotenv").config()
const userId = '813c6584-9ed6-48c1-890b-baa4a39a8617'
const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJSSFd1U2ktU2lVODV1Vml5RmxpNkpkY1c5YnlmSVVISHllTW5PcnBZc0NFIn0.eyJleHAiOjE3MDI0NTA1OTksImlhdCI6MTcwMjQ1MDI5OSwiYXV0aF90aW1lIjoxNzAyNDUwMjk3LCJqdGkiOiI1YzZmNzJlOS0xZjVmLTRiODEtYjVhZC02ZTE1YjVkYzYxOWYiLCJpc3MiOiJodHRwczovL2F1dGguZWNvYmlsbHouY29tL3JlYWxtcy90ZW5hbnRfY29udGFjdGxlc3MiLCJzdWIiOiIwZDEzNzRhMy04ZWMwLTQ3MzUtOTg4MC1iOWNiNzc1YWMwNjYiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzZWN1cml0eS1hZG1pbi1jb25zb2xlIiwibm9uY2UiOiJlMWI5YjA4OC1mZDZiLTQzMTctYWRkNS0zNWU0YzZhOWZlZDUiLCJzZXNzaW9uX3N0YXRlIjoiMzc3ZDJjZTQtZThlMi00NDlhLWI0MzgtZTg2YzM3YjdkY2RmIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2F1dGguZWNvYmlsbHouY29tIl0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJzaWQiOiIzNzdkMmNlNC1lOGUyLTQ0OWEtYjQzOC1lODZjMzdiN2RjZGYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkFydW5rdW1hciBTdWJyYW1hbml5YW4iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhcnVua3VtYXIuc3VicmFtYW5peWFuIiwiZ2l2ZW5fbmFtZSI6IkFydW5rdW1hciIsImZhbWlseV9uYW1lIjoiU3VicmFtYW5peWFuIiwiZW1haWwiOiJhcnVua3VtYXIuc3VicmFtYW5peWFuQGVjb2JpbGx6LmNvbSJ9.DOAP_hz49OFRGFn_WH5HrBt4oNq-Y0E3KsAutDD465PSNYkuENGZ7bxLfPlMohr9Xh2UdC4yqX3zSCBEYV33_vHH7yGnfgsGrfqT3_7nx6rlHd0TMUK_UDgJ4HVkxL4KQeDdibxEbWsSuYednoswnYkUcIyDRrOqn5SVqP-hMeEi8wctONCtcQtehf-ZnFZIifkmipl5SqCpbAyvpPRqgjkRMjj7rce5ct8ltDCkz8-F9AOz0w9Uj8tcdF-pcdsx10UvOI3G4JvDS-Trj8KzcWroISgyOXwWWkvUgJ0O3H9oQvARdFNOW4hhaGQZ6WwZS9wYan6V4o9jVt0YpckFmA"


// const deleteRoles = async () => {
//     try {
//         console.log(process.env.sourceDb, process.env.prodMongoUrl)
//         const sourceClient = await MongoClient.connect(process.env.prodMongoUrl);
//         const sourceDB = sourceClient.db(process.env.sourceDb);
//         console.log("db Connected")
//         const allReports = await sourceDB.collection(process.env.reportSettingCollection).find().toArray()

//         for (let x of allReports) {
//             let role = `${x.reportName.toUpperCase()}_READ`

//             const realmRoles = await axios.get(`https://iam-test.ecobillz.com/admin/realms/reconciliation/roles?first=0&max=20&search=${role}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             })

//             if (!realmRoles?.data[0]?.id) {
//                 continue;
//             }

//             try {
//                 await axios.delete(`http://localhost:5500/api/roles/${realmRoles?.data[0]?.id}`, {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     }
//                 },)
//             } catch (error) {
//                 console.log(error?.message)
//             }
//             console.log("Role Deleted Successfully", role, realmRoles.data[0].id)
//         }
//         console.log("All roles deleted successfully")
//     } catch (error) {
//         console.log("error", error)
//     }
// }

// deleteRoles().then().catch()

let List = {
    menu: ["USER_MENU_LOCK", "USER_MENU_MANUAL_RECON", "USER_MENU_UPLOAD"],
    triggers: ["CLEANSING_TRIGGER", "MERGE_TRIGGER", "PARSE_TRIGGER", "USER_MENU_LOCK"],
    upload: ["REPORT_UPLOAD", "UPLOAD_STATUS_READ", "UPLOAD_STATUS_DELETE"],
    settings: ["REPORT_SETTING_READ", 'REPORT_SETTING_CREATE', "REPORT_SETTING_UPDATE", "REPORT_SETTING_DELETE", "REPORT_SETTING_CREATE",
        "MASTER_SETTING_CREATE", "MASTER_SETTING_READ", "MASTER_SETTING_UPDATE", "MASTER_SETTING_DELETE",
        "RECON_SETTING_CREATE", "RECON_SETTING_READ", "RECON_SETTING_UPDATE", "RECON_SETTING_DELETE",
        "RECON_MENU_SETTING_CREATE", "RECON_MENU_SETTING_READ", "RECON_MENU_SETTING_UPDATE", "RECON_MENU_SETTING_DELETE",
        "SEED_SETTING_CREATE", "SEED_SETTING_READ", "SEED_SETTING_UPDATE", "SEED_SETTING_DELETE",
        "WORKFLOW_SETTING_CREATE", "WORKFLOW_SETTING_READ", "WORKFLOW_SETTING_UPDATE", "WORKFLOW_SETTING_DELETE",
        "USER_SETTING_CREATE", "USER_SETTING_READ", "USER_SETTING_UPDATE", "USER_SETTING_DELETE",
        "ACTION_SETTING_CREATE", "ACTION_SETTING_READ", "ACTION_SETTING_UPDATE", "ACTION_SETTING_DELETE",
        "CUSTOM_FIELD_SETTING_CREATE", "CUSTOM_FIELD_SETTING_READ", "CUSTOM_FIELD_SETTING_UPDATE", "CUSTOM_FIELD_SETTING_DELETE",
        "MASTER_COLUMN_SETTING_CREATE", "MASTER_COLUMN_SETTING_READ", "MASTER_COLUMN_SETTING_UPDATE", "MASTER_COLUMN_SETTING_DELETE",

    ]

}



// const createRole = async () => {
//     try {
//         let allRoles = d.data;
//         for (let role of allRoles) {

//             const { data } = await axios.post("http://localhost:5500/api/roles", { name: role.name }, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             })
//             console.log(data);
//         }
//         console.log("all roles created")
//     } catch (error) {
//         console.log("error", error)
//     }
// }

// createRole().then().catch()
// const AddRoles = async () => {
//     try {
//         let allRoles = d.data;
//         for (let role of allRoles) {


//             const realmRoles = await axios.get(`https://iam-test.ecobillz.com/admin/realms/reconciliation/roles?first=0&max=20&search=${role.name.toUpperCase()}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             })

//             if (!realmRoles?.data[0]?.id) {
//                 continue;
//             }

//             try {
//                 await axios.post(`http://localhost:5500/api/roles/${userId}`, realmRoles, {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     }
//                 },)
//             } catch (error) {
//                 console.log(error?.message)
//             }
//             console.log("Role added Successfully", role, realmRoles.data[0].id)
//         }
//         console.log("All roles added successfully")
//     } catch (error) {
//         console.log("error", error)
//     }
// }

// AddRoles().then().catch()


async function getPublicKey() {
    try {
        const response = await axios.get('https://auth.ecobillz.com/realms/tenant_contactless/protocol/openid-connect/certs');
        console.log(response.data);
    } catch (error) {
        console.log(error);
    }
}

getPublicKey();



async function getPublicKey() {
    try {


        // Replace these values with your Keycloak server information
        const keycloakBaseUrl = 'https://auth.ecobillz.com';
        const realmName = 'tenant_contactless';

        // URL to fetch the realm's public key
        const publicKeyUrl = `${keycloakBaseUrl}/realms/${realmName}/protocol/openid-connect/certs`;

        // Fetch the public key
        axios.get(publicKeyUrl)
            .then(response => {
                const publicKey = response.data.keys[0].x5c[0];
                console.log('Keycloak realm public key:', publicKey);
            })
            .catch(error => {
                console.error('Error fetching Keycloak public key:', error);
            });

    } catch (error) {
        console.log(error);
    }
}