import express, { json } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { usersRouter, notesRouter, authRouter } from "./routes";
import { sleep } from "./sleep.js";

const server = express();

server.use(
  cors({
    origin: "http://127.0.0.1:5174", 
    credentials: true,
  })
);

server.options("*", cors());
server.use(json());
server.use(cookieParser());
server.use(sleep([400, 1500]));
server.use("/users", usersRouter);
server.use("/notes", notesRouter);
server.use("/", authRouter);
server.listen(4000, () => {
  console.log("Server started on port 4000");
});
