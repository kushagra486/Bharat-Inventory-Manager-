import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  subtitle: { fontSize: 9, color: "#555", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  block: { flexDirection: "column", maxWidth: "48%" },
  label: { fontSize: 8, color: "#777", marginBottom: 2 },
  value: { fontSize: 10, marginBottom: 6 },
  strong: { fontFamily: "Helvetica-Bold" },
  table: { marginTop: 8, borderTop: "1 solid #ddd" },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #ddd",
    paddingVertical: 6,
    backgroundColor: "#f7f7f7",
  },
  tableRow: { flexDirection: "row", borderBottom: "1 solid #eee", paddingVertical: 6 },
  colItem: { width: "40%" },
  colQty: { width: "15%", textAlign: "right" },
  colPrice: { width: "20%", textAlign: "right" },
  colTotal: { width: "25%", textAlign: "right" },
  totals: { marginTop: 12, alignSelf: "flex-end", width: "45%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTop: "1 solid #333",
  },
  footer: { marginTop: 32, fontSize: 8, color: "#888", textAlign: "center" },
});

export type InvoiceData = {
  orderNumber: string;
  createdAt: string;
  paymentMethod: string;
  status: string;
  shop: {
    name: string;
    address: string | null;
    gstin: string | null;
    phone: string | null;
  };
  customer: {
    name: string;
    phone: string | null;
  };
  items: { name: string; quantity: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  tax: number;
  total: number;
};

function InvoiceDocument({ invoice }: { invoice: InvoiceData }) {
  const isTaxInvoice = Boolean(invoice.shop.gstin);
  const cgst = invoice.tax / 2;
  const sgst = invoice.tax / 2;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{isTaxInvoice ? "Tax Invoice" : "Invoice"}</Text>
        <Text style={styles.subtitle}>Order {invoice.orderNumber}</Text>

        <View style={styles.row}>
          <View style={styles.block}>
            <Text style={styles.label}>Sold by</Text>
            <Text style={[styles.value, styles.strong]}>{invoice.shop.name}</Text>
            {invoice.shop.address && <Text style={styles.value}>{invoice.shop.address}</Text>}
            {invoice.shop.phone && <Text style={styles.value}>Phone: {invoice.shop.phone}</Text>}
            {invoice.shop.gstin && <Text style={styles.value}>GSTIN: {invoice.shop.gstin}</Text>}
          </View>
          <View style={styles.block}>
            <Text style={styles.label}>Billed to</Text>
            <Text style={[styles.value, styles.strong]}>{invoice.customer.name}</Text>
            {invoice.customer.phone && <Text style={styles.value}>Phone: {invoice.customer.phone}</Text>}
            <Text style={styles.label}>Invoice date</Text>
            <Text style={styles.value}>{new Date(invoice.createdAt).toLocaleDateString("en-IN")}</Text>
            <Text style={styles.label}>Payment method</Text>
            <Text style={styles.value}>
              {invoice.paymentMethod.toUpperCase()} · {invoice.status}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colItem}>Item</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit price</Text>
            <Text style={styles.colTotal}>Amount</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colItem}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{"Rs. "}{item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.colTotal}>{"Rs. "}{item.lineTotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{"Rs. "}{invoice.subtotal.toFixed(2)}</Text>
          </View>
          {isTaxInvoice ? (
            <>
              <View style={styles.totalRow}>
                <Text>CGST (2.5%)</Text>
                <Text>{"Rs. "}{cgst.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>SGST (2.5%)</Text>
                <Text>{"Rs. "}{sgst.toFixed(2)}</Text>
              </View>
            </>
          ) : (
            <View style={styles.totalRow}>
              <Text>GST (5%)</Text>
              <Text>{"Rs. "}{invoice.tax.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.strong}>Total</Text>
            <Text style={styles.strong}>{"Rs. "}{invoice.total.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          {isTaxInvoice
            ? "This is a computer-generated tax invoice and does not require a signature."
            : "This seller is not GST-registered — this document is a bill of supply, not a tax invoice."}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(invoice: InvoiceData): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument invoice={invoice} />);
}
