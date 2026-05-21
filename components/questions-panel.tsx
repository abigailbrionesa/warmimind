type QuestionsPanelProps = {
  questions: string[];
};

export default function QuestionsPanel({ questions }: QuestionsPanelProps) {
  return (
    <section>
      <h2>❓ Tapuykuna (Questions)</h2>
      <ul>
        {questions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
    </section>
  );
}
