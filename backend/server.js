import express from "express";
import {createServer} from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import {Server} from "socket.io"; //represents a socket io server
import connectSocket from "./src/controllers/SocketManager.js";

import UserRoutes from "./src/routes/UserRoutes.js";

const app = express();
const server = createServer(app);
const io = connectSocket(server);

app.set("port", process.env.PORT || 8000);

app.use(cors());

app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

app.use("/api/users", UserRoutes);

app.get("/", (req, res) => {
    res.send("Hello World");
});

const start = async () => {

    const connectionDB = await mongoose.connect("mongodb+srv://kulkarnisakshi074:absm36R7eCbzDrNe@cluster0.90ldkof.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

    console.log(`Mongo connected to the host ${connectionDB.connection.host}`);

    server.listen(app.get("port"), () => {
        console.log("App is listening on port 8000");
    })
};

start();