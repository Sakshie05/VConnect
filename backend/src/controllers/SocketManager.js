import { Server } from "socket.io";

let connections = {}; //will store data about user connections
let messages = {}; //will store data about messages
let timeOnline = {}; //will store data about how long users have been online

const connectSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {

    socket.on("Join-Call", (path) => {
      if (connections[path] === undefined) {
        // If the connections object exists for that path
        connections[path] = []; // than create an empty array for that room
      }
      connections[path].push(socket.id); // adds the current user's socket id into that room's array

      timeOnline[socket.id] = new Date();

      // Notifies all the existing ppl in the room that a new user has joined and gives them
      // the updated members list
      for (let i = 0; i < connections[path].length; i++) {
        io.to(connections[path][i]).emit(
          "User-Joined",
          socket.id,
          connections[path]
        );
      }

      // When a new person joins the room than they shd be immediately updated with all the old messages

      if (messages[path] !== undefined) {
        for (let i = 0; i < messages[path].length; ++i) {
          io.to(socket.id).emit(
            "chat-msg",
            messages[path][i]["data"],
            messages[path][i]["sender"],
            messages[path][i]["socket-id-sender"]
          );
        }
      }
    });

    socket.on("signal", (toId, msg) => {
      io.to(toId).emit("signal", socket.id, msg);
    });

    socket.on("chat-msg", (data, sender) => {
      // When a user sends a message find which room they are in &
      // save the message into that room's chat history & than
      // send that message to everyone in the room

      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }

          return [room, isFound];
        },
        ["", false]
      );

      if (found === true) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        connections[matchingRoom].forEach((elem) => {
          io.to(elem).emit("chat-msg", data, sender, socket.id);
        });
      }
    });

    socket.on("disconnect", () => {
      
      let diffTime = Math.abs(timeOnline[socket.id] - new Date());
      let key;

      for(const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections))))
      {
        for(let i = 0; i < v.length; i++)
        {
          if(v[i] === socket.id)
          {
            key = k;

            for(let j = 0; j < connections[key].length; j++)
            {
              io.to(connections[key][j]).emit("User-left", socket.id);
            }

            let index = connections[key].indexOf(socket.id);

            connections[key].splice(index, 1)

            if(connections[key].length === 0)
            {
              delete connections[key];
            }
          }
        }
      }

    });
  });

  return io;
};

export default connectSocket;
