import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as QRCode from 'qrcode';
import * as PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly config: ConfigService,
  ) {}

  async generateDocument(requestId: string, documentName: string, content: string, agentId?: string) {
    const request = await this.prisma.administrativeRequest.findUnique({
      where: { id: requestId },
      include: { citizen: true },
    });

    if (!request) throw new NotFoundException('Request not found');

    const documentId = uuidv4();
    const verifyUrl = `${this.config.get('FRONTEND_URL') || 'http://localhost:3000'}/api/v1/documents/verify/${documentId}`;
    
    // Generate QR Code as base64 string
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);

    // Create PDF
    const pdfBuffer = await this.createPdfBuffer(documentName, content, request.citizen, qrCodeDataUrl);

    // Upload PDF to Cloudinary (using raw/auto resource type for PDFs)
    const fileForCloudinary: Express.Multer.File = {
      buffer: pdfBuffer,
      mimetype: 'application/pdf',
      originalname: `${documentName}.pdf`,
    } as any;
    
    const uploadResult = await this.uploadPdfToCloudinary(fileForCloudinary);

    // Save to DB
    const document = await this.prisma.administrativeDocument.create({
      data: {
        id: documentId,
        documentNumber: documentName,
        fileUrl: uploadResult.secure_url,
        qrCode: verifyUrl,
        status: 'VALID',
        requestId: requestId,
        agentId: agentId || 'a38fa1b4-7164-4bf8-bde8-d1d6a6f1d24c',
        citizenId: request.citizenId,
      },
    });

    return document;
  }

  private async createPdfBuffer(title: string, content: string, user: any, qrCodeDataUrl: string): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text('RÉPUBLIQUE DU SÉNÉGAL', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text(title, { align: 'center', underline: true });
      doc.moveDown();

      doc.fontSize(12).text(`Délivré à : ${user.firstName} ${user.lastName}`);
      doc.text(`Email : ${user.email}`);
      doc.text(`Téléphone : ${user.phone || 'N/A'}`);
      doc.moveDown();

      doc.text(content);
      doc.moveDown(2);

      doc.image(qrCodeDataUrl, doc.page.width - 150, doc.page.height - 150, { width: 100 });
      doc.text('Scannez ce QR Code pour vérifier l\'authenticité.', doc.page.width - 250, doc.page.height - 40, { width: 200, align: 'right' });

      doc.end();
    });
  }

  private async uploadPdfToCloudinary(file: Express.Multer.File): Promise<any> {
    const { v2: cloudinary } = await import('cloudinary');
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'terangas-skills/documents', resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      ).end(file.buffer);
    });
  }

  async verify(id: string) {
    const document = await this.prisma.administrativeDocument.findUnique({
      where: { id },
      include: {
        request: {
          select: { title: true, status: true, citizen: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document non valide ou introuvable');
    }

    return {
      isValid: document.status === 'VALID',
      document,
    };
  }
}
