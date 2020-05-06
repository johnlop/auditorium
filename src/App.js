import React, { useState, useEffect } from "react";
import { initConference } from "./init.js";
import Video from "./video.js";

const App = () => {
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [call, setCall] = useState(false);
  const [password, setPassword] = useState("");
  const [videos, setVideos] = useState(null);

  const handleClick = (event) => {
    event.preventDefault();
    if (room && name) setCall(true);
  };

  useEffect(() => {
    const addVideo = (track) => {
      // const newVid = <Video track={track} />;
      setVideos(track);
    };
    initConference(addVideo);
  }, []);

  return (
    <>
      <form>
        <input
          id="room"
          type="text"
          placeholder="Room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <input
          id="name"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          id="password"
          type="text"
          placeholder="Password (optional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleClick} type="submit">
          Start / Join
        </button>
      </form>
      <Video track={videos}></Video>
    </>
  );
};

export default App;
