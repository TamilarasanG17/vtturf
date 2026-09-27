const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

/**
 * Builds a booking ticket PDF in memory and resolves with a Buffer.
 * Includes the turf image and the booking's QR code.
 *
 * @param {Object} booking - Mongoose Booking document (or plain object)
 * @param {Object} turf - Mongoose Turf document (or plain object)
 * @returns {Promise<Buffer>}
 */
function generateBookingPDF(booking, turf) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

      // Header
      doc
        .fillColor("#16a34a")
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("ONLINE TURF BOOKING", { align: "center" });
      doc.moveDown(0.3);
      doc
        .strokeColor("#e5e7eb")
        .lineWidth(1)
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();
      doc.moveDown(1);

      // Turf image (centered)
      const imagePath = resolveLocalImagePath(booking.turfImage);
      if (imagePath && fs.existsSync(imagePath)) {
        const imgWidth = 260;
        doc.image(imagePath, (doc.page.width - imgWidth) / 2, doc.y, {
          width: imgWidth,
          height: 150,
          fit: [imgWidth, 150],
        });
        doc.moveDown(9);
      }

      doc
        .fillColor("#111827")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(booking.turfName, { align: "center" });

      doc
        .fillColor("#374151")
        .fontSize(11)
        .font("Helvetica")
        .text(`Rating: ${turf?.rating ? turf.rating.toFixed(1) : "N/A"} / 5   |   Location: ${booking.location}`, {
          align: "center",
        });

      doc.moveDown(1);
      doc
        .strokeColor("#e5e7eb")
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();
      doc.moveDown(1);

      // Booking details table
      const rows = [
        ["Booking ID", booking.bookingId],
        ["Customer Name", booking.customerName],
        ["Email", booking.customerEmail],
        ["Date", booking.date],
        ["Time", `${booking.startTime} - ${booking.endTime}`],
        ["Members", String(booking.members)],
        ["Base Amount", `Rs. ${booking.baseAmount}`],
        ["Additional Fee", `Rs. ${booking.additionalAmount}`],
        ["Total Amount", `Rs. ${booking.totalAmount}`],
        ["Payment Type", booking.paymentType],
        ["Payment Status", booking.paymentStatus],
        ["Booking Status", booking.bookingStatus],
      ];

      doc.font("Helvetica").fontSize(11);
      rows.forEach(([label, value]) => {
        const y = doc.y;
        doc.fillColor("#6b7280").text(label, doc.page.margins.left, y, { width: pageWidth * 0.4 });
        doc
          .fillColor("#111827")
          .font("Helvetica-Bold")
          .text(String(value), doc.page.margins.left + pageWidth * 0.4, y, {
            width: pageWidth * 0.6,
          });
        doc.font("Helvetica");
        doc.moveDown(0.4);
      });

      doc.moveDown(1);
      doc
        .strokeColor("#e5e7eb")
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();
      doc.moveDown(1);

      // QR code
      if (booking.qrCode) {
        const qrBuffer = dataUrlToBuffer(booking.qrCode);
        if (qrBuffer) {
          const qrSize = 140;
          doc.image(qrBuffer, (doc.page.width - qrSize) / 2, doc.y, {
            width: qrSize,
            height: qrSize,
          });
          doc.moveDown(9);
        }
      }

      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .text("Scan to verify booking", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function dataUrlToBuffer(dataUrl) {
  const match = /^data:image\/\w+;base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return Buffer.from(match[1], "base64");
}

// Turf images referenced in the DB look like "/uploads/turfs/xyz.jpg";
// map that to the actual file on disk under server/uploads.
function resolveLocalImagePath(imageRef) {
  if (!imageRef) return null;
  if (/^https?:\/\//i.test(imageRef)) return null; // remote images aren't embedded directly here
  const relative = imageRef.replace(/^\//, "");
  return path.join(__dirname, "..", relative);
}

module.exports = { generateBookingPDF };
