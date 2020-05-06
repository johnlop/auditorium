import JitsiMeetJS from "lib-jitsi-meet-dist";

export const initConference = (addVideo) => {
  const options = {
    hosts: {
      domain: "meet.jit.si",
      muc: "conference.meet.jit.si",
      focus: "focus.meet.jit.si",
    },
    externalConnectUrl: "https://meet.jit.si/http-pre-bind",
    enableP2P: true,
    p2p: {
      enabled: true,
      preferH264: true,
      disableH264: true,
      useStunTurn: true,
    },
    useStunTurn: true,
    bosh: `https://meet.jit.si/http-bind?room=myrandomtest`,
    websocket: "wss://meet.jit.si/xmpp-websocket",
    clientNode: "http://jitsi.org/jitsimeet",
  };
  let localTracks = [];
  let room = null;
  let joined = false;

  JitsiMeetJS.init();
  JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
  var connection = new JitsiMeetJS.JitsiConnection(null, null, options);

  const onConferenceJoined = () => {
    console.log("CONFERENCE_JOINED");
    joined = true;
  };

  const onRemoteTrack = (track) => {
    console.log("REMOTE_TRACK", track);
    addVideo(track);
  };

  const onLocalTracks = (tracks) => {
    console.log("LOCAL_TRACKS", tracks);
    localTracks = tracks;
    for (let i = 0; i < localTracks.length; i++) {
      localTracks[i].addEventListener(
        JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
        (audioLevel) => console.log(`Audio Level local: ${audioLevel}`)
      );
      localTracks[i].addEventListener(
        JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
        () => console.log("local track muted")
      );
      localTracks[i].addEventListener(
        JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
        () => console.log("local track stoped")
      );
      localTracks[i].addEventListener(
        JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
        (deviceId) =>
          console.log(`track audio output device was changed to ${deviceId}`)
      );
      if (localTracks[i].getType() === "video") {
        addVideo(localTracks[i]);
      } else {
      }
      if (joined) {
        room.addTrack(localTracks[i]);
      }
    }
  };

  const onConnectionSuccess = () => {
    console.log("CONNECTION_ESTABLISHED");
    room = connection.initJitsiConference("myrandomtest", {
      openBridgeChannel: true,
    });
    console.log("userId", room.myUserId());
    room.on(
      JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      onConferenceJoined
    );
    room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
    room.on(JitsiMeetJS.errors.conference.CONNECTION_ERROR, () =>
      console.log("CONNECTION_ERROR")
    );
    room.on(JitsiMeetJS.errors.conference.SETUP_FAILED, () =>
      console.log("SETUP_FAILED")
    );
    room.on(JitsiMeetJS.errors.conference.AUTHENTICATION_REQUIRED, () =>
      console.log("AUTHENTICATION_REQUIRED")
    );
    room.on(JitsiMeetJS.errors.conference.PASSWORD_REQUIRED, () =>
      console.log("PASSWORD_REQUIRED")
    );
    room.on(JitsiMeetJS.errors.conference.PASSWORD_NOT_SUPPORTED, () =>
      console.log("PASSWORD_NOT_SUPPORTED")
    );
    room.on(JitsiMeetJS.errors.conference.VIDEOBRIDGE_NOT_AVAILABLE, () =>
      console.log("VIDEOBRIDGE_NOT_AVAILABLE")
    );
    room.on(JitsiMeetJS.errors.conference.RESERVATION_ERROR, () =>
      console.log("RESERVATION_ERROR")
    );
    room.on(JitsiMeetJS.errors.conference.GRACEFUL_SHUTDOWN, () =>
      console.log("GRACEFUL_SHUTDOWN")
    );
    room.on(JitsiMeetJS.errors.conference.JINGLE_FATAL_ERROR, () =>
      console.log("JINGLE_FATAL_ERROR")
    );
    room.on(JitsiMeetJS.errors.conference.CONFERENCE_DESTROYED, () =>
      console.log("CONFERENCE_DESTROYED")
    );
    room.on(JitsiMeetJS.errors.conference.CHAT_ERROR, () =>
      console.log("CHAT_ERROR")
    );
    room.on(JitsiMeetJS.errors.conference.FOCUS_DISCONNECTED, () =>
      console.log("FOCUS_DISCONNECTED")
    );
    room.join();
  };

  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onConnectionSuccess
  );

  connection.connect();
  JitsiMeetJS.createLocalTracks({ devices: ["audio", "video"] }).then(
    onLocalTracks
  );
};
