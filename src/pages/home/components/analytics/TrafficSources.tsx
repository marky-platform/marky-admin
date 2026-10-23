import { AnalyticsPulse } from "../../../../types/analytics";
import { barRatio, formatCount } from "./format";
import { MeterRow, Section } from "./sectionStyles";

const TrafficSources = ({ pulse }: { pulse: AnalyticsPulse }) => {
  const s = pulse.sources;
  const rows = [
    { label: "Enlace público", value: s.publicLink },
    { label: "QR", value: s.qr },
    { label: "Directo", value: s.direct },
    { label: "Otros", value: s.other },
  ];
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <Section title="Origen de las visitas">
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

export default TrafficSources;
