const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.argv[3] || "",
    secretAccessKey: process.argv[4] || "",
    region: process.argv[5] || ""
});

const bucketName = process.argv[2];

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



