import {CrudService} from "../../../base/crudService";
import {QrToken, QrTokenModel, QrTokenStatuses} from "./qrToken.model";
import QRCode from "qrcode";
import {Readable} from "stream";
import {s3Bucket} from "../../../helpers/bucket.helper";
import crypto from "crypto";

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
  async generateMultipleQrCodes(quantity: number) {
    const qrTokens: QrToken[] = [];

    for (let i = 0; i < quantity; i++) {
      const qrNumber = BigInt("0x" + crypto.randomBytes(6).toString("hex")).toString(36);
      const token = BigInt("0x" + crypto.randomBytes(8).toString("hex")).toString(36);

      qrTokens.push({
        qrNumber,
        token,
        status: QrTokenStatuses.REGISTERED,
        isExport: false,
      });
    }

    return await QrTokenModel.insertMany(qrTokens);
  }
  async export(ids: string[]): Promise<boolean> {
    const result = await QrTokenModel.updateMany(
        { _id: { $in: ids } },
        { $set: { isExport: true } }
    );

    return result.modifiedCount > 0;
  }
}

const qrTokenService = new QrTokenService();

export { qrTokenService };
