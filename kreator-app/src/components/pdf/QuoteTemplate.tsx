// src/components/pdf/QuoteTemplate.tsx v0.001 Szablon oferty PDF
'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { PriceSummary, Addons } from '@/types';

// Style PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #6366f1',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  quoteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  quoteId: {
    fontSize: 10,
    color: '#94a3b8',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #e2e8f0',
  },
  col1: { width: '35%' },
  col2: { width: '20%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '25%', textAlign: 'right' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  summaryLabel: {
    color: '#64748b',
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#6366f1',
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#94a3b8',
    borderTop: '1px solid #e2e8f0',
    paddingTop: 10,
  },
  addonsSection: {
    marginTop: 10,
  },
  addonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    backgroundColor: '#f8fafc',
  },
});

// Formatowanie ceny
function formatPrice(price: number): string {
  return `${price.toFixed(2)} zl`;
}

// Generowanie ID oferty
function generateQuoteId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KPT-${dateStr}-${random}`;
}

interface QuoteTemplateProps {
  priceSummary: PriceSummary;
  addons: Addons;
}

export default function QuoteTemplate({ priceSummary, addons }: QuoteTemplateProps) {
  const quoteId = generateQuoteId();
  const date = new Date().toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Naglowek */}
        <View style={styles.header}>
          <Text style={styles.title}>Wycena Paneli Tapicerowanych</Text>
          <Text style={styles.subtitle}>Kreator Paneli - Oferta cenowa</Text>
          <View style={styles.quoteInfo}>
            <Text style={styles.quoteId}>Nr oferty: {quoteId}</Text>
            <Text style={styles.quoteId}>Data: {date}</Text>
          </View>
        </View>

        {/* Podsumowanie projektu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Podsumowanie projektu</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Liczba paneli:</Text>
            <Text style={styles.summaryValue}>{priceSummary.panelsCount} szt.</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Calkowita powierzchnia:</Text>
            <Text style={styles.summaryValue}>{priceSummary.totalArea} m2</Text>
          </View>
        </View>

        {/* Lista paneli */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specyfikacja paneli</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Wymiar</Text>
              <Text style={styles.col2}>Kategoria</Text>
              <Text style={styles.col3}>Ilosc</Text>
              <Text style={styles.col4}>Wartosc</Text>
            </View>
            {priceSummary.panels.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{item.dimension} cm</Text>
                <Text style={styles.col2}>{item.category}</Text>
                <Text style={styles.col3}>{item.quantity} szt.</Text>
                <Text style={styles.col4}>{formatPrice(item.totalPrice)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Suma za panele:</Text>
            <Text style={styles.summaryValue}>{formatPrice(priceSummary.panelsTotal)}</Text>
          </View>
        </View>

        {/* Dodatki */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dodatki i akcesoria</Text>
          <View style={styles.addonsSection}>
            {addons.doubleFoam && (
              <View style={styles.addonRow}>
                <Text>Podwojna pianka</Text>
                <Text>{formatPrice(priceSummary.addons.doubleFoam)}</Text>
              </View>
            )}
            {addons.velcro && (
              <View style={styles.addonRow}>
                <Text>Rzep montazowy</Text>
                <Text>{formatPrice(priceSummary.addons.velcro)}</Text>
              </View>
            )}
            {addons.socketHoles > 0 && (
              <View style={styles.addonRow}>
                <Text>Otwory na kontakt ({addons.socketHoles} szt.)</Text>
                <Text>{formatPrice(priceSummary.addons.socketHoles)}</Text>
              </View>
            )}
            {addons.glueCount > 0 && (
              <View style={styles.addonRow}>
                <Text>Klej montazowy ({addons.glueCount} szt.)</Text>
                <Text>{formatPrice(priceSummary.addons.glue)}</Text>
              </View>
            )}
          </View>
          {priceSummary.addonsTotal > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Suma za dodatki:</Text>
              <Text style={styles.summaryValue}>{formatPrice(priceSummary.addonsTotal)}</Text>
            </View>
          )}
        </View>

        {/* Wysylka */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logistyka</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Koszt wysylki:</Text>
            <Text style={styles.summaryValue}>{formatPrice(priceSummary.shipping)}</Text>
          </View>
        </View>

        {/* Suma calkowita */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>RAZEM DO ZAPLATY:</Text>
          <Text style={styles.totalValue}>{formatPrice(priceSummary.grandTotal)}</Text>
        </View>

        {/* Stopka */}
        <Text style={styles.footer}>
          Wycena wygenerowana automatycznie przez Kreator Paneli Tapicerowanych.
          {'\n'}Oferta wazna 14 dni od daty wystawienia. Ceny brutto (zawieraja VAT).
        </Text>
      </Page>
    </Document>
  );
}
