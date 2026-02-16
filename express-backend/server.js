const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/audio", express.static(path.join(__dirname, "audio")));

const PORT = 8000;
const SECRET = "supersecretkey";

// ====== In-memory storage (MVP) ======
/** @type {{ username: string, passwordHash: string }[]} */
let users = [];
/** @type {Record<string, string[]>} favoritesByUser */
let favoritesByUser = {};

function isMp3(name) {
  return name.toLowerCase().endsWith(".mp3");
}

function safeId(str) {
  return Buffer.from(str).toString("base64url");
}

function prettyTitle(fileName) {
  return fileName.replace(/\.mp3$/i, "").replace(/^\d+\s*-\s*/g, "");
}

function buildTracks() {
  const audioDir = path.join(__dirname, "audio");
  if (!fs.existsSync(audioDir)) return [];

  const albums = fs
    .readdirSync(audioDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const result = [];

  for (const album of albums) {
    const albumDir = path.join(audioDir, album);

    const files = fs
      .readdirSync(albumDir, { withFileTypes: true })
      .filter((f) => f.isFile() && isMp3(f.name))
      .map((f) => f.name);

    for (const file of files) {
      const rel = `${album}/${file}`;


      const m = file.match(/^(\d+)/);
      const trackNumber = m ? parseInt(m[1], 10) : 9999;

      result.push({
        id: safeId(rel),
        title: prettyTitle(file),
        artist: "Михаил Подгайный",
        album,
        trackNumber,
        audioUrl: `http://127.0.0.1:${PORT}/audio/${encodeURI(rel)}`,
      });
    }

  }

  result.sort((a, b) => {
    if (a.album !== b.album) {
      return a.album.localeCompare(b.album, "ru");
    }
    return (a.trackNumber ?? 9999) - (b.trackNumber ?? 9999);
  });


  return result;
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "нет токена" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "нет токена" });

  try {
    const data = jwt.verify(token, SECRET);
    req.user = data.username;
    next();
  } catch {
    res.status(401).json({ message: "невалидный токен" });
  }
}

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ message: "username и password обязательны" });
  }

  const exists = users.some((u) => u.username === username);
  if (exists) {
    return res.status(400).json({ message: "пользователь уже существует" });
  }

  const passwordHash = await bcrypt.hash(password, 8);
  users.push({ username, passwordHash });
  favoritesByUser[username] = [];

  res.json({ message: "пользователь успешно добавлен", user: { username } });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res
      .status(400)
      .json({ message: "произошла ошибка при авторизации — неверные данные" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res
      .status(400)
      .json({ message: "произошла ошибка при авторизации — неверные данные" });
  }

  const token = jwt.sign({ username }, SECRET);
  res.json({ message: "авторизация прошла успешно", token });
});

app.get("/api/tracks", auth, (req, res) => {
  res.json(buildTracks());
});

app.get("/api/favorites", auth, (req, res) => {
  const trackIds = favoritesByUser[req.user] ?? [];
  const tracks = buildTracks();
  const favTracks = tracks.filter((t) => trackIds.includes(t.id));
  res.json(favTracks);
});

app.post("/api/favorites", auth, (req, res) => {
  const { trackId } = req.body ?? {};
  if (!trackId) return res.status(400).json({ message: "trackId обязателен" });

  const tracks = buildTracks();
  const track = tracks.find((t) => t.id === trackId);
  if (!track) return res.status(404).json({ message: "трек не найден" });

  const list = favoritesByUser[req.user] ?? [];
  if (!list.includes(trackId)) list.push(trackId);
  favoritesByUser[req.user] = list;

  res.json({ message: "композиция добавлена в избранное" });
});

app.delete("/api/favorites", auth, (req, res) => {
  const { trackId } = req.body ?? {};
  if (!trackId) return res.status(400).json({ message: "trackId обязателен" });

  const list = favoritesByUser[req.user] ?? [];
  favoritesByUser[req.user] = list.filter((id) => id !== trackId);

  res.json({ message: "композиция убрана из избранного" });
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
