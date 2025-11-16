// index.mjs – DevMood DJ Lambda (Node 22, ESM)

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


function mapWeatherToBucket(main) {
  const m = (main || "").toLowerCase();

  if (m.includes("rain") || m.includes("drizzle") || m.includes("thunder")) {
    return "Rain";
  }
  if (m.includes("cloud")) {
    return "Clouds";
  }
  if (m.includes("snow")) {
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

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=metric&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("OpenWeather status:", res.status, await res.text());
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

let cachedSpotifyToken = null;
let cachedSpotifyTokenExpiresAt = 0;

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("Spotify client id/secret puuttuu, käytetään fallback-playlistejä.");
    return null;
  }

  const now = Date.now();
  if (cachedSpotifyToken && now < cachedSpotifyTokenExpiresAt - 60_000) {
    return cachedSpotifyToken;
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) {
      console.error("Spotify token status:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const expiresInSec = data.expires_in || 3600;
    cachedSpotifyToken = data.access_token;
    cachedSpotifyTokenExpiresAt = Date.now() + expiresInSec * 1000;

    console.log("Spotify token fetched, expires in", expiresInSec, "s");
    return cachedSpotifyToken;
  } catch (err) {
    console.error("Spotify token error:", err);
    return null;
  }
}

async function searchSpotifyPlaylists(query, limit = 10) {
  const token = await getSpotifyAccessToken();
  if (!token) return [];

  const url = `https://api.spotify.com/v1/search?${new URLSearchParams({
    q: query,
    type: "playlist",
    limit: String(limit),
  }).toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Spotify search status:", res.status, text);
      return [];
    }

    const data = await res.json();
    const items = data.playlists?.items || [];
    if (!items.length) return [];

    const shuffled = items.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    return selected.map((pl) => ({
      name: pl.name,
      url: pl.external_urls?.spotify || "",
      imageUrl: pl.images?.[0]?.url || null,
      owner: pl.owner?.display_name || null,
    }));
  } catch (err) {
    console.error("Spotify search error:", err);
    return [];
  }
}

function choosePlaylistFallback(mood, weatherBucket) {
  const normalizedMood = mood || "DeepFocus";
  const normalizedWeather = weatherBucket || "Clear";

  const weatherBlock = PLAYLISTS[normalizedWeather] || PLAYLISTS.Clear;
  const recommendation =
    weatherBlock[normalizedMood] || weatherBlock.DeepFocus;

  return {
    mood: normalizedMood,
    weather: normalizedWeather,
    playlistName: recommendation.name,
    playlistUrl: recommendation.url,
    note: recommendation.note,
  };
}

async function buildRecommendation(mood, weatherBucket) {
  const fallback = choosePlaylistFallback(mood, weatherBucket);

  const hintsByWeather =
    SPOTIFY_QUERY_HINTS[weatherBucket] || SPOTIFY_QUERY_HINTS.Clear;
  const query =
    hintsByWeather[mood] ||
    `${mood} coding playlist ${weatherBucket.toLowerCase()} weather`;

  try {
    const spotifyResults = await searchSpotifyPlaylists(query, 10);

    if (!spotifyResults || spotifyResults.length === 0) {
      console.warn("Spotify search returned no playlists, using fallback.");
      return {
        ...fallback,
        source: "fallback",
        options: [
          {
            name: fallback.playlistName,
            url: fallback.playlistUrl,
            imageUrl: null,
          },
        ],
      };
    }

    const first = spotifyResults[0];

    return {
      ...fallback,
      source: "spotify",
      playlistName: first.name,
      playlistUrl: first.url || fallback.playlistUrl,
      options: spotifyResults, // max 3 vaihtoehtoa
    };
  } catch (err) {
    console.error("buildRecommendation error:", err);
    return {
      ...fallback,
      source: "fallback",
      options: [
        {
          name: fallback.playlistName,
          url: fallback.playlistUrl,
          imageUrl: null,
        },
      ],
    };
  }
}

export const handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event));

  const headers = {
    "Content-Type": "application/json",
  };

  let mood = "DeepFocus";
  let cityFromRequest = undefined;

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
