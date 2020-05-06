import React, { useEffect } from "react";

const Video = (props) => {
  const { track } = props;
  const videoRef = React.createRef();

  useEffect(() => {
    if (track) videoRef.current.srcObject = track.stream;
    console.log("VIDEO_ADDED");
  }, [track, videoRef]);

  return <video ref={videoRef} autoPlay />;
};

export default Video;
