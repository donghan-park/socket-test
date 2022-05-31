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

const sendCurrRoomInfo = (socket) => {
    const roster = Array.from(io.sockets.adapter.rooms.get(socket.currRoom) ?? []);
    const data = {
        name: socket.currRoom ?? '[Not in a room]',
        roster: roster
    }
    if(socket.currRoom){
        io.in(socket.currRoom).emit('receive_current_room', data);
    } else {
        socket.emit('receive_current_room', data);
    }
}

const onSocketConnect = (socket) => {
    socket.on('send_msg', (data) => {
        if(socket.currRoom){
            // io.in(socket.currRoom).emit('receive_msg', data);
            socket.to(socket.currRoom).emit('receive_msg', data);
        }
    });
    
    socket.on('disconnecting', (reason) => {
        console.log(`user disconnected: ${socket.id}`);
        if(socket.currRoom) socket.leave(socket.currRoom);
        sendCurrRoomInfo(socket);
    });

    socket.on('get_roomsList', () => {
        socket.emit('receive_roomsList', roomsList);
    });

    socket.on('host_room', (roomName) => {
        if(!roomsList.includes(roomName)){
            roomsList.push(roomName);
            io.emit('receive_roomsList', roomsList);
        } else {
            socket.emit('invalid_room');
        }
    });

    socket.on('get_current_room', () => {
        sendCurrRoomInfo(socket);
    });

    socket.on('join_room', (roomName) => {
        if(socket.currRoom){
            socket.leave(socket.currRoom);
            sendCurrRoomInfo(socket);
            socket.currRoom = null;
        }
        socket.join(roomName);
        socket.currRoom = roomName;
        sendCurrRoomInfo(socket);
    });
}

// socket connection
io.on("connection", (socket) => {
    console.log(`user connected: ${socket.id}`);
    onSocketConnect(socket);
});

// initialize server listener
server.listen(port, () => {
    console.log("SERVER IS RUNNING");
});