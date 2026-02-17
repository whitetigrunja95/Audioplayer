# Audioplayer (MVP)

Приложение “Аудиоплеер”: фронтенд + backend API.  
Функционал: регистрация/авторизация, список треков, избранное, плеер, перемотка и пагинация.

## Требования
- Node.js (LTS)
- npm

## Структура проекта
- `audioplayer/` — фронтенд (Vite + TypeScript + Redom)
- `express-backend/` — backend (Express + JWT + bcrypt) и раздача mp3

---

## 1) Запуск backend

```bash
cd express-backend
npm install
npm start
