# Audioplayer (MVP)

## Описание
Приложение «Аудиоплеер»: фронтенд + backend API.  
Функционал: регистрация/авторизация, список треков, избранное, плеер, перемотка и пагинация.

## Требования
- Node.js (LTS)
- npm

## Структура проекта
- `audioplayer/` — фронтенд (Vite + TypeScript + Redom)
- `express-backend/` — backend (Express + JWT + bcrypt) и раздача mp3

## Запуск backend

```bash
cd express-backend
npm install
npm start
```

## Запуск frontend

```bash
cd audioplayer
npm install
npm run dev
```

## Использование

### Шаги
1. Зарегистрироваться  
2. Авторизоваться  
3. Перейти на страницу «Треки»

### Возможности
- Поиск по названию, альбому и артисту  
- Сортировка по названию и альбому  
- Добавление в избранное  
- Плеер с перемоткой ±10 секунд  
- Пагинация
