const AWS = require('aws-sdk');

const s3 = new AWS.S3({ accessKeyId: "AKIASPKX72U5ATJNUR5V", secretAccessKey: "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", region: "ap-south-1" });


const bucketName = 'form-v2-test-1';

const checkBucketExists = async () => {
    try {
        await s3.headBucket({ Bucket: bucketName }).promise();
        return true;
    } catch (error) {
        console.log("check error", error)
        if (error.code === 'NotFound') {
            return false;
        }
        throw error;
    }
};

const createBucket = async () => {
    try {
        await s3.createBucket({ Bucket: bucketName, }).promise();
        console.log(`Bucket ${bucketName} created successfully`);
    } catch (error) {
        console.error(`Could not create bucket: `, error);
    }
};

const attachPolicy = async (policy) => {
    try {
        await s3.putBucketPolicy({ Bucket: bucketName, Policy: JSON.stringify(policy) }).promise();
        console.log(`Policy attached successfully`);
    } catch (error) {
        console.error(`Could not attach policy: `, JSON.stringify(policy, null, 1), error);
    }
};

const bucketCors = async (bucketName) => {
    try {
        let params = {
            Bucket: bucketName,
            CORSConfiguration: {
                "CORSRules": [{
                    "AllowedHeaders": ["*"],
                    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
                    "AllowedOrigins": ["*"],
                    "ExposeHeaders": []
                }]
            }
        };
        await s3.putBucketCors(params).promise();
        console.log(`cors added successfully.`);
    } catch (error) {
        console.error(`Could not create cors: `, error);
    }
};

const objectWriterEnable = async (bucketName) => {
    try {

        const params = {
            Bucket: bucketName,
            OwnershipControls: {
                Rules: [
                    {
                        ObjectOwnership: 'ObjectWriter'
                    },
                ]
            }
        };

        s3.putBucketOwnershipControls(params).promise();
        console.log("successfully enable object writer.")

    } catch (error) {
        console.error(`Could not enable object write: `, error);
    }
}



const main = async () => {
    console.log(performance.now())
    const bucketExists = await checkBucketExists();
    console.log("bucket exist", bucketExists)
    console.log("im", performance.now())
    if (!bucketExists) {
        await createBucket();
    }
    await bucketCors(bucketName);
    await objectWriterEnable(bucketName);
    await attachPolicy({ "Version": "2012-10-17", "Statement": [{ "Sid": "PublicPutObject", "Effect": "Allow", "Principal": "*", "Action": "s3:PutObject", "Resource": `arn:aws:s3:::${bucketName}/*` }] });
};

main().catch((error) => console.error(error));




// exports.putSignedUrl = async ({ params }) => {
//     try {
//         // console.log("checking.....")
//         // const bucketExists = await checkBucketExists(params.Bucket);
//         // logger.info("putSignedUrl:Bucket Exists :" + bucketExists);
//         // if (!bucketExists) {
//         //     await createBucket(params.Bucket);
//         //     await bucketCors(params.Bucket);
//         //     await objectWriterEnable(params.Bucket);
//         //     await attachPolicy({ "Version": "2012-10-17", "Statement": [{ "Sid": "PublicPutObject", "Effect": "Allow", "Principal": "*", "Action": "s3:PutObject", "Resource": `arn:aws:s3:::${params.Bucket}/*` }] }, params.Bucket);
//         // }

//         let result = await s3.getSignedUrl("putObject", params);
//         return {
//             error: false,
//             url: result
//         }
//     } catch (e) {
//         console.log(e)
//         logger.error("S3 Put Params:[" + JSON.stringify(params) + "]" + e.toString());
//         return ({ error: true, message: e.toString() });
//     }
// }




// const checkBucketExists = async (bucketName) => {
//     try {
//         await s3.headBucket({ Bucket: bucketName }).promise();
//         return true;
//     } catch (error) {
//         console.log("check error", error)
//         if (error.code === 'NotFound') {
//             return false;
//         }
//         throw error;
//     }
// };

// const createBucket = async (bucketName) => {
//     try {
//         await s3.createBucket({ Bucket: bucketName }).promise();
//         console.log(`Bucket ${bucketName} created successfully`);
//     } catch (error) {
//         console.error(`Could not create bucket: `, error);
//     }
// };

// const attachPolicy = async (policy, bucketName) => {
//     try {
//         await s3.putBucketPolicy({ Bucket: bucketName, Policy: JSON.stringify(policy) }).promise();
//         console.log(`Policy attached successfully`);
//     } catch (error) {
//         console.error(`Could not attach policy: `, JSON.stringify(policy, null, 1), error);
//     }
// };

// const bucketCors = async (bucketName) => {
//     try {
//         let params = {
//             Bucket: bucketName,
//             CORSConfiguration: {
//                 "CORSRules": [{
//                     "AllowedHeaders": ["*"],
//                     "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
//                     "AllowedOrigins": ["*"],
//                     "ExposeHeaders": []
//                 }]
//             }
//         };
//         await s3.putBucketCors(params).promise();
//         console.log(`cors added successfully.`);
//     } catch (error) {
//         console.error(`Could not create cors: `, error);
//     }
// };

// const objectWriterEnable = async (bucketName) => {
//     try {

//         const params = {
//             Bucket: bucketName,
//             OwnershipControls: {
//                 Rules: [
//                     {
//                         ObjectOwnership: 'ObjectWriter'
//                     },
//                 ]
//             }
//         };

//         s3.putBucketOwnershipControls(params).promise();
//         console.log("successfully enable object writer.")

//     } catch (error) {
//         console.error(`Could not enable object write: `, error);
//     }
// }

