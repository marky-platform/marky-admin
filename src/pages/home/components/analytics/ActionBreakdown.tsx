import { AnalyticsPulse } from "../../../../types/analytics";
import { barRatio, formatCount } from "./format";
import { MeterRow, Section } from "./sectionStyles";

const ActionBreakdown = ({ pulse }: { pulse: AnalyticsPulse }) => {
  const a = pulse.actions;
  const rows = [
    { label: "Ubicación", value: a.location },
    { label: "WhatsApp", value: a.whatsapp },
    { label: "Instagram", value: a.instagram },
    { label: "Otros", value: a.other },
  ];
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <Section title="Acciones">
      {rows.map((r) => (
        <MeterRow
          key={r.label}
          label={r.label}
          value={formatCount(r.value)}
          ratio={barRatio(r.value, max)}
        />
      ))}
    </Section>
  );
};

export default ActionBreakdown;
