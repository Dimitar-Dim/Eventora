import { useEffect, useState } from "react";
import EventList from "./components/EventList";
import type { Event } from "./types/Event";

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:8080/events", { signal });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        }
        const data: Event[] = await res.json();
        setEvents(data);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Error fetching events:", err);
        setError(
          err instanceof Error
            ? err.message
            : typeof err === "string"
            ? err
            : "Unknown error"
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvents();

    return () => controller.abort();
  }, []);

  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h1>Eventora</h1>

      {loading && <p>Loading events...</p>}

      {error && (
        <div>
          <p style={{ color: "#ff6b6b" }}>Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div>
          <p>{events.length} events loaded</p>
            <EventList events={events} />
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setShowRaw((s) => !s)}
                style={{ padding: "6px 12px", cursor: "pointer" }}
              >
                {showRaw ? "Hide raw JSON" : "Show raw JSON"}
              </button>

              {showRaw && (
                <pre style={{ textAlign: "left", maxWidth: 800, margin: "16px auto" }}>
                  {JSON.stringify(events, null, 2)}
                </pre>
              )}
            </div>
        </div>
      )}
    </div>
  );
}

export default App;
