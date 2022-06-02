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

/*
- rooms info
    -> host room option
    -> destroy room when last person leaves
    * name:
        * roster
            * words
        * curr_letters
        * 

- players info
    * socket_id:
        * nickname
        * curr_room
        * customization
    
1. is valid english word
2. length >=3 and <=15
3. not an existing word
4. not lemmetization of any existing word
5. can be made with:
    - using available letters
    - using all letters of existing word(s)
    - using all letters of existing word(s) + available letters


*/

const enDict = require('check-if-word')('en');
const lem = require('lemmatizer');

const getFreqList = (word) => {
    let freqList = new Array(26).fill(0);

    for(let c of word){
        let i = c.charCodeAt(0) - 'a'.charCodeAt(0);
        freqList[i]++;
    }

    return freqList;
}

const currWords = {
    "sharp": {
        "freqList": getFreqList("sharp")
    },
    "mean": {
        "player": "samy",
        "freqList": getFreqList("mean")
    }
}

// return true or false with reason why
const isValid = (input) => {
    // check for english validity & length
    if(!enDict.check(input) || input.length < 3 || input.length > 12) return false;

    // for each existing word:
    // check duplication
    if(currWords[input]) return false;

    var inputFreqList = getFreqList(input);
    var possibleWords = [];

    // check lemmatization
    for(const key of Object.keys(currWords)){
        if(key.length <= input.length){
            if(lem.lemmatizer(input) === key) return false; // lem library is inadequate
            // ^ doesn't check for suffixes -er, -est, etc.

            var keyFreqList = currWords[key].freqList;
            var isPossible = true;
            var requiredLetters = [];

            for(let i = 0; i < 26; i++){
                let diff = inputFreqList[i] - keyFreqList[i];
                if(diff < 0){
                    isPossible = false;
                    break;
                } else if(diff > 0){
                    requiredLetters.push([String.fromCharCode(97 + i), diff]);
                    // ^ dont really need this; can use subtracted array and compare that with
                    // another freqlist array that represents all available letters in pile
                }
            }

            if(isPossible){
                possibleWords.push([key, requiredLetters]);
            }
        }
    }

    console.log(possibleWords);

    if(possibleWords.length > 0){
        for(let wordInfo of possibleWords){
            if(wordInfo[1].length == 0){
                // snatch
            } else {
                // check if required letters are in available letters pile
                // if yes: snatch word + letters
                // if not:
                    // try all combinations of words + letters
            }
        }
    } else {
        // check if letters make up the word
    }

    // at this point, input word is valid & unique


    return true;
}

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
            console.log(`is valid: ${isValid(data)}`);
            io.in(socket.currRoom).emit('receive_msg', data);
            // socket.to(socket.currRoom).emit('receive_msg', data);
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