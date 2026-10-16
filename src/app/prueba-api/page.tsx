const TWENTY_API_URL = process.env.TWENTY_API_URL;
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;

export default async function PruebaApiPage() {
  const response = await fetch(`${TWENTY_API_URL}/rest/inscripciones?depth=1`, {
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json();

  return (
    <main
      style={{
        padding: "30px",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
      }}
    >
      <h1>Prueba API - Inscripciones</h1>

      <p>Status: {response.status}</p>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}