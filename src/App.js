import React from "react";
import logo from "./logo.svg";
import "./App.css";
import JitsiMeetJS from "lib-jitsi-meet-dist";

function App() {
  JitsiMeetJS.init();
  var connection = new JitsiMeetJS.JitsiConnection(null, null, {
    serviceUrl: "ererer",
  });

  const onConnectionSuccess = () => {
    console.log("CONNECTION_ESTABLISHED");
    const room = connection.initJitsiConference("conference1", {});

    room.join();
  };

  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onConnectionSuccess
  );

  connection.connect();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello!</p>
      </header>
    </div>
  );
}

export default App;
