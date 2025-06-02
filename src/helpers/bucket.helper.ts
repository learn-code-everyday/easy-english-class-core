import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

import { configs } from '../configs';

class BucketHelper {
    public client: S3Client;
    public bucketName: string;

    constructor() {
        this.client = new S3Client({
            region: configs.awsRegion,
            credentials: {
                accessKeyId: configs.awsAccessKey,
                secretAccessKey: configs.awsSecret,
            },
        });
        this.bucketName = configs.awsBucketName;
    }

    public async uploadFile({
        stream,
        filename,
        mimetype,
    }: {
        stream: any;
        filename: string;
        mimetype: string;
    }) {
        const folder = configs.awsFolderName;
        const upload = new Upload({
            client: this.client,
            params: {
                Key: `${folder}/${filename}`,
                Body: stream,
                Bucket: this.bucketName,
                ContentType: mimetype,
                ACL: 'public-read',
            },
        });

        return upload.done();
    }

    public async uploadQr({
                                stream,
                                filename,
                                mimetype,
                            }: {
        stream: any;
        filename: string;
        mimetype: string;
    }) {
        const folder = 'qr';
        const upload = new Upload({
            client: this.client,
            params: {
                Key: `${folder}/${filename}`,
                Body: stream,
                Bucket: this.bucketName,
                ContentType: mimetype,
                ACL: 'public-read',
            },
        });

        return upload.done();
    }

    public async deleteFile({ fileName }: { fileName: string }) {
        try {
            const folder = configs.awsFolderName;
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: `${folder}/${fileName}`,
            });

            await this.client.send(command);
            console.log(`File ${fileName} successfully deleted from ${folder}`);
        } catch (error) {
            throw error;
        }
    }

    public async getAllFilesFromFolders() {}
}

const bucketHelper = new BucketHelper();

export const s3Bucket = bucketHelper;
