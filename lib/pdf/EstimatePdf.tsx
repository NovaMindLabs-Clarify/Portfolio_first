import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDateRu, formatRub } from "@/lib/format";
import type { EstimateInput } from "@/lib/schemas/estimate";

export interface EstimatePdfProps {
  input: EstimateInput;
  low: number;
  high: number;
  disclaimer: string;
  name: string;
  createdAt: Date;
}

const REPAIR_TYPE_LABEL: Record<EstimateInput["repairType"], string> = {
  cosmetic: "Косметический",
  capital: "Капитальный",
  designer: "Дизайнерский",
};

const URGENCY_LABEL: Record<EstimateInput["urgency"], string> = {
  normal: "Обычный",
  accelerated: "Ускоренный",
  urgent: "Срочный",
};

const LAYOUT_CHANGE_LABEL: Record<EstimateInput["layoutChange"], string> = {
  none: "Без изменений",
  partitions: "Перенос перегородок",
  wetZones: "Перенос мокрых зон",
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1B2430",
  },
  brand: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#5b6472",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#D7DAD4",
    paddingVertical: 8,
  },
  label: {
    color: "#5b6472",
  },
  value: {
    fontFamily: "Courier",
  },
  estimateBox: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D7DAD4",
  },
  estimateLabel: {
    fontSize: 10,
    color: "#5b6472",
    marginBottom: 4,
  },
  estimateValue: {
    fontFamily: "Courier-Bold",
    fontSize: 20,
  },
  disclaimer: {
    marginTop: 12,
    fontSize: 9,
    color: "#5b6472",
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    fontSize: 9,
    color: "#5b6472",
    borderTopWidth: 1,
    borderTopColor: "#D7DAD4",
    paddingTop: 8,
  },
});

function formatDate(date: Date): string {
  return formatDateRu(date);
}

export function EstimatePdf({
  input,
  low,
  high,
  disclaimer,
  name,
  createdAt,
}: EstimatePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>КОНТУР</Text>
        <Text style={styles.subtitle}>
          Предварительная смета от {formatDate(createdAt)} для {name}
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Площадь</Text>
          <Text style={styles.value}>{input.area} м²</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Тип ремонта</Text>
          <Text>{REPAIR_TYPE_LABEL[input.repairType]}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Санузлы</Text>
          <Text style={styles.value}>{input.bathrooms}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Перепланировка</Text>
          <Text>{LAYOUT_CHANGE_LABEL[input.layoutChange]}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Срочность</Text>
          <Text>{URGENCY_LABEL[input.urgency]}</Text>
        </View>

        <View style={styles.estimateBox}>
          <Text style={styles.estimateLabel}>Вилка сметы</Text>
          <Text style={styles.estimateValue}>
            {formatRub(low)} — {formatRub(high)}
          </Text>
          <Text style={styles.disclaimer}>{disclaimer}</Text>
        </View>

        <Text style={styles.footer}>
          КОНТУР — ремонт под ключ. Концепт-проект для портфолио.
        </Text>
      </Page>
    </Document>
  );
}
