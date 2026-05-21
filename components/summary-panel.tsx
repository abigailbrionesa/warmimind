type SummaryPanelProps = {
  summary: string;
};

export default function SummaryPanel({ summary }: SummaryPanelProps) {
  return (
    <section>
      <h2>📘 Yachaykuna (Summary)</h2>
      <p>{summary}</p>
    </section>
  );
}
