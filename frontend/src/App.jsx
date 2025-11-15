import { useState } from "react";

const MOODS = [
  { id: "DeepFocus", label: "Deep Focus", description: "Syvä keskittyminen, minimi häly" },
  { id: "LightCoding", label: "Light coding", description: "Kevyt koodailu ja buukkailu" },
  { id: "Motivation", label: "Motivation", description: "Kun pitää saada itsensä liikkeelle" },
  { id: "FeelGood", label: "Feel good", description: "Hyvän mielen flow-tila" },
];

const CITY_OPTIONS = [
  { value: "Helsinki,FI", label: "Helsinki" },
  { value: "Espoo,FI", label: "Espoo" },
  { value: "Tampere,FI", label: "Tampere" },
  { value: "Vantaa,FI", label: "Vantaa" },
  { value: "Oulu,FI", label: "Oulu" },
  { value: "Turku,FI", label: "Turku" },
  { value: "Jyväskylä,FI", label: "Jyväskylä" },
  { value: "Kuopio,FI", label: "Kuopio" },
  { value: "Lahti,FI", label: "Lahti" },
  { value: "Pori,FI", label: "Pori" },
  { value: "Stockholm,SE", label: "Stockholm" },
  { value: "London,GB", label: "London" },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [selectedMood, setSelectedMood] = useState("DeepFocus");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");
  const [city, setCity] = useState("Turku,FI");

  const isDark = theme === "dark";

  const handleGetRecommendation = async () => {
    setError("");
    setRecommendation(null);

    if (!API_BASE_URL) {
      setError("Backend-URL ei ole vielä asetettu (VITE_API_BASE_URL).");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mood: selectedMood, city }),
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
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark
          ? "bg-[#050302] text-[#FFEEDD]"
          : "bg-gradient-to-b from-sky-50 via-white to-blue-50 text-slate-900"
      }`}
    >
      <div className="pointer-events-none fixed inset-0 opacity-80">
        {isDark ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,166,0,0.18),_transparent_60%)]" />
            <div className="absolute -bottom-1/3 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(255,94,0,0.25),_transparent_60%)] blur-3xl" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]" />
            <div className="absolute -bottom-1/2 left-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(14,165,233,0.2),_transparent_60%)] blur-3xl" />
          </>
        )}
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 md:px-8">
        {/* Top nav */}
        <nav
          className={`mb-8 flex items-center justify-between rounded-full border px-4 py-2 shadow-lg backdrop-blur ${
            isDark
              ? "border-orange-500/30 bg-black/70 text-orange-100 shadow-black/60"
              : "border-blue-200/70 bg-white/80 text-slate-700 shadow-blue-200/70"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold ${
                isDark
                  ? "bg-gradient-to-br from-orange-500 via-amber-400 to-pink-500 text-[#1C0F02]"
                  : "bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-500 text-white"
              }`}
            >
              DJ
            </div>
            <span className="text-sm font-semibold tracking-wide">DevMood DJ</span>
          </div>
          <div className="flex items-center gap-3 text-[0.7rem] font-medium">
            <span
              className={`hidden rounded-full px-3 py-1 md:inline-flex ${
                isDark
                  ? "bg-orange-900/50 text-orange-100"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              <span
                className={`mr-2 h-2 w-2 rounded-full ${
                  isDark
                    ? "bg-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.9)]"
                    : "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
                }`}
              />
              {API_BASE_URL ? "Yhteys pilveen OK" : "Backend-URL puuttuu"}
            </span>
            <span
              className={`rounded-full px-3 py-1 ${
                isDark ? "bg-orange-900/50 text-orange-200" : "bg-blue-100 text-blue-700"
              }`}
            >
              Side project · AWS + Spotify
            </span>
            <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/5 p-0.5 text-xs">
              {["dark", "light"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    theme === mode
                      ? mode === "dark"
                        ? "bg-gradient-to-r from-orange-500 to-pink-500 text-black"
                        : "bg-gradient-to-r from-sky-400 to-indigo-400 text-white"
                      : "text-[0.7rem] text-current/70"
                  }`}
                >
                  {mode === "dark" ? "Dark" : "Light"}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Hero layout */}
        <main className="grid flex-1 items-center gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
          {/* Left: hero text + controls */}
          <section className="space-y-8">
            {/* Badge + heading */}
            <div className="space-y-4">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-[0_0_30px_rgba(0,0,0,0.15)] ${
                  isDark
                    ? "border-orange-400/60 bg-orange-500/20 text-orange-50"
                    : "border-sky-400/60 bg-sky-100 text-sky-800"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isDark ? "bg-orange-400" : "bg-sky-500"
                  }`}
                />
                Sääohjattu koodimoodi
              </div>

              <div>
                <h1 className={`text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? "text-[#FFE7CC]" : "text-slate-900"}`}>
                  Viritä koodausmoodi
                  <span
                    className={`ml-2 bg-clip-text text-transparent ${
                      isDark
                        ? "bg-gradient-to-r from-orange-400 via-amber-300 to-pink-400"
                        : "bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400"
                    }`}
                  >
                    oikeaan fiilikseen
                  </span>
                  .
                </h1>
                <p
                  className={`mt-3 max-w-xl text-sm leading-relaxed sm:text-base ${
                    isDark ? "text-orange-100/80" : "text-slate-800"
                  }`}
                >
                  DevMood DJ yhdistää <span className="font-medium">sään, fiiliksen
                  ja Spotifyn soittolistat</span>. Valitse tämän hetken moodi — backend
                  hoitaa loput AWS Lambdassa ja palauttaa sopivan playlistin.
                </p>
              </div>
            </div>

            {/* Mood selector */}
            <div className="space-y-3">
              <p
                className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                  isDark ? "text-orange-200/70" : "text-slate-500"
                }`}
              >
                Mood
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {MOODS.map((mood) => {
                  const active = selectedMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => setSelectedMood(mood.id)}
                      className={[
                        "group flex flex-col items-start rounded-2xl border px-3.5 py-2.5 text-left text-sm transition",
                        active
                          ? isDark
                            ? "border-orange-400 bg-gradient-to-br from-orange-600/80 to-pink-500/70 text-[#1B0902] shadow-[0_0_30px_rgba(249,115,22,0.5)]"
                            : "border-sky-400 bg-gradient-to-br from-blue-50 to-sky-100 text-slate-900 shadow-[0_10px_35px_rgba(59,130,246,0.2)]"
                          : isDark
                            ? "border-orange-900/50 bg-black/40 text-orange-100 hover:border-orange-500/60 hover:bg-black/60"
                            : "border-slate-200 bg-white/70 text-slate-700 hover:border-blue-300 hover:bg-white"
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        <span>{mood.label}</span>
                        {active && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isDark ? "bg-black" : "bg-blue-500"
                            }`}
                          />
                        )}
                      </span>
                      <span
                        className={`mt-1 text-xs ${
                          isDark
                            ? "text-orange-200/70 group-hover:text-orange-100"
                            : "text-slate-600 group-hover:text-slate-700"
                        }`}
                      >
                        {mood.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City selector */}
            <div className="space-y-2">
              <p
                className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                  isDark ? "text-orange-200/70" : "text-slate-500"
                }`}
              >
                Kaupunki
              </p>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`w-full max-w-xs rounded-2xl border px-3 py-2 text-sm shadow-sm outline-none transition ${
                  isDark
                    ? "border-orange-900/70 bg-black/60 text-orange-100 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/70"
                    : "border-blue-200 bg-white text-slate-800 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/70"
                }`}
              >
                {CITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p
                className={`text-[0.7rem] ${
                  isDark ? "text-orange-200/70" : "text-slate-600"
                }`}
              >
                Valittua kaupunkia käytetään OpenWeather-kyselyssä.
              </p>
            </div>

            {/* Call to action + error */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleGetRecommendation}
                disabled={isLoading}
                className={[
                  "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-lg transition",
                  isDark
                    ? "focus-visible:ring-orange-400/70 focus-visible:ring-offset-[#050302]"
                    : "focus-visible:ring-sky-400/70 focus-visible:ring-offset-white",
                  "focus-visible:outline-none focus-visible:ring-2",
                  isLoading
                    ? isDark
                      ? "cursor-default bg-gradient-to-r from-orange-600/60 to-pink-500/60 text-[#2b0b01]"
                      : "cursor-default bg-gradient-to-r from-blue-200 to-sky-200 text-slate-600"
                    : isDark
                    ? "cursor-pointer bg-gradient-to-r from-orange-500 via-amber-400 to-pink-500 text-[#1B0902] hover:shadow-orange-500/40"
                    : "cursor-pointer bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 text-white hover:shadow-blue-300/40",
                ].join(" ")}
              >
                {isLoading ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-900/60 border-t-transparent" />
                    Haetaan suositusta…
                  </>
                ) : (
                  <>
                    Hae soittosuositus
                    <span className="text-base">↻</span>
                  </>
                )}
              </button>

              {error && (
                <div
                  className={`rounded-2xl border px-3 py-2 text-xs ${
                    isDark
                      ? "border-red-500/60 bg-red-500/10 text-red-100"
                      : "border-red-400/70 bg-red-100 text-red-800"
                  }`}
                >
                  {error}
                </div>
              )}
            </div>

            {/* Little “stats” row */}
            <div
              className={`mt-2 grid gap-3 text-xs ${
                isDark ? "text-orange-200/70" : "text-slate-500"
              } sm:grid-cols-3`}
            >
              <div
                className={`rounded-2xl px-3 py-2 border ${
                  isDark
                    ? "border-orange-900/60 bg-black/40"
                    : "border-blue-100 bg-white"
                }`}
              >
                <p className="text-[0.7rem] uppercase tracking-[0.2em]">
                  Stack
                </p>
                <p className={`mt-1 ${isDark ? "text-orange-100" : "text-slate-800"}`}>
                  React · Vite · Tailwind
                </p>
              </div>
              <div
                className={`rounded-2xl px-3 py-2 border ${
                  isDark
                    ? "border-orange-900/60 bg-black/40"
                    : "border-blue-100 bg-white"
                }`}
              >
                <p className="text-[0.7rem] uppercase tracking-[0.2em]">
                  Backend
                </p>
                <p className={`mt-1 ${isDark ? "text-orange-100" : "text-slate-800"}`}>
                  AWS Lambda · Function URL
                </p>
              </div>
              <div
                className={`rounded-2xl px-3 py-2 border ${
                  isDark
                    ? "border-orange-900/60 bg-black/40"
                    : "border-blue-100 bg-white"
                }`}
              >
                <p className="text-[0.7rem] uppercase tracking-[0.2em]">
                  Data
                </p>
                <p className={`mt-1 ${isDark ? "text-orange-100" : "text-slate-800"}`}>
                  OpenWeather · Spotify playlistit
                </p>
              </div>
            </div>
          </section>

          {/* Right: “card” with recommendation */}
          <section className="relative flex items-center justify-center">
            <div
              className={`pointer-events-none absolute -inset-8 rounded-[2.5rem] opacity-80 blur-3xl ${
                isDark
                  ? "bg-gradient-to-br from-orange-500/10 via-rose-500/5 to-transparent"
                  : "bg-gradient-to-br from-blue-200/40 via-white/60 to-transparent"
              }`}
            />
            <div
              className={`relative w-full max-w-sm rounded-[2.2rem] border px-6 py-6 backdrop-blur ${
                isDark
                  ? "border-orange-900/60 bg-black/70 text-orange-50 shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
                  : "border-blue-200 bg-white/80 text-slate-800 shadow-[0_40px_120px_rgba(148,163,184,0.45)]"
              }`}
            >
              <div
                className={`mb-4 flex items-center justify-between text-xs ${
                  isDark ? "text-orange-200/80" : "text-slate-500"
                }`}
              >
                <span className="uppercase tracking-[0.2em]">
                  Now playing
                </span>
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-1 ${
                    isDark ? "bg-orange-900/60" : "bg-blue-100"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isDark ? "bg-orange-400" : "bg-blue-500"
                    }`}
                  />
                  <span className="font-semibold text-[0.7rem]">
                    {recommendation ? "Suositus valmis" : "Odottaa pyyntöä"}
                  </span>
                </span>
              </div>

              <div
                className={`mb-4 rounded-2xl border p-4 ${
                  isDark
                    ? "border-orange-900/60 bg-gradient-to-br from-black/60 to-orange-950/60"
                    : "border-blue-100 bg-gradient-to-br from-sky-50 to-white"
                }`}
              >
                <p
                  className={`mb-1 text-[0.7rem] uppercase tracking-[0.2em] ${
                    isDark ? "text-orange-200/80" : "text-slate-500"
                  }`}
                >
                  Mood · Weather
                </p>
                <p className={`text-sm font-medium ${isDark ? "text-orange-50" : "text-slate-900"}`}>
                  {recommendation
                    ? `${recommendation.mood} · ${recommendation.weather}`
                    : "Ei vielä dataa – valitse moodi vasemmalta"}
                </p>
              </div>

              {recommendation ? (
                <div className="space-y-3">
                  <div>
                    <p
                      className={`text-[0.7rem] uppercase tracking-[0.2em] ${
                        isDark ? "text-orange-200/80" : "text-slate-500"
                      }`}
                    >
                      Playlist
                    </p>
                    <h2 className={`mt-1 text-lg font-semibold ${isDark ? "text-orange-50" : "text-slate-800"}`}>
                      {recommendation.playlistName || "Recommended playlist"}
                    </h2>
                    {recommendation.note && (
                      <p className={`mt-1 text-xs ${isDark ? "text-orange-100/80" : "text-slate-700"}`}>
                        {recommendation.note}
                      </p>
                    )}
                  </div>

                  {recommendation.playlistUrl && (
                    <a
                      href={recommendation.playlistUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold shadow-md ${
                        isDark
                          ? "bg-gradient-to-r from-orange-400 to-amber-300 text-[#1B0902] shadow-orange-900/60"
                          : "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-blue-200/60"
                      }`}
                    >
                      Avaa Spotifyssa
                      <span className="text-sm">↗</span>
                    </a>
                  )}
                </div>
              ) : (
                <p
                  className={`text-xs leading-relaxed ${
                    isDark ? "text-orange-200/80" : "text-slate-500"
                  }`}
                >
                  Kun haet suosituksen, tähän ilmestyy{" "}
                  <span className="text-slate-200">päivän DevMood-lista</span> –
                  sää, moodi ja soittolista samassa näkymässä.
                </p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
