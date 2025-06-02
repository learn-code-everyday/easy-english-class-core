import {CrudService} from "../../../base/crudService";
import {QrTokenModel} from "./qrToken.model";
import QRCode from "qrcode";
import {Readable} from "stream";
import {s3Bucket} from "../../../helpers/bucket.helper";

class QrTokenService extends CrudService<typeof QrTokenModel> {
  constructor() {
    super(QrTokenModel);
  }

  async generateQrCode({ minerId, customerId }: { minerId: string; customerId: string }) {
    const payload = { minerId, customerId };
    const qrString = JSON.stringify(payload);

    // Generate QR buffer
    const buffer = await QRCode.toBuffer(qrString, { type: "png" });

    // Create a readable stream from buffer
    const stream = Readable.from(buffer);

    const filename = `qr_${minerId}_${customerId}_${Date.now()}.png`;

    // Upload to S3
    const res = await s3Bucket.uploadFile({
      stream,
      filename,
      mimetype: "image/png",
    });

    return await QrTokenModel.create({
      minerId,
      customerId,
      qrCodeUrl: res.Location,
    });
  }

  async generateMultipleQrCodes({ customerId, minerIds }: { customerId: string; minerIds: string[] }) {
    if (!Array.isArray(minerIds) || minerIds.length === 0) {
      throw new Error("minerIds must be a non-empty array");
    }

    if (!customerId) {
      throw new Error("customerId must be a non-empty array");
    }

    const results: string[] = [];

    for (const minerId of minerIds) {
      const payload = { minerId, customerId };
      const qrString = JSON.stringify(payload);
      const buffer = await QRCode.toBuffer(qrString, { type: "png" });
      const stream = Readable.from(buffer);
      const filename = `qr_${minerId}_${customerId}_${Date.now()}.png`;
      const res = await s3Bucket.uploadFile({
        stream,
        filename,
        mimetype: "image/png",
      });

      await QrTokenModel.create({
        minerId,
        customerId,
        qrCodeUrl: res.Location,
      });

      results.push(res.Location);
    }

    return results;
  }

}

const qrTokenService = new QrTokenService();

export { qrTokenService };
