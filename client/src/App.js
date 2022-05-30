import './App.css';
import io from 'socket.io-client';
import {useState, useEffect} from 'react';

const socket = io(`http://${window.location.hostname}:3001`);

function App() {

    const [ message, setMessage ] = useState("");
    const [ displayMsg, setDisplayMsg ] = useState("");

    const [ hostRoomName, setHostRoomName ] = useState("");

    const [ roomsList, setRoomsList ] = useState([]);

    const [ currentRoom, setCurrentRoom ] = useState("");

    // client-to-server emitter
    const sendMessage = () => {
        socket.emit("send_msg", message);
    };

    const hostNewRoom = () => {
        socket.emit("host_room", hostRoomName);
    };

    const onKeyEnter = (e, func) => {
        if(e.key === 'Enter'){
            func();
            e.target.value = "";
        }
    }

    useEffect(() => {
        socket.on('connect', () => {
            socket.emit('get_roomsList');
            socket.emit('get_current_room');
        });
        socket.on("receive_roomsList", (data) => {
            console.log('rooms list received')
            setRoomsList(data);
        });
        socket.on("receive_msg", (data) => {
            setDisplayMsg(data);
        });
        socket.on("receive_current_room", (data) => {
            setCurrentRoom(data);
        });
        socket.on('invalid_room', () => {
            console.log('invalid room name');
        })
    }, []);

    const joinNewRoom = (roomName) => {
        socket.emit("join_room", roomName);
    }

    return (
        <div className="App">
            <input 
                placeholder="Message..." 
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                    onKeyEnter(event, sendMessage);
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
                onChange={(event) => setHostRoomName(event.target.value)}
                onKeyDown={(event) => onKeyEnter(event, hostNewRoom)}
            />
            <button onClick={hostNewRoom}>host room</button>
            <p className="current-room-indicator">Current room: {currentRoom}</p>
        </div>
    );    
}

export default App;
