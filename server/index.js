const express = require("express");
const app = express();
const port = process.env.port || 3001;

// http server
const http = require("http");
const server = http.createServer(app);

// cors middleware
const cors = require("cors");
app.use(cors());

// create socket.io server
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

var roomsList = [];

// socket connection
io.on("connection", (socket) => {
    console.log(`user connected: ${socket.id}`);
    socket.on("send_msg", (data) => {
        socket.broadcast.emit("receive_msg", data);
    });

    socket.on("disconnect", (reason) => {
        console.log(`user disconnected: ${socket.id}`);
    })

    socket.on("get_roomsList", () => {
        socket.emit("receive_roomsList", roomsList);
    })

    socket.on("host_room", (roomName) => {
        roomsList.push(roomName);
        io.emit("receive_roomsList", roomsList);
    })
    // console.log(Array.from(io.sockets.adapter.rooms.keys()))
});

// initialize server listener
server.listen(port, () => {
    console.log("SERVER IS RUNNING");
});