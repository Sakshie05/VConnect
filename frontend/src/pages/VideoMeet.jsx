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
import CloseIcon from '@mui/icons-material/Close';

import server from "../environments.js";

const server_url = server;

let connections = {};

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

function VideoMeet() {
  let socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();

  let [screenShare, setScreenShare] = useState();
  let [showModal, setShowModal] = useState(false);

  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");

  let [newMessages, setNewMessages] = useState(0);

  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
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

  useEffect(() => {
    getPermissions();
  }, []);

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => {
        track.stop();
      });
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
          setVideo(false);
          setAudio(false);
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (err) {
            console.log(err);
          }

          let blacksilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blacksilence();
          localVideoRef.current.srcObject = window.localStream;

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

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();

    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();

    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then((stream) => getUserMediaSuccess(stream))
        .catch((err) => {
          console.log(err);
        });
    } else {
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

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

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
                      );
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
          .catch((e) => console.log(e));
      }
    }
  };

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
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", (fromId, message) =>
      gotMessagefromServer(fromId, message)
    );

    socketRef.current.on("connect", () => {
      socketRef.current.emit("Join-Call", window.location.href);

      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-msg", addMessage);

      socketRef.current.on("User-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("User-Joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

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
            tracks.forEach((track) => track.stop());
          } catch (err) {
            console.log(err);
          }

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
    if (message.trim()) {
      socketRef.current.emit("chat-msg", message, username);
      setMessage("");
    }
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

  const handleChatToggle = () => {
    setShowModal((prev) => !prev);
    if (!showModal) {
      setNewMessages(0);
    }
  };

  return (
    <div className="relative">
      {askForUsername === true ? (
        <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-12 px-4">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
            <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>

          <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
                Join Meeting
              </h1>
              <p className="text-gray-400 text-lg">Enter your name to get started</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 mb-8 w-full max-w-md">
              <TextField
                id="username-input"
                label="Your Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8b5cf6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8b5cf6',
                  },
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && username.trim()) {
                    connect();
                  }
                }}
              />
              
              <Button
                variant="contained"
                onClick={connect}
                disabled={!username.trim()}
                fullWidth
                sx={{
                  mt: 3,
                  py: 1.5,
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  borderRadius: '12px',
                  textTransform: 'none',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                  '&:hover': {
                    backgroundColor: '#7c3aed',
                    boxShadow: '0 6px 25px rgba(139, 92, 246, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Join Now
              </Button>
            </div>

            <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-full h-auto bg-black"
              ></video>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white text-sm font-medium">Camera Preview</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-screen w-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 overflow-hidden">
          <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${showModal ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ChatIcon className="text-white" />
                  <h2 className="text-xl font-bold text-white">Chat</h2>
                </div>
                <IconButton onClick={handleChatToggle} className="text-white">
                  <CloseIcon sx={{ color: 'white' }} />
                </IconButton>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((item, idx) => {
                    const isMe = item.sender === username;
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] ${isMe ? 'bg-purple-600 text-white' : 'bg-white'} rounded-2xl px-4 py-2 shadow-md`}>
                          <p className={`text-xs font-semibold mb-1 ${isMe ? 'text-purple-200' : 'text-gray-600'}`}>
                            {item.sender}
                          </p>
                          <p className={`text-sm ${isMe ? 'text-white' : 'text-gray-800'}`}>
                            {item.data}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <TextField
                    placeholder="Type a message..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && message.trim()) {
                        sendMessage();
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        backgroundColor: '#f3f4f6',
                        '& fieldset': {
                          borderColor: 'transparent',
                        },
                        '&:hover fieldset': {
                          borderColor: '#8b5cf6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#8b5cf6',
                        },
                      },
                    }}
                  />
                  <IconButton
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    sx={{
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#7c3aed',
                      },
                      '&:disabled': {
                        backgroundColor: '#e5e7eb',
                      },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-gray-800/90 backdrop-blur-lg rounded-full px-6 py-4 shadow-2xl flex items-center gap-2 border border-gray-700">
              <IconButton
                onClick={handleVideo}
                sx={{
                  color: video ? 'white' : '#ef4444',
                  backgroundColor: video ? 'rgba(255, 255, 255, 0.1)' : 'rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: video ? 'rgba(255, 255, 255, 0.2)' : 'rgba(239, 68, 68, 0.3)',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>

              <IconButton
                onClick={handleAudio}
                sx={{
                  color: audio ? 'white' : '#ef4444',
                  backgroundColor: audio ? 'rgba(255, 255, 255, 0.1)' : 'rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: audio ? 'rgba(255, 255, 255, 0.2)' : 'rgba(239, 68, 68, 0.3)',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                {audio ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              {screenAvailable && (
                <IconButton
                  onClick={handleScreen}
                  sx={{
                    color: screenShare ? '#22c55e' : 'white',
                    backgroundColor: screenShare ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      backgroundColor: screenShare ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {screenShare ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                </IconButton>
              )}

              <IconButton
                onClick={handleEndCall}
                sx={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  mx: 1,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: '#dc2626',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <CallEndIcon />
              </IconButton>

              <Badge
                badgeContent={newMessages > 0 ? newMessages : null}
                max={99}
                color="error"
                overlap="circular"
              >
                <IconButton
                  onClick={handleChatToggle}
                  sx={{
                    color: 'white',
                    backgroundColor: showModal ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      backgroundColor: showModal ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>
          </div>

          <div className="absolute bottom-32 left-6 z-30 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 transition-all duration-300 hover:scale-105">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-64 h-48 object-cover bg-black"
            ></video>
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
              <p className="text-white text-xs font-medium">You</p>
            </div>
          </div>

          <div className={`grid gap-4 p-4 h-full ${
            videos.length === 1 ? 'grid-cols-1' :
            videos.length === 2 ? 'grid-cols-2' :
            videos.length <= 4 ? 'grid-cols-2 grid-rows-2' :
            videos.length <= 6 ? 'grid-cols-3 grid-rows-2' :
            'grid-cols-3 grid-rows-3'
          }`}>
            {videos.map((video) => (
              <div key={video.socketId} className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center border border-gray-700">
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  <p className="text-white text-sm font-medium">{video.socketId.substring(0, 8)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoMeet;