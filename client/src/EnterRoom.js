import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./socket"; // Ensure this import exists

function EnterRoom() {
  const [room, setRoom] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Ensure username is available
  const userName = localStorage.getItem("userName");

  if (!userName) {
    navigate("/"); // Redirect back if no username is set
    return null; // Prevent further rendering
  }

  const handleCreateRoom = () => {
    socket.emit("create_room", (newRoom) => {
      navigate("/lobby", { state: { name: userName, room: newRoom, isCreator: true } });
    });
  };

  const handleJoinRoom = () => {
    if (room.trim() === "") {
      setErrorMessage("Please enter a room code.");
      return;
    }

    socket.emit("join_room", { name: userName, room }, (response) => {
      if (response.success) {
        navigate("/lobby", { state: { name: userName, room, isCreator: false } });
      } else {
        setErrorMessage(response.message);
      }
    });
  };

  return (
    <div>
      <h2>Join or Create a Game</h2>

      <button onClick={handleCreateRoom}>Create Game</button>

      <h3>Or Join a Game</h3>
      <input
        type="text"
        placeholder="Enter game code"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button onClick={handleJoinRoom}>Join Room</button>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
}

export default EnterRoom;
