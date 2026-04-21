import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { createSession, getSession, destroySession } from "./sessionManager.js";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static("src"));

app.post("/api/session", async (_req, res) => {
  const session = await createSession();
  await session.page.goto("about:blank");
  res.json({ sessionId: session.id, viewerUrl: `/viewer.html?sessionId=${session.id}` });
});

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, "http://localhost");
  const sessionId = url.searchParams.get("sessionId");
  const session = getSession(sessionId);

  if (!session) return ws.close();

  let active = true;

  const loop = async () => {
    while (active && ws.readyState === ws.OPEN) {
      const buf = await session.page.screenshot({ type: "jpeg", quality: 60 });
      ws.send(JSON.stringify({ type: "frame", data: buf.toString("base64") }));
      await new Promise(r => setTimeout(r, 300));
    }
  };

  ws.on("close", () => active = false);
  loop();
});

server.listen(3000, () => console.log("Started on 3000"));
