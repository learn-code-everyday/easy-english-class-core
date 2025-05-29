import _ from 'lodash';

import { mediaService } from '../media.service';
import { Context } from '../../../../core/context';
import { ROLES } from '../../../../constants/role.const';
import { ErrorHelper } from '../../../../helpers';
import { s3Bucket } from '../../../../helpers/bucket.helper';

enum AllowedMimeTypes {
    GIF = 'image/gif',
    PNG = 'image/png',
    SVG = 'image/svg',
    SVG_XML = 'image/svg+xml',
    JPG = 'image/jpg',
    JPEG = 'image/jpeg',
}

const Mutation = {
    uploadImage: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_MEMBER_EDITOR);

        const { file } = args;

        const { createReadStream, filename, mimetype } = await file;
        // console.log("mimetype", mimetype);
        const stream: ReadableStream = createReadStream();

        const allowedMimeTypes = Object.values(AllowedMimeTypes);

        if (!allowedMimeTypes.includes(mimetype)) {
            throw ErrorHelper.error(
                'Invalid file type. Only .gif .svg and .png files are allowed.',
            );
        }

        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const newFilename = `${timestamp}_${filename}`;

        try {
            const res = await s3Bucket.uploadFile({
                stream,
                filename: newFilename,
                mimetype,
            });

            return await mediaService.create({
                name: newFilename,
                url: res.Location,
            });
        } catch (error) {
            throw error;
        }
    },
};

export default { Mutation };
