import QRCode from "qrcode";

export const generateQrCode = async (data: string): Promise<string> => {
  // returns a base64 data URL with the QR code image
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256
  });
};
