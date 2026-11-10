import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { formatPKR } from '@/lib/format';
import type { MockMerchant, MockOrder } from './db';

const PURPLE = rgb(0.627, 0.125, 0.941);
const INK = rgb(0.035, 0.02, 0.106);
const MUTED = rgb(0.392, 0.416, 0.541);
const LINE = rgb(0.863, 0.875, 0.925);
const NEON = rgb(0.753, 0.149, 1);

const PAYMENT_LABELS: Record<MockOrder['paymentMethod'], string> = {
  cash_counter: 'Cash at counter',
  cod: 'Cash on delivery',
  bank_transfer: 'Bank transfer',
};

/** The branded receipt: transaction ID, merchant, student and discount details (F-701). */
export async function buildReceipt(order: MockOrder, merchant: MockMerchant): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`MyPerkify receipt ${order.number}`);
  const page = pdf.addPage([420, 595]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const left = 36;
  const right = 384;

  page.drawRectangle({ x: 0, y: 515, width: 420, height: 80, color: PURPLE });
  page.drawCircle({ x: 0, y: 515, size: 12, color: rgb(1, 1, 1) });
  page.drawCircle({ x: 420, y: 515, size: 12, color: rgb(1, 1, 1) });
  page.drawText('myperkify', { x: left, y: 555, size: 20, font: bold, color: rgb(1, 1, 1) });
  page.drawCircle({ x: 138, y: 558, size: 3.5, color: NEON });
  page.drawText('Student receipt', {
    x: left,
    y: 535,
    size: 11,
    font: regular,
    color: rgb(1, 1, 1),
  });

  let y = 480;
  const row = (label: string, value: string, strong = false) => {
    page.drawText(label, { x: left, y, size: 11, font: regular, color: MUTED });
    const font = strong ? bold : regular;
    const width = font.widthOfTextAtSize(value, 11);
    page.drawText(value, { x: right - width, y, size: 11, font, color: INK });
    y -= 22;
  };
  const rule = () => {
    page.drawLine({
      start: { x: left, y: y + 8 },
      end: { x: right, y: y + 8 },
      thickness: 1,
      color: LINE,
    });
    y -= 12;
  };

  row('Transaction ID', order.number, true);
  row('Date', new Date(order.completedAt ?? order.createdAt).toDateString());
  row('Merchant', merchant.name);
  if (order.branchName) row('Branch', order.branchName);
  row('Student', order.studentName);
  row('Payment', PAYMENT_LABELS[order.paymentMethod]);
  if (order.deliveryAddress) row('Delivered to', order.deliveryAddress.slice(0, 40));
  rule();

  for (const item of order.items) {
    row(`${item.title} x ${item.quantity}`, formatPKR(item.regularPrice * item.quantity));
  }
  row('Student discount', `-${formatPKR(order.discount)}`);
  if (order.deliveryFee > 0) row('Delivery', formatPKR(order.deliveryFee));
  rule();
  row('Amount paid', formatPKR(order.total), true);

  page.drawText(`You saved ${formatPKR(order.discount)} with MyPerkify.`, {
    x: left,
    y: 60,
    size: 11,
    font: bold,
    color: PURPLE,
  });

  return pdf.save();
}
