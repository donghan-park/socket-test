const express = require("express");
const app = express();

// http server
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

// cors middleware
const cors = require("cors");
app.use(cors());

// create socket.io server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});

// socket connection
io.on("connection", (socket) => {
    console.log(`user connected: ${socket.id}`);
    socket.on("send_msg", (data) => {
        socket.broadcast.emit("receive_msg", data);
    });

    socket.on("disconnect", (reason) => {
        console.log(`user disconnected: ${socket.id}`)
        console.log(reason)
    })
});

// initialize server listener
server.listen(3001, () => {
    console.log("SERVER IS RUNNING");
});