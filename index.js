import http from 'node:http';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const PORT = Number(process.env.PORT ?? 3001);
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

const users = [];
const events = [];

const sendJson = (res, statusCode, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  });
  res.end(body);
};

const readBody = async (req) => {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    return {};
  }
};

const createToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (pathname === '/api/users' && req.method === 'POST') {
    const body = await readBody(req);
    const { name, email, password } = body;

    if (!name || !email || !password) {
      sendJson(res, 400, { message: 'name, email, and password are required' });
      return;
    }

    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      sendJson(res, 409, { message: 'User already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: randomUUID(),
      name,
      email,
      password: passwordHash
    };

    users.push(user);

    sendJson(res, 201, {
      message: 'User created successfully',
      user: { id: user.id, name: user.name, email: user.email }
    });
    return;
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await readBody(req);
    const { email, password } = body;

    if (!email || !password) {
      sendJson(res, 400, { message: 'email and password are required' });
      return;
    }

    const user = users.find((item) => item.email === email);
    if (!user) {
      sendJson(res, 401, { message: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      sendJson(res, 401, { message: 'Invalid credentials' });
      return;
    }

    sendJson(res, 200, {
      message: 'Login successful',
      token: createToken(user),
      user: { id: user.id, name: user.name, email: user.email }
    });
    return;
  }

  if (pathname === '/api/events' && req.method === 'GET') {
    sendJson(res, 200, { events });
    return;
  }

  if (pathname === '/api/events' && req.method === 'POST') {
    const body = await readBody(req);
    const { title, description, date } = body;

    if (!title || !description || !date) {
      sendJson(res, 400, { message: 'title, description, and date are required' });
      return;
    }

    const event = {
      id: randomUUID(),
      title,
      description,
      date
    };

    events.push(event);
    sendJson(res, 201, { message: 'Event created successfully', event });
    return;
  }

  sendJson(res, 404, { message: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
