import { useState } from "react";

const MOODS = [
  { id: "DeepFocus", label: "Deep Focus" },
  { id: "LightCoding", label: "Light coding" },
  { id: "Motivation", label: "Motivation" },
  { id: "FeelGood", label: "Feel good" },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [selectedMood, setSelectedMood] = useState("DeepFocus");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState("");

  const handleGetRecommendation = async () => {
    setError("");
    setRecommendation(null);

    if (!API_BASE_URL) {
      setError("Backend-URL ei ole vielä asetettu (VITE_API_BASE_URL).");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/recommendation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mood: selectedMood }),
      });

      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}`);
      }

      const data = await res.json();
      setRecommendation(data);
    } catch (err) {
      console.error(err);
      setError("Suosituksen hakeminen epäonnistui.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black px-6 py-10 font-sans text-slate-200">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-500/30 bg-slate-900/90 p-8 shadow-2xl shadow-black/40">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">DevMood DJ 🎧</h1>
          <p className="text-slate-400">Valitse koodausmoodi ja kysy soittolistasuositus</p>
        </header>

        {/* Mood selector */}
        <section className="mb-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            Mood
          </h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {MOODS.map((mood) => {
              const isActive = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedMood(mood.id)}
                  className={`rounded-full border px-4 py-2 font-medium transition ${
                    isActive
                      ? "border-emerald-400 bg-emerald-400/15 text-emerald-50 shadow shadow-emerald-400/30"
                      : "border-slate-500/60 text-slate-200/90 hover:border-slate-200/70"
                  }`}
                >
                  {mood.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Action button */}
        <section className="mb-8">
          <button
            type="button"
            onClick={handleGetRecommendation}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/40 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
              isLoading
                ? "cursor-not-allowed bg-emerald-400/60"
                : "bg-gradient-to-r from-emerald-400 to-cyan-300 hover:scale-[1.02]"
            }`}
          >
            {isLoading ? "Haetaan suositusta…" : "Hae suositus"}
          </button>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* Recommendation result */}
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            Recommendation
          </h2>

          {!recommendation && !error && (
            <p className="text-sm text-slate-400">
              Valitse moodi ja hae ensimmäinen soittolistasuositus.
            </p>
          )}

          {recommendation && (
            <div className="rounded-2xl border border-slate-500/40 bg-slate-900/80 p-5">
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                Mood: <strong className="text-slate-100">{recommendation.mood}</strong>
                <span className="mx-2 text-slate-600">|</span>
                Weather: <strong className="text-slate-100">{recommendation.weather}</strong>
              </p>

              <h3 className="mb-2 text-lg font-semibold text-slate-100">
                {recommendation.playlistName || "Recommended playlist"}
              </h3>

              {recommendation.note && (
                <p className="mb-4 text-sm text-slate-200">{recommendation.note}</p>
              )}

              {recommendation.playlistUrl && (
                <a
                  href={recommendation.playlistUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                >
                  Open in Spotify ↗
                </a>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
