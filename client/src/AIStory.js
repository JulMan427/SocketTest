import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "./socket";
import axios from "axios"; // Allow fetching AI story if event is missed

const AIStory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { room } = location.state || {};

  const [aiStory, setAiStory] = useState("Loading AI response...");
  const [winner, setWinner] = useState("Unknown");
  const [eventReceived, setEventReceived] = useState(false);

  // Fetch AI story from server if event is missed
  const fetchAIStory = async () => {
    try {
      console.log("Fetching AI story from server...");
      const response = await axios.get(`http://localhost:3001/get_ai_story?room=${room}`);
      if (response.data) {
        setWinner(response.data.winner || "Unknown");
        setAiStory(response.data.aiStory || "No AI response received.");
        setEventReceived(true);
        console.log("AI story retrieved from server.");
      }
    } catch (error) {
      console.error("Error fetching AI story:", error);
    }
  };

  useEffect(() => {
    console.log(" AIStory.js mounted. Waiting for show_ai_story event...");

    socket.on("show_ai_story", ({ winner, aiStory }) => {
      console.log(" Received show_ai_story event!");
      console.log(`Winner Received: ${winner}`);
      console.log(`AI Story Received: ${aiStory}`);

      setWinner(winner);
      setAiStory(aiStory || "No AI response received.");
      setEventReceived(true);
    });

    // Fetch AI story from server if event was missed
    setTimeout(() => {
      if (!eventReceived) {
        console.log(" show_ai_story event not received. Trying to fetch data...");
        fetchAIStory();
      }
    }, 2000); // Wait 2 seconds before fetching

    return () => {
      console.log(" Cleaning up event listener for show_ai_story.");
      socket.off("show_ai_story");
    };
  }, []);

  return (
    <div>
      <h2>AI Generated Story</h2>
      <p>{eventReceived ? aiStory : "Loading..."}</p>
      <h3>Winning Player: {winner}</h3>
    </div>
  );
};

export default AIStory;
