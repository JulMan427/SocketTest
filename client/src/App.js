import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EnterName from "./EnterName";
import EnterRoom from "./EnterRoom";
import Lobby from "./Lobby";
import Game from "./Game";
import Voting from "./Voting";
import AIStory from "./AIStory";
import Results from "./Results";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EnterName />} />
        <Route path="/enter-room" element={<EnterRoom />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/ai-story" element={<AIStory />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}

export default App;
