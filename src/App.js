import React, { useState } from "react";
import Connection from "./connection";
import Video from "./video.js";
import Audio from "./audio.js";

const App = () => {
  const [room, setRoom] = useState("myrandomtest");
  const [name, setName] = useState("Jon");
  const [videos, setVideos] = useState([]);

  const addVideo = (track, type) => {
    const id = videos.length;
    const newVid = <Video track={track} key={id} />;
    setVideos(videos.concat([newVid]));
  };

  const addAudio = (track, type) => {
    const id = videos.length;
    const newVid = <Audio track={track} key={id} />;
    setVideos(videos.concat([newVid]));
  };

  const handleClick = (event) => {
    event.preventDefault();
    if (room && name) Connection(room, name, addVideo, addAudio);
  };

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
        <button onClick={handleClick} type="submit">
          GO
        </button>
      </form>
      {videos}
    </>
  );
};

export default App;
