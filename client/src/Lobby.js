import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "./socket";

const Lobby = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {}; // Ensure state is not null
  const { name, room, isCreator } = state;
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!name || !room) {
      navigate("/"); // Redirect to EnterName.js if missing data
      return;
    }

    socket.emit("join_room", { name, room }, (response) => {
      if (!response.success) {
        navigate("/");
      }
    });

    socket.on("update_users", (users) => {
      setPlayers([...new Map(users.map(user => [user.id, user])).values()]); // Prevent duplicate names
    });

    socket.on("game_started", () => {
      navigate("/game", { state: { name, room } });
    });

    return () => socket.off("update_users");
  }, [navigate, name, room]);

  const startGame = () => {
    socket.emit("start_game", room);
  };

  return (
    <div>
      <h2>Lobby - Game Code: {room || "Unknown"}</h2>
      <h3>Players:</h3>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player.name}</li>
        ))}
      </ul>
      {isCreator && <button onClick={startGame}>Start Game</button>}
    </div>
  );
};

export default Lobby;
