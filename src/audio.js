import React, { useEffect } from "react";

const Audio = (props) => {
  const { track } = props;
  const audioRef = React.createRef();

  useEffect(() => {
    if (track) audioRef.current.srcObject = track.stream;
    console.log("AUDIO_ADDED");
  }, [track, audioRef]);

  return <audio ref={audioRef} autoPlay />;
};

export default Audio;
