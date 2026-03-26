import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { VisagismResult } from '@/lib/visagism-calculator';
import logoMarcela from '@/assets/logo-marcela.png';

// Register standard fonts if needed, or use default Helvetica/Times
// Font.register({ family: 'Inter', src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  coverPage: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  logo: {
    width: 150,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 50,
    textAlign: 'center',
  },
  clientName: {
    fontSize: 14,
    color: '#333333',
    marginTop: 'auto',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    borderBottom: '2px solid #D4AF37', // Gold accent
    paddingBottom: 10,
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottom: '1px solid #eeeeee',
  },
  label: {
    fontSize: 12,
    color: '#555555',
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  idealValue: {
    fontSize: 10,
    color: '#888888',
  },
  faceImage: {
    width: 250,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 8,
  },
  comparisonBox: {
    backgroundColor: '#fafafa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeft: '4px solid #D4AF37',
  },
  compTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  compDesc: {
    fontSize: 11,
    color: '#444444',
    marginBottom: 5,
  },
  compSugg: {
    fontSize: 11,
    color: '#D4AF37', // Gold
  },
  thirdsBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  thirdCol: {
    width: '30%',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
  },
  thirdLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
  },
  thirdValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionItem: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 8,
    paddingLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
    borderTop: '1px solid #eeeeee',
    paddingTop: 10,
  },
  scoreGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scoreCard: {
    width: '48%',
    backgroundColor: '#fafafa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    border: '1px solid #eeeeee',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  }
});

interface PdfReportProps {
  result: VisagismResult;
  suggestions: { aesthetic: string[] };
  imageUrl?: string;
  userName?: string;
}

const PdfReport = ({ result, suggestions, imageUrl, userName = "Cliente" }: PdfReportProps) => {
  const { rawMeasurements: raw, idealValues: ideal, referenceLabel, comparisons, thirdsAnalysis, faceShape, goldenRatioScore, symmetryScore } = result;

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Image src={logoMarcela} style={styles.logo} />
        <Text style={styles.title}>Dossiê de Visagismo Facial</Text>
        <Text style={styles.subtitle}>Análise de Proporção Áurea e Estética</Text>
        <Text style={styles.clientName}>Preparado exclusivamente para: {userName}</Text>
      </Page>

      {/* Page 2: Metrics and Face Map */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Análise Métrica</Text>
        
        {imageUrl && <Image src={imageUrl} style={styles.faceImage} />}

        <View style={styles.scoreGrid}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Formato do Rosto</Text>
            <Text style={styles.scoreValue}>{faceShape}</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Simetria Facial</Text>
            <Text style={styles.scoreValue}>{symmetryScore}%</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Proporção Áurea Score</Text>
            <Text style={styles.scoreValue}>{goldenRatioScore.toFixed(2)}</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Medida Referência</Text>
            <Text style={styles.scoreValue}>{referenceLabel}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Medidas Reais vs Ideais (em cm)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Largura do Rosto</Text>
            <Text style={styles.value}>{raw.k.toFixed(1)} <Text style={styles.idealValue}>(Ideal: {ideal.x.toFixed(1)})</Text></Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Altura do Rosto</Text>
            <Text style={styles.value}>{raw.j.toFixed(1)} <Text style={styles.idealValue}>(Ideal: {ideal.d.toFixed(1)})</Text></Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Largura da Boca</Text>
            <Text style={styles.value}>{raw.l.toFixed(1)} <Text style={styles.idealValue}>(Ideal: {ideal.g.toFixed(1)})</Text></Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Distância dos Olhos</Text>
            <Text style={styles.value}>{raw.a.toFixed(1)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Largura do Nariz</Text>
            <Text style={styles.value}>{raw.c.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>Método Leitura Facial - Marcela Cameirão</Text>
      </Page>

      {/* Page 3: Proportion & Comparisons */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Diagnóstico Analítico</Text>

        <View style={styles.section}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>Regra dos Terços</Text>
          <View style={styles.thirdsBox}>
            <View style={styles.thirdCol}>
              <Text style={styles.thirdLabel}>Terço Superior</Text>
              <Text style={styles.thirdValue}>{thirdsAnalysis.percentages.upper}%</Text>
            </View>
            <View style={styles.thirdCol}>
              <Text style={styles.thirdLabel}>Terço Médio</Text>
              <Text style={styles.thirdValue}>{thirdsAnalysis.percentages.middle}%</Text>
            </View>
            <View style={styles.thirdCol}>
              <Text style={styles.thirdLabel}>Terço Inferior</Text>
              <Text style={styles.thirdValue}>{thirdsAnalysis.percentages.lower}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>Detalhamento Comparativo</Text>
          {comparisons.map((comp, idx) => (
            <View key={idx} style={styles.comparisonBox}>
              <Text style={styles.compTitle}>{comp.label}</Text>
              <Text style={styles.compDesc}>{comp.description}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Método Leitura Facial - Marcela Cameirão</Text>
      </Page>

      {/* Page 4: Suggestions & Makeup */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Prescrição Visagista</Text>

        <View style={styles.section}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>Maquiagem e Estética</Text>
          {suggestions.aesthetic.map((sugg, idx) => (
            <Text key={idx} style={styles.suggestionItem}>• {sugg}</Text>
          ))}
        </View>

        <View style={{ marginTop: 50, borderTop: '1px solid #cccccc', paddingTop: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Anotações do Profissional:</Text>
          {/* Empty lines for writing */}
          {[...Array(6)].map((_, i) => (
            <View key={i} style={{ borderBottom: '1px dotted #dddddd', height: 30, marginBottom: 10 }} />
          ))}
        </View>

        <Text style={styles.footer}>Método Leitura Facial - Marcela Cameirão</Text>
      </Page>
    </Document>
  );
};

export default PdfReport;
