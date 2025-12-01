package com.dimitar.***REMOVED***vice;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PDFTicketService {

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 22, Font.BOLD);
    private static final Font BODY_FONT = new Font(Font.HELVETICA, 12, Font.NORMAL);

    private final QRService qrService;

    public byte[] generateTicketPdf(String eventName,
                                    String attendee,
                                    String qrCodeString) {

        if (qrCodeString == null || qrCodeString.isBlank()) {
            throw new IllegalArgumentException("QR code string must be provided");
        }

        try (ByteArrayOutputStream pdfOut = new ByteArrayOutputStream();
             ByteArrayOutputStream imageOut = new ByteArrayOutputStream()) {

            var qrImage = qrService.generateQRCode(qrCodeString);
            ImageIO.write(qrImage, "png", imageOut);

            Document document = new Document();
            PdfWriter.getInstance(document, pdfOut);
            document.open();

            document.add(new Paragraph("Eventora Ticket\n", TITLE_FONT));
            document.add(new Paragraph(
                    "Event: " + safeValue(eventName) +
                            "\nAttendee: " + safeValue(attendee) +
                            "\nQR Code: " + qrCodeString +
                            "\n\n",
                    BODY_FONT
            ));

            Image qrPdfImg = Image.getInstance(imageOut.toByteArray());
            qrPdfImg.scaleToFit(180, 180);
            document.add(qrPdfImg);

            document.close();
            return pdfOut.toByteArray();

        } catch (Exception e) {
            throw new IllegalStateException("PDF generation failed", e);
        }
    }

    private String safeValue(String value) {
        return value == null ? "Unknown" : value;
    }
}
