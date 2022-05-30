import './App.css';
import io from 'socket.io-client';
import {useState, useEffect} from 'react';

const socket = io(`http://${window.location.hostname}:3001`);

function App() {

    const [ message, setMessage ] = useState("");
    const [ displayMsg, setDisplayMsg ] = useState("");

    const [ hostRoomName, setHostRoomName ] = useState("");

    const [ roomsList, setRoomsList ] = useState(['yolo', 'room1']);

    const [ currentRoom, setCurrentRoom ] = useState("");

    // client-to-server emitter
    const sendMessage = () => {
        socket.emit("send_msg", message);
    };

    const hostNewRoom = () => {
        socket.emit("host_room", hostRoomName);
    }

    // server-to-client listener
    useEffect(() => {
        socket.emit("get_roomsList");
        socket.emit("get_current_room");
    }, []);

    useEffect(() => {
        socket.on("receive_roomsList", (data) => {
            setRoomsList(data);
        })
        socket.on("receive_msg", (data) => {
            setDisplayMsg(data);
        });
        socket.on("receive_current_room", (data) => {
            setCurrentRoom(data);
        })
    }, [socket]);

    const joinNewRoom = (roomName) => {
        socket.emit("join_room", roomName);
    }

    return (
        <div className="App">
            <input 
                placeholder="Message..." 
                onChange={(event) => {
                    setMessage(event.target.value);
                }}
            />
            <button onClick={sendMessage}>Send Message</button>
            <p className="display-message">{displayMsg}</p>
            <h1>ROOMS:</h1>
            <div className="rooms-container">
                {roomsList.length > 0 ?
                roomsList.map(roomName => {
                    return <p onClick={() => joinNewRoom(roomName)}>{roomName}</p>
                }) : <p>no rooms found</p>}
            </div>
            <input placeholder='new room name' 
                onChange={(event) => {
                    setHostRoomName(event.target.value);
                }}
            />
            <button onClick={hostNewRoom}>host room</button>
            <p className="current-room-indicator">Current room: {currentRoom}</p>
        </div>
    );    
}

export default App;
