import React, { useEffect, useRef, useState } from "react";
import { TextField, Button, IconButton, Badge } from "@mui/material";
import { io } from "socket.io-client";

import { useNavigate } from 'react-router-dom';

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from '@mui/icons-material/Send';

import styles from "../Styles/VideoMeet.module.css";
import server from "../../environments";

const server_url = server;

let connections = {}; // stores peer to peer WebRTC connections by their socket id

const peerConfigConnections = {
  //STUN servers helps peers to discover their public IP for P2P
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

function VideoMeet() {
  let socketRef = useRef(); // Holds the socket io connection
  let socketIdRef = useRef(); // Stores the unique socket id of that particular user

  let localVideoRef = useRef(); // The vdo element for my own camera

  // We use UseRef here instead of useState because we don't need React to re-render the component everytime
  // UseState always re-renders the UI while useRef lets us keep the same object across renders

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();

  let [screenShare, setScreenShare] = useState();
  let [showModal, setShowModal] = useState(true);

  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");

  let [newMessages, setNewMessages] = useState();

  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

  // getPermissions function is used to access camera and microphone of the user
  // Stores the media stream in window.localStream
  // Attaches it to the video element below so thatt we can see ourselves

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        //asks for video permission
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        // asks for audio permission
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true); // This sets the screen
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  // The component loads here
  useEffect(() => {
    getPermissions();
  }, []);

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => {
        track.stop(); // It firstly stops the previous tracks (cameras or microphones)
      });
    } catch (err) {
      console.log(err);
    }

    // Attaches the stream to the <video> element
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    // For other peers
    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);
      // Attaches the new stream to the peer connections

      // It creates an offer and sets that offer as a local description than emits the signal
      // Soo that the remote peer can recieve the offer

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            ); // socketRef.current, not socketIdRef.current
          })
          .catch((err) => console.log(err));
      });
    }

    // Onended handler for each track when that track ends (video/audio is off)

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            // Stops the existing tracks on the <video> element
            tracks.forEach((track) => track.stop());
          } catch (err) {
            console.log(err);
          }

          // Replaces window.localStream with a black screen, updates the video

          let blacksilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blacksilence();
          localVideoRef.current.srcObject = window.localStream;

          // Resends the offer to the peers soo that the connection continues without a real camera/mic
          for (let id in connections) {
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((err) => console.log(err));
            });
          }
        })
    );
  };

  // creates a silent audio track using web audio API
  // Creates an AudioContext, Oscillator and connects to mediastreamdest
  // starts it andd thann return the audio track with enabled false
  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();

    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  // Basically a black canvas

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream(); // to get the video track

    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  // We use a black silent screen instead of removing the screen completely cuz
  // If we remove the stream completely than the peer has no tracks and it may be interpreted as call broken
  // The whole connection might start again creating a bad user experience
  // using black + silent screen could still maintian the tracks
  // And we can get a smooth mute or video off without breaking the peer connection

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then((stream) => getUserMediaSuccess(stream))
        .catch((err) => {
          console.log(err);
        });
    } else {
      // This is to stop tracks if needed
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
      } catch (err) {
        console.log(err);
      }
    }
  };

  // getUserMedia() requests camera/mic based on the vdo or audio state & available permissions
  // On success it passes the stream to getUserMediaSuccess
  // getUserMedia() is trigerred first when the use gives permission -> initial page load
  // Andd next it re-renders whenever there's a change in the vdo or audio state

  // The useEffect watches the video and audio and whenever the user toggles the effect runs

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  // This handles signalling messages from other peers

  const gotMessagefromServer = (fromId, message) => {
    let signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      ); // socketRef.current, not socketIdRef.current
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e)); // ✅ 'addIceCandidate' not 'addicecandidate'
      }
    }
  };

  // Intended purpose: receive a chat message payload (from socketRef.current.on("chat-msg", addMessage))
  // and append it to messages state with setMessages(prev => [...prev, newMsg]).
  // Could also increment newMessages if the app is minimized or the chat not focused.


  const addMessage = (data, sender, socketIdSender) => {

    setMessages((prevMessages) => [
      ...prevMessages,
      {sender: sender, data: data}
    ]);

    if(socketIdSender !== socketIdRef.current)
    {
      setNewMessages((prev) => prev + 1);
    }

  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false }); // Connects to the signalling server

    socketRef.current.on("signal", (fromId, message) =>
      gotMessagefromServer(fromId, message)
    );
    // subscribes to signal and alsooo forward the msgs

    socketRef.current.on("connect", () => {
      socketRef.current.emit("Join-Call", window.location.href); // Join call with the page url

      socketIdRef.current = socketRef.current.id; // Stores our socket id

      socketRef.current.on("chat-msg", addMessage);

      socketRef.current.on("User-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("User-Joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );
          // Create a new RTC connection for each client

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          }; // To emit ice candidates to that peer

          // Recieve remote streams and updates video state

          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videoExists) {
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsInline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blacksilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blacksilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        // If the event shows that a user has joined
        // Than the code loops through connections and create offers to kick off webRTC negotiation

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (err) {
              console.log(err);
            }

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.log(err);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((err) => console.log(err));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreenShare(false);
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            // Stops the existing tracks on the <video> element
            tracks.forEach((track) => track.stop());
          } catch (err) {
            console.log(err);
          }

          // Replaces window.localStream with a black screen, updates the video

          let blacksilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blacksilence();
          localVideoRef.current.srcObject = window.localStream;

          getUserMedia();
        })
    );
  };

  let getDisplayMedia = () => {
    if (screenShare) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {})
          .catch((err) => console.log(err));
      }
    }
  };

 

  let handleVideo = () => {
    setVideo(!video);
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  useEffect(() => {
    if (screenShare !== undefined) {
      getDisplayMedia();
    }
  }, [screenShare]);

  let handleScreen = () => {
    setScreenShare(!screenShare);
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-msg", message, username);
    setMessage("");
  };

  let navigate = useNavigate();

  let handleEndCall = () => {
    try{
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());

    }catch(err)
    {
      console.log(err);
    }

    navigate("/home");
  }

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  return (
    <div>
      {askForUsername === true ? (
        <div className={styles.lobbyContainer}>
          <div className={styles.lobbyTop}>
            <h1>Enter the lobby</h1>
            <TextField
              id="outlined-basic"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              className={styles.lobbyInput}
            />
            <Button
              variant="contained"
              onClick={connect}
              className={styles.lobbyButton}
            >
              Connect
            </Button>
          </div>

          <div className={styles.lobbyVideoWrapper}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className={styles.lobbyVideo}
            ></video>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal && (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>

                <div className={styles.chatDisplay}>

                  {messages.map((item, idx) => {
                    return(
                      <div style = {{marginBottom: "20px"}} key = {idx}>

                        <p style = {{fontWeight: "bold", color: "black"}}>{item.sender}</p>
                        <p>{item.data}</p>


                      </div>
                    )
                  })}

                </div>

                <div className={styles.chatArea}>
                  <TextField
                    id="outlined-basic"
                    label="Type your message"
                    variant="outlined"
                    value = {message}
                    onChange={e => setMessage(e.target.value)}
                  />

                  <Button variant="contained" endIcon={<SendIcon />} onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton style={{ color: "red" }} onClick={handleEndCall}>
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screenShare === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge
              badgeContent={newMessages > 0 ? newMessages : null}
              max={99}
              color="error"
              overlap="circular"
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <IconButton
                onClick={() => setShowModal((prev) => !prev)}
                style={{ color: "white" }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoRef}
            autoPlay
            muted
          ></video>

          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <h2>{video.socketId}</h2>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default VideoMeet;
