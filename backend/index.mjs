// index.mjs – DevMood DJ Lambda (Node 22, ESM)
// Provides a recommendation that mixes mood + weather data + Spotify search.

const PLAYLISTS = {
  Clear: {
    DeepFocus: {
      name: "Sunny Deep Focus",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
      note: "Aurinkoista, kirkasta ja keskittynyttä koodausta varten.",
    },
    LightCoding: {
      name: "Sunny Light Coding",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX9sIqqvKsjG8",
      note: "Kevyttä koodailua hyvällä fiiliksellä.",
    },
    Motivation: {
      name: "Sunny Motivation",
      url: "https://open.spotify.com/playlist/37i9dQZF1DXa2SPUyWl8Y5",
      note: "Energiaa ja boostia hyvään päivään.",
    },
    FeelGood: {
      name: "Sunny Feel Good",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0",
      note: "Hyvän mielen kappaleita aurinkoisiin hetkiin.",
    },
  },
  Rain: {
    DeepFocus: {
      name: "Rainy Deep Focus",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
      note: "Sadepäivän syväkeskitykseen – lo-fi ja ambient.",
    },
    LightCoding: {
      name: "Rainy Light Coding",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWZu0D7Y8cY0P",
      note: "Rauhallista taustamusiikkia tihkusateeseen.",
    },
    Motivation: {
      name: "Rainy Motivation",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX1g0iEXLFycr",
      note: "Kun sataa ja pitäisi silti saada asioita tehtyä.",
    },
    FeelGood: {
      name: "Rainy Feel Good",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX3YSRoSdA634",
      note: "Nosta fiilistä harmaan sään keskellä.",
    },
  },
  Clouds: {
    DeepFocus: {
      name: "Cloudy Deep Focus",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U",
      note: "Pilviselle päivälle tasainen fokustila.",
    },
    LightCoding: {
      name: "Cloudy Light Coding",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS",
      note: "Koodailuun, kun fiilis on neutraali mutta tekemistä riittää.",
    },
    Motivation: {
      name: "Cloudy Motivation",
      url: "https://open.spotify.com/playlist/37i9dQZF1DXcCnTAt8CfNe",
      note: "Pientä potkua pilviseen päivään.",
    },
    FeelGood: {
      name: "Cloudy Feel Good",
      url: "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC",
      note: "Hyvän mielen poppia pilvisellekin päivälle.",
    },
  },
};

const SPOTIFY_QUERY_HINTS = {
  Clear: {
    DeepFocus: "deep focus coding sunny",
    LightCoding: "uplifting coding playlist",
    Motivation: "motivational programming songs",
    FeelGood: "feel good coding music",
  },
  Rain: {
    DeepFocus: "lofi rain coding focus",
    LightCoding: "rainy day programming chill",
    Motivation: "rainy day motivation coding",
    FeelGood: "rainy day feel good songs",
  },
  Clouds: {
    DeepFocus: "ambient cloudy day focus",
    LightCoding: "cloudy day coding playlist",
    Motivation: "cloudy day motivation music",
    FeelGood: "cloudy feel good pop",
  },
};

function mapWeatherToBucket(main) {
  const normalized = (main || "").toLowerCase();
  if (normalized.includes("rain") || normalized.includes("drizzle") || normalized.includes("thunder")) {
    return "Rain";
  }
  if (normalized.includes("cloud") || normalized.includes("snow")) {
    return "Clouds";
  }
  return "Clear";
}

async function getCurrentWeatherBucket(cityFromRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const fallbackCityEnv = process.env.OPENWEATHER_CITY;
  const city = cityFromRequest || fallbackCityEnv || "Helsinki,FI";

  if (!apiKey) {
    console.warn("OPENWEATHER_API_KEY puuttuu, palautetaan Clear.");
    return "Clear";
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text();
      console.error("OpenWeather status:", res.status, body);
      return "Clear";
    }

    const data = await res.json();
    const main = data.weather?.[0]?.main || "Clear";
    const bucket = mapWeatherToBucket(main);
    console.log("OpenWeather city:", city, "main:", main, "=> bucket:", bucket);
    return bucket;
  } catch (err) {
    console.error("OpenWeather error:", err);
    return "Clear";
  }
}

function choosePlaylistFallback(mood, weatherBucket) {
  const normalizedMood = mood || "DeepFocus";
  const normalizedWeather = weatherBucket || "Clear";

  const weatherBlock = PLAYLISTS[normalizedWeather] || PLAYLISTS.Clear;
  const recommendation = weatherBlock[normalizedMood] || weatherBlock.DeepFocus;

  return {
    mood: normalizedMood,
    weather: normalizedWeather,
    playlistName: recommendation.name,
    playlistUrl: recommendation.url,
    note: recommendation.note,
  };
}

let cachedSpotifyToken;
let tokenExpiresAt = 0;

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("Spotify client id/secret puuttuu, käytetään fallback-playlistejä.");
    return null;
  }

  const now = Date.now();
  if (cachedSpotifyToken && now < tokenExpiresAt) {
    return cachedSpotifyToken;
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const body = new URLSearchParams({ grant_type: "client_credentials" });

  console.log("Requesting Spotify access token…");
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Spotify token status:", res.status, text);
      return null;
    }

    const json = await res.json();
    cachedSpotifyToken = json.access_token;
    tokenExpiresAt = now + (json.expires_in - 30) * 1000; // refresh 30s early
    return cachedSpotifyToken;
  } catch (err) {
    console.error("Spotify token error:", err);
    return null;
  }
}

async function searchSpotifyPlaylist(query) {
  const token = await getSpotifyAccessToken();
  if (!token) return null;

  const url = `https://api.spotify.com/v1/search?${new URLSearchParams({
    q: query,
    type: "playlist",
    limit: "1",
  })}`;

  console.log("Spotify search query:", query);
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Spotify search status:", res.status, text);
      return null;
    }

    const data = await res.json();
    const playlist = data.playlists?.items?.[0];
    if (!playlist) {
      console.warn("Spotify search returned no playlists for query:", query);
      return null;
    }

    return {
      name: playlist.name,
      url: playlist.external_urls?.spotify || "",
    };
  } catch (err) {
    console.error("Spotify search error:", err);
    return null;
  }
}

async function buildRecommendation(mood, weatherBucket) {
  const fallback = choosePlaylistFallback(mood, weatherBucket);

  const hintsByWeather = SPOTIFY_QUERY_HINTS[weatherBucket] || SPOTIFY_QUERY_HINTS.Clear;
  const query =
    hintsByWeather[mood] || `${mood} coding playlist ${weatherBucket.toLowerCase()} weather`;

  try {
    const spotifyResult = await searchSpotifyPlaylist(query);

    if (!spotifyResult) {
      console.warn("Spotify search failed/empty, using fallback.");
      return {
        ...fallback,
        source: "fallback",
      };
    }

    return {
      ...fallback,
      source: "spotify",
      playlistName: spotifyResult.name,
      playlistUrl: spotifyResult.url || fallback.playlistUrl,
    };
  } catch (err) {
    console.error("buildRecommendation Spotify error:", err);
    return {
      ...fallback,
      source: "fallback",
    };
  }
}

export const handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event));

  const headers = {
    "Content-Type": "application/json",
  };

  let mood = "DeepFocus";
  let cityFromRequest;

  try {
    if (event.body) {
      const parsed = JSON.parse(event.body);
      if (typeof parsed.mood === "string") {
        mood = parsed.mood;
      }
      if (typeof parsed.city === "string") {
        cityFromRequest = parsed.city;
      }
    }
  } catch (err) {
    console.error("Body parse error:", err);
  }

  const weatherBucket = await getCurrentWeatherBucket(cityFromRequest);
  const responseBody = await buildRecommendation(mood, weatherBucket);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(responseBody),
  };
};
