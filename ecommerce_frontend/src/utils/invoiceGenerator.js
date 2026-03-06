import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (orders) => {
  console.log("Generating Invoice for orders:", orders);
  if (!orders || orders.length === 0) {
    console.error("No orders provided to invoice generator");
    return;
  }

  const doc = new jsPDF();
  const firstOrder = orders[0];
  
  // Robust Date Parsing
  const parseDate = (d) => {
    if (!d) return new Date();
    if (d instanceof Date) return d;
    if (typeof d === "string") return new Date(d);
    if (d.toDate && typeof d.toDate === "function") return d.toDate();
    if (d.seconds) return new Date(d.seconds * 1000);
    if (d._seconds) return new Date(d._seconds * 1000);
    return new Date();
  };

  const date = parseDate(firstOrder.date || firstOrder.CREATED_AT);
  
  // Header: Company Logo / Name
  doc.setFillColor(0, 0, 0); // Black Header Bar
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("ECOMMERCE", 14, 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("PREMIUM ACQUISITION RECEIPT", 14, 32);
  
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 196, 25, { align: "right" });
  
  // Section: Seller vs Customer
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("FROM (SELLER):", 14, 55);
  doc.setFont("helvetica", "normal");
  doc.text("ECOMMERCE Digital Store", 14, 60);
  doc.text("Global Fulfillment HQ", 14, 64);
  doc.text("Support: hq@ecommerce.com", 14, 68);

  doc.setFont("helvetica", "bold");
  doc.text("BILL TO (CUSTOMER):", 120, 55);
  doc.setFont("helvetica", "normal");
  doc.text((firstOrder.userName || "Customer").toUpperCase(), 120, 60);
  doc.text(`Phone: ${firstOrder.userPhone || "N/A"}`, 120, 64);
  
  // Horizontal Divider
  doc.setDrawColor(230, 230, 230);
  doc.line(14, 75, 196, 75);

  // Invoice Meta Info
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE ID:", 14, 85);
  doc.setFont("helvetica", "normal");
  doc.text(`#${firstOrder.displayOrderId || firstOrder.orderId || "N/A"}`, 40, 85);

  doc.setFont("helvetica", "bold");
  doc.text("DATE:", 14, 90);
  doc.setFont("helvetica", "normal");
  doc.text(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, 40, 90);

  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT METHOD:", 120, 85);
  doc.setFont("helvetica", "normal");
  doc.text(firstOrder.paymentMethod || "COD / Wallet", 160, 85);

  // Table of Items
  const tableColumn = ["ITEM DESCRIPTION", "CATEGORY", "QTY", "UNIT PRICE", "TOTAL"];
  const tableRows = [];

  let totalGrand = 0;
  let totalSaved = 0;
  let totalWallet = 0;

  orders.forEach((order) => {
    const rowData = [
      (order.productName || "Product").toUpperCase(),
      (order.productCategory || "General").toUpperCase(),
      1,
      `INR ${((order.total || 0) + (order.discountAmount || 0))}`,
      `INR ${(order.total || 0)}`,
    ];
    tableRows.push(rowData);
    totalGrand += (order.total || 0);
    totalSaved += (order.discountAmount || 0);
    totalWallet += (order.walletAmountUsed || 0);
  });

  autoTable(doc, { 
    head: [tableColumn],
    body: tableRows,
    startY: 100,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 22, halign: 'right' },
    },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 }
  });

  const finalY = doc.lastAutoTable.finalY + 15;

  
  // Final Calculation Box
  doc.setFillColor(245, 245, 245);
  doc.rect(120, finalY, 76, 45, "F");
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", 125, finalY + 8);
  doc.text(`INR ${totalGrand + totalSaved}`, 190, finalY + 8, { align: "right" });
  
  doc.setTextColor(180, 0, 0);
  doc.text("Coupon Discount:", 125, finalY + 14);
  doc.text(`- INR ${totalSaved}`, 190, finalY + 14, { align: "right" });
  
  doc.setTextColor(0, 0, 180);
  doc.text("Wallet Credit Used:", 125, finalY + 20);
  doc.text(`- INR ${totalWallet}`, 190, finalY + 20, { align: "right" });
  
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(200, 200, 200);
  doc.line(125, finalY + 25, 191, finalY + 25);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL (NET):", 125, finalY + 34);
  doc.text(`INR ${totalGrand}`, 190, finalY + 34, { align: "right" });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const codPay = Math.max(0, totalGrand - totalWallet);
  doc.text(`COD Payable: INR ${codPay}`, 190, finalY + 40, { align: "right" });

  // Footer Disclaimer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text("TERMS AND CONDITIONS:", 14, 270);
  doc.text("1. All sales are subject to visual verification at headquarters.", 14, 274);
  doc.text("2. Please retain this digital record for lifetime warranty claims.", 14, 278);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("AUTHORISED SIGNATORY", 196, 270, { align: "right" });
  doc.text("ECOMMERCE NODE 001", 196, 274, { align: "right" });

  doc.save(`Invoice_${firstOrder.displayOrderId || Date.now()}.pdf`);
};
