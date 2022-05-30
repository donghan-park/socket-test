import './App.css';
import io from 'socket.io-client';
import {useState, useEffect} from 'react';

const socket = io(`http://${window.location.hostname}:3001`);

function App() {

    const [ message, setMessage ] = useState("");
    const [ displayMsg, setDisplayMsg ] = useState("");

    // client-to-server emitter
    const sendMessage = () => {
        socket.emit("send_msg", { message });
    };

    // server-to-client listener
    useEffect(() => {
        socket.on("receive_msg", (data) => {
            setDisplayMsg(data.message);
        });
    }, []);

    return (
        <div className="App">
            <input 
                placeholder="Message..." 
                onChange={(event) => {
                    setMessage(event.target.value);
                }
            }/>
            <button onClick={sendMessage}>Send Message</button>
            <p className="display-message">{displayMsg}</p>
        </div>
    );    
}

export default App;
