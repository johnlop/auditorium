import JitsiMeetJS from "lib-jitsi-meet-dist";

export const initConference = () => {
  const options = {
    hosts: {
      domain: "meet.jit.si",
      muc: "meet.jit.si",
    },
    serviceUrl: "wss://meet.jit.si/xmpp-websocket",
    useStunTurn: false,
  };
  JitsiMeetJS.init();
  JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
  var connection = new JitsiMeetJS.JitsiConnection(null, null, options);

  const onConferenceJoined = () => {
    console.log("CONFERENCE_JOINED");
  };

  const onRemoteTrack = (track) => {
    console.log("REMOTE_TRACK", track);
  };

  const onLocalTracks = (tracks) => {
    console.log("LOCAL_TRACKS", tracks);
  };

  const onConnectionSuccess = () => {
    console.log("CONNECTION_ESTABLISHED");
    const conference = connection.initJitsiConference("test123", {
      openBridgeChannel: true,
    });
    console.log("userId", conference.myUserId());
    conference.on(
      JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      onConferenceJoined
    );
    conference.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
    conference.on(JitsiMeetJS.errors.conference.CONNECTION_ERROR, () =>
      console.log("CONNECTION_ERROR")
    );
    conference.on(JitsiMeetJS.errors.conference.SETUP_FAILED, () =>
      console.log("SETUP_FAILED")
    );
    conference.on(JitsiMeetJS.errors.conference.AUTHENTICATION_REQUIRED, () =>
      console.log("AUTHENTICATION_REQUIRED")
    );
    conference.on(JitsiMeetJS.errors.conference.PASSWORD_REQUIRED, () =>
      console.log("PASSWORD_REQUIRED")
    );
    conference.on(JitsiMeetJS.errors.conference.PASSWORD_NOT_SUPPORTED, () =>
      console.log("PASSWORD_NOT_SUPPORTED")
    );
    conference.on(JitsiMeetJS.errors.conference.VIDEOBRIDGE_NOT_AVAILABLE, () =>
      console.log("VIDEOBRIDGE_NOT_AVAILABLE")
    );
    conference.on(JitsiMeetJS.errors.conference.RESERVATION_ERROR, () =>
      console.log("RESERVATION_ERROR")
    );
    conference.on(JitsiMeetJS.errors.conference.GRACEFUL_SHUTDOWN, () =>
      console.log("GRACEFUL_SHUTDOWN")
    );
    conference.on(JitsiMeetJS.errors.conference.JINGLE_FATAL_ERROR, () =>
      console.log("JINGLE_FATAL_ERROR")
    );
    conference.on(JitsiMeetJS.errors.conference.CONFERENCE_DESTROYED, () =>
      console.log("CONFERENCE_DESTROYED")
    );
    conference.on(JitsiMeetJS.errors.conference.CHAT_ERROR, () =>
      console.log("CHAT_ERROR")
    );
    conference.on(JitsiMeetJS.errors.conference.FOCUS_DISCONNECTED, () =>
      console.log("FOCUS_DISCONNECTED")
    );
    conference.join();
  };

  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onConnectionSuccess
  );

  connection.connect();
  // JitsiMeetJS.createLocalTracks({}).then(onLocalTracks);
};
