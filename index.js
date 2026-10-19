import express from "express";
import http from 'http';
import { Server } from 'socket.io';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;
const users = []; 

// Middleware to serve static files (HTML, CSS, JS) from a "public" folder

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/main", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

app.post("/logout", (req, res) => {
  res.redirect("/login.html");
});

app.post("/signup", (req, res) => {
  const { username, password, email } = req.body;
  users.push({ username, password, email });
  res.redirect("/login.html");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const existingUser = users.find(
    (user) => user.username === username || user.email === username
  );

  if (!existingUser) {
    // Redirect with error=notfound
    return res.redirect("/login?error=notfound");
  }

  if (existingUser.password !== password) {
    // Redirect with error=wrongpassword
    return res.redirect("/login?error=wrongpassword");
  }

  res.redirect("/main?username=" + encodeURIComponent(existingUser.username));
});

// Socket.io real-time connection
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket!');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // Broadcasts message to everyone
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });
});

// Change app.listen to server.listen so sockets work!
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});