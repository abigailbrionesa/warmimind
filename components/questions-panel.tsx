export default function QuestionsPanel({ questions }) {
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
