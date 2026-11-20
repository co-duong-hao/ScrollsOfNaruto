import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  createGame,
  useCard,
  endTurn,
  pickBotAction,
  sanitizeStateFor,
} from '../shared/engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static(path.join(ROOT, 'public')));
app.use('/shared', express.static(path.join(ROOT, 'shared')));

app.get('/health', (_req, res) => {
  res.json({ ok: true, rooms: rooms.size });
});

app.get('/rulebook', (_req, res) => {
  res.sendFile(path.join(ROOT, 'docs', 'RULEBOOK.md'));
});

const rooms = new Map();

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function broadcastLobby(room) {
  const payload = {
    code: room.code,
    hostId: room.hostId,
    bots: room.bots,
    started: !!room.game,
    players: room.players.map((p) => ({ id: p.uid, name: p.name })),
  };
  room.players.forEach((p) => {
    io.to(p.socketId).emit('room:lobby', payload);
  });
}

function broadcastState(room, fx = null) {
  const G = room.game;
  if (!G) return;
  room.players.forEach((p) => {
    io.to(p.socketId).emit('game:state', {
      state: sanitizeStateFor(G, p.uid),
      fx,
      you: p.uid,
    });
  });
}

function askOnlineAuto(room, playerIdx, card, info) {
  const G = room.game;
  const target = G?.ps[playerIdx];
  const player = target && room.players.find((p) => p.uid === target.uid);
  if (!player) return Promise.resolve(true);

  return new Promise((resolve) => {
    const sock = io.sockets.sockets.get(player.socketId);
    if (!sock) return resolve(true);
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      sock.off('game:autoReply', onReply);
      resolve(true);
    }, 20000);
    const onReply = ({ allow } = {}) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(!!allow);
    };
    sock.once('game:autoReply', onReply);
    sock.emit('game:askAuto', { card, info });
  });
}

function scheduleBotIfNeeded(room) {
  const G = room.game;
  if (!G || G.over || room.resolving) return;
  const cur = G.ps[G.cur];
  if (!cur || !cur.bot) return;

  if (room.botTimer) clearTimeout(room.botTimer);
  room.botTimer = setTimeout(async () => {
    if (!room.game || room.game.over || room.resolving) return;
    const p = room.game.ps[room.game.cur];
    if (!p || !p.bot) return;

    room.resolving = true;
    try {
      const act = pickBotAction(room.game);
      if (act.type === 'end') {
        await endTurn(room.game);
        broadcastState(room, null);
        scheduleBotIfNeeded(room);
      } else {
        const res = await useCard(room.game, act.index, act.target, act.hitList);
        if (res.ok) {
          broadcastState(room, res.events);
          const hasCast = res.events.some((e) => e.k === 'cast');
          setTimeout(() => scheduleBotIfNeeded(room), hasCast ? 2900 : 1400);
        } else {
          await endTurn(room.game);
          broadcastState(room, null);
          scheduleBotIfNeeded(room);
        }
      }
    } finally {
      room.resolving = false;
    }
  }, 1500);
}

io.on('connection', (socket) => {
  const uid = socket.id;
  let currentRoomCode = null;

  const leaveCurrentRoom = () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    currentRoomCode = null;
    if (!room) return;

    const idx = room.players.findIndex((p) => p.uid === uid);
    if (idx >= 0) {
      const [removed] = room.players.splice(idx, 1);
      if (room.game) {
        const gp = room.game.ps.find((p) => p.uid === uid);
        if (gp && !gp.dead) {
          gp.bot = true;
          gp.name = `${gp.name} (Bot)`;
          room.game.log.push(`🤖 ${removed.name} đã rời trận, Bot tiếp quản.`);
          broadcastState(room, null);
          scheduleBotIfNeeded(room);
        }
      }
    }

    if (room.players.length === 0) {
      if (room.botTimer) clearTimeout(room.botTimer);
      rooms.delete(room.code);
      return;
    }

    if (room.hostId === uid) {
      room.hostId = room.players[0].uid;
    }
    if (!room.game) {
      broadcastLobby(room);
    }
  };

  socket.on('room:create', ({ name } = {}, cb) => {
    leaveCurrentRoom();
    const cleanName = String(name || 'Ninja').trim().slice(0, 16) || 'Ninja';
    const code = makeCode();
    const room = {
      code,
      hostId: uid,
      bots: 0,
      players: [{ uid, socketId: socket.id, name: cleanName }],
      game: null,
      botTimer: null,
    };
    rooms.set(code, room);
    currentRoomCode = code;
    broadcastLobby(room);
    cb?.({ ok: true, code, uid });
  });

  socket.on('room:join', ({ code, name } = {}, cb) => {
    leaveCurrentRoom();
    const cleanCode = String(code || '').trim().toUpperCase();
    const room = rooms.get(cleanCode);
    if (!room) return cb?.({ ok: false, error: 'Không tìm thấy phòng này.' });
    if (room.game) return cb?.({ ok: false, error: 'Trận đấu đã bắt đầu.' });
    if (room.players.length + room.bots >= 6) return cb?.({ ok: false, error: 'Phòng đã đầy (tối đa 6 người).' });

    const cleanName = String(name || 'Ninja').trim().slice(0, 16) || 'Ninja';
    room.players.push({ uid, socketId: socket.id, name: cleanName });
    currentRoomCode = cleanCode;
    broadcastLobby(room);
    cb?.({ ok: true, code: cleanCode, uid });
  });

  socket.on('room:setBots', ({ bots } = {}) => {
    const room = rooms.get(currentRoomCode);
    if (!room || room.hostId !== uid || room.game) return;
    const maxBots = Math.max(0, 6 - room.players.length);
    room.bots = Math.min(maxBots, Math.max(0, Number(bots) || 0));
    broadcastLobby(room);
  });

  socket.on('room:start', async () => {
    const room = rooms.get(currentRoomCode);
    if (!room || room.hostId !== uid || room.game) return;
    const total = room.players.length + room.bots;
    if (total < 2 || total > 6) return;

    const humans = room.players.map((p) => ({ uid: p.uid, name: p.name, bot: false }));
    const bots = Array.from({ length: room.bots }, (_, i) => ({ name: `Bot ${i + 1}`, bot: true }));
    const all = [...humans, ...bots].sort(() => Math.random() - 0.5);

    room.game = await createGame(all, {
      online: true,
      onAskAuto: (playerIdx, card, info) => askOnlineAuto(room, playerIdx, card, info),
    });
    broadcastState(room, null);
    scheduleBotIfNeeded(room);
  });

  socket.on('game:use', async ({ index, target, hitList } = {}) => {
    const room = rooms.get(currentRoomCode);
    if (!room || !room.game || room.game.over || room.resolving) return;
    const G = room.game;
    const cur = G.ps[G.cur];
    if (!cur || cur.bot || cur.uid !== uid) return;

    room.resolving = true;
    try {
      const res = await useCard(G, index, target, hitList);
      if (!res.ok) {
        socket.emit('game:error', res.error);
        return;
      }
      broadcastState(room, res.events);
      if (G.ps[G.cur]?.bot) {
        const hasCast = res.events.some((e) => e.k === 'cast');
        setTimeout(() => scheduleBotIfNeeded(room), hasCast ? 2900 : 1400);
      }
    } finally {
      room.resolving = false;
    }
  });

  socket.on('game:end', async () => {
    const room = rooms.get(currentRoomCode);
    if (!room || !room.game || room.game.over || room.resolving) return;
    const G = room.game;
    const cur = G.ps[G.cur];
    if (!cur || cur.bot || cur.uid !== uid) return;

    room.resolving = true;
    try {
      await endTurn(G);
      broadcastState(room, null);
      scheduleBotIfNeeded(room);
    } finally {
      room.resolving = false;
    }
  });

  socket.on('room:leave', leaveCurrentRoom);
  socket.on('disconnect', leaveCurrentRoom);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Scrolls of Naruto server running at http://localhost:${PORT}`);
});
