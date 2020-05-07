import JitsiMeetJS from "lib-jitsi-meet-dist";

const Connection = (roomName, userName, addVideo, addAudio, removeUser) => {
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
    bosh: `https://meet.jit.si/http-bind?room=${roomName}`,
    websocket: "wss://meet.jit.si/xmpp-websocket",
    clientNode: "http://jitsi.org/jitsimeet",
  };

  const confOptions = {
    openBridgeChannel: true,
  };

  let connection = null;
  let isJoined = false;
  let room = null;

  let localTracks = [];
  const remoteTracks = {};

  /**
   * Handles local tracks.
   * @param tracks Array with JitsiTrack objects
   */
  function onLocalTracks(tracks) {
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
        addVideo(localTracks[i], "local");
      } else {
        addAudio(localTracks[i], "local");
      }
      if (isJoined) {
        room.addTrack(localTracks[i]);
      }
    }
  }

  /**
   * Handles remote tracks
   * @param track JitsiTrack object
   */
  function onRemoteTrack(track) {
    if (track.isLocal()) {
      return;
    }
    const participant = track.getParticipantId();

    if (!remoteTracks[participant]) {
      remoteTracks[participant] = [];
    }
    const idx = remoteTracks[participant].push(track);

    track.addEventListener(
      JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
      (audioLevel) => console.log(`Audio Level remote: ${audioLevel}`)
    );
    track.addEventListener(JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, () =>
      console.log("remote track muted")
    );
    track.addEventListener(JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, () =>
      console.log("remote track stoped")
    );
    track.addEventListener(
      JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
      (deviceId) =>
        console.log(`track audio output device was changed to ${deviceId}`)
    );
    const id = participant + track.getType() + idx;

    if (track.getType() === "video") {
      addVideo(track, "remote", id);
    } else {
      addAudio(track, "remote", id);
    }
  }

  /**
   * That function is executed when the conference is joined
   */
  function onConferenceJoined() {
    room.setDisplayName(userName);
    console.log("CONFERENCE_JOINED");
    isJoined = true;
    for (let i = 0; i < localTracks.length; i++) {
      room.addTrack(localTracks[i]);
    }
  }

  /**
   *
   * @param id
   */
  function onUserLeft(id) {
    console.log("user left");
    removeUser(id);
  }

  /**
   * That function is called when connection is established successfully
   */
  function onConnectionSuccess() {
    room = connection.initJitsiConference(roomName, confOptions);
    room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
    room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, (track) => {
      console.log(`track removed!!!${track}`);
    });
    room.on(
      JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      onConferenceJoined
    );
    room.on(JitsiMeetJS.events.conference.USER_JOINED, (id) => {
      console.log("USER_JOINED");
      remoteTracks[id] = [];
    });
    room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
    room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, (track) => {
      console.log(`${track.getType()} - ${track.isMuted()}`);
    });
    room.on(
      JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
      (userID, displayName) => console.log(`${userID} - ${displayName}`)
    );
    room.on(
      JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
      (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`)
    );
    room.on(JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED, () =>
      console.log(`${room.getPhoneNumber()} - ${room.getPhonePin()}`)
    );
    room.join();
  }

  /**
   * This function is called when the connection fail.
   */
  function onConnectionFailed() {
    console.error("Connection Failed!");
  }

  /**
   * This function is called when the connection fail.
   */
  function onDeviceListChanged(devices) {
    console.info("current devices", devices);
  }

  /**
   * This function is called when we disconnect.
   */
  function disconnect() {
    console.log("disconnect!");
    connection.removeEventListener(
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      onConnectionSuccess
    );
    connection.removeEventListener(
      JitsiMeetJS.events.connection.CONNECTION_FAILED,
      onConnectionFailed
    );
    connection.removeEventListener(
      JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
      disconnect
    );
  }

  /**
   *
   */
  function unload() {
    for (let i = 0; i < localTracks.length; i++) {
      localTracks[i].dispose();
    }
    room.leave();
    connection.disconnect();
  }

  let isVideo = true;

  /**
   *
   */
  function switchVideo() {
    // eslint-disable-line no-unused-vars
    isVideo = !isVideo;
    if (localTracks[1]) {
      localTracks[1].dispose();
      localTracks.pop();
    }
    JitsiMeetJS.createLocalTracks({
      devices: [isVideo ? "video" : "desktop"],
    })
      .then((tracks) => {
        localTracks.push(tracks[0]);
        localTracks[1].addEventListener(
          JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
          () => console.log("local track muted")
        );
        localTracks[1].addEventListener(
          JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
          () => console.log("local track stoped")
        );
        // localTracks[1].attach($("#localVideo1")[0]);
        room.addTrack(localTracks[1]);
      })
      .catch((error) => console.log(error));
  }

  /**
   *
   * @param selected
   */
  function changeAudioOutput(selected) {
    // eslint-disable-line no-unused-vars
    JitsiMeetJS.mediaDevices.setAudioOutputDevice(selected.value);
  }

  const initOptions = {
    disableAudioLevels: true,
    desktopSharingChromeExtId: "mbocklcggfhnbahlnepmldehdhpjfcjp",
    desktopSharingChromeDisabled: false,
    desktopSharingChromeSources: ["screen", "window"],
    desktopSharingChromeMinExtVersion: "0.1",
    desktopSharingFirefoxDisabled: true,
  };

  JitsiMeetJS.init(initOptions);
  JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
  connection = new JitsiMeetJS.JitsiConnection(null, null, options);

  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onConnectionSuccess
  );
  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_FAILED,
    onConnectionFailed
  );
  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
    disconnect
  );

  JitsiMeetJS.mediaDevices.addEventListener(
    JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
    onDeviceListChanged
  );

  connection.connect();

  JitsiMeetJS.createLocalTracks({ devices: ["audio", "video"] })
    .then(onLocalTracks)
    .catch((error) => {
      throw error;
    });

  window.addEventListener("beforeunload", unload);
  window.addEventListener("unload", unload);

  // if (JitsiMeetJS.mediaDevices.isDeviceChangeAvailable("output")) {
  //   JitsiMeetJS.mediaDevices.enumerateDevices((devices) => {
  //     const audioOutputDevices = devices.filter(
  //       (d) => d.kind === "audiooutput"
  //     );

  //     if (audioOutputDevices.length > 1) {
  //       $("#audioOutputSelect").html(
  //         audioOutputDevices
  //           .map((d) => `<option value="${d.deviceId}">${d.label}</option>`)
  //           .join("\n")
  //       );

  //       $("#audioOutputSelectWrapper").show();
  //     }
  //   });
  // }
};

export default Connection;
