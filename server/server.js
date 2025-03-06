const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const rooms = {}; // Store room data

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("create_room", (callback) => {
    const room = uuidv4().slice(0, 6);
    rooms[room] = {
      users: [],
      creator: socket.id,
      gameStarted: false,
      prompts: {},
      votes: {},
      totalVotes: 0,
      winner: null,
      aiResponse: null,
    };
    console.log(`Room created: ${room}`);
    if (typeof callback === "function") {
      callback(room);
    }
  });

  socket.on("join_room", ({ name, room }, callback) => {
    if (!rooms[room]) {
      if (typeof callback === "function") {
        callback({ success: false, message: "Invalid room code" });
      }
      return;
    }

    const isAlreadyInRoom = rooms[room].users.some((user) => user.id === socket.id);
    if (!isAlreadyInRoom) {
      rooms[room].users.push({ id: socket.id, name });
    }

    socket.join(room);
    io.to(room).emit("update_users", rooms[room].users);

    console.log(`${name} joined room ${room}`);

    if (typeof callback === "function") {
      callback({ success: true });
    }
  });

  socket.on("start_game", (room) => {
    if (rooms[room] && rooms[room].creator === socket.id) {
      rooms[room].gameStarted = true;
      io.to(room).emit("game_started");
      console.log(`Game started in room: ${room}`);
    }
  });

  socket.on("submit_prompt", ({ room, prompt }) => {
    if (rooms[room]) {
      if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
        console.error(`Invalid prompt received from ${socket.id}`);
        return;
      }

      rooms[room].prompts[socket.id] = { prompt, playerId: socket.id };

      console.log(`Prompt received from ${socket.id} in ${room}: "${prompt}"`);

      if (Object.keys(rooms[room].prompts).length === rooms[room].users.length) {
        io.to(room).emit("prompts_ready", Object.values(rooms[room].prompts));
      }
    }
  });

  socket.on("submit_vote", async ({ room, votedPrompt }) => {
    if (rooms[room]) {
      const promptEntry = Object.values(rooms[room].prompts).find(entry => entry.prompt === votedPrompt);
      if (!promptEntry) {
        console.error("Invalid vote, prompt not found");
        return;
      }

      const votedPlayerId = promptEntry.playerId;
      if (!rooms[room].votes[votedPlayerId]) {
        rooms[room].votes[votedPlayerId] = 0;
      }
      rooms[room].votes[votedPlayerId]++;
      rooms[room].totalVotes++;

      if (rooms[room].totalVotes === Object.keys(rooms[room].prompts).length) {
        let winnerId = Object.keys(rooms[room].votes).reduce((a, b) =>
          rooms[room].votes[a] > rooms[room].votes[b] ? a : b
        );

        let winnerPrompt = rooms[room].prompts[winnerId].prompt;
        let winnerName = rooms[room].users.find(user => user.id === winnerId)?.name || "Unknown";

        rooms[room].winner = winnerName;

        console.log(`Winner determined: ${winnerName} with prompt: "${winnerPrompt}"`);

        try {
          const response = await axios.post("http://127.0.0.1:5000/generate", { prompt: winnerPrompt });
          rooms[room].aiResponse = response.data.aiStory;
        } catch (error) {
          rooms[room].aiResponse = "Error generating story.";
          console.error("AI generation error:", error);
        }

        console.log(`Emitting show_ai_story to room: ${room}`);
        console.log(`AI Story Sent: ${rooms[room].aiResponse}`);
        console.log(` Winner Sent: ${rooms[room].winner}`);

        io.to(room).emit("show_ai_story", { 
          winner: rooms[room].winner, 
          aiStory: rooms[room].aiResponse 
        });
      }
    }
  });

  // Backup API: Fetch AI story if client missed the event
  app.get("/get_ai_story", (req, res) => {
    const { room } = req.query;
    if (rooms[room] && rooms[room].aiResponse) {
      return res.json({
        winner: rooms[room].winner,
        aiStory: rooms[room].aiResponse,
      });
    } else {
      return res.status(404).json({ error: "AI story not found for this room." });
    }
  });

  socket.on("next_to_results", (room) => {
    if (rooms[room] && socket.id === rooms[room].creator) {
      io.to(room).emit("go_to_results", { winner: rooms[room].winner });
    }
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room].users = rooms[room].users.filter((user) => user.id !== socket.id);
      io.to(room).emit("update_users", rooms[room].users);

      if (rooms[room].users.length === 0) {
        delete rooms[room];
      }
    }
    console.log(`User Disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
