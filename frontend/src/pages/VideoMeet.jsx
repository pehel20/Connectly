import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, Tooltip } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    let [meetingStartTime, setMeetingStartTime] = useState(null);
    let [elapsedTime, setElapsedTime] = useState("00:00");
    let [participants, setParticipants] = useState({});
    let [showParticipants, setShowParticipants] = useState(false);

    let [floatingReactions, setFloatingReactions] = useState([]);
    let [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const reactionEmojis = ['👍', '🎉', '❤️', '😂', '🔥', '👏'];
    let reactionIdRef = useRef(0);


    useEffect(() => {
        console.log("HELLO")
        getPermissions();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            for (let id in connections) {
                try {
                    connections[id].close();
                } catch (e) {
                    console.log(e);
                }
            }
            connections = {};
            if (window.localStream) {
                try {
                    window.localStream.getTracks().forEach(track => track.stop());
                } catch (e) {
                    console.log(e);
                }
            }
        };
    }, [])

    // Meeting timer
    useEffect(() => {
        if (!meetingStartTime) return;
        const interval = setInterval(() => {
            const diff = Math.floor((Date.now() - meetingStartTime) / 1000);
            const hrs = Math.floor(diff / 3600);
            const mins = Math.floor((diff % 3600) / 60);
            const secs = diff % 60;
            if (hrs > 0) {
                setElapsedTime(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
            } else {
                setElapsedTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [meetingStartTime]);

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }

    }, [video, audio])
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }


    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketRef.current?.id || id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }


    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketRef.current?.id || id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }


    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketRef.current?.id && fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }


    let connectToSocketServer = () => {
        socketRef.current = io.connect("http://localhost:8000", { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href, username)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('reaction', (fromId, emoji, senderName) => {
                const id = reactionIdRef.current++;
                const horizontalPos = 10 + Math.random() * 80;
                setFloatingReactions(prev => [...prev, { id, emoji, senderName, left: horizontalPos }]);
                setTimeout(() => {
                    setFloatingReactions(prev => prev.filter(r => r.id !== id));
                }, 2200);
            })

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
                setParticipants(prev => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            })

            socketRef.current.on('user-joined', (id, clients, roomUsernames) => {
                if (roomUsernames) {
                    setParticipants(roomUsernames);
                }
                clients.forEach((socketListId) => {
                    if (socketListId === socketRef.current?.id || socketListId === socketIdRef.current) return;

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketRef.current?.id || id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketRef.current?.id || id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    }
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])

    useEffect(() => {
        if (showModal) {
            setNewMessages(0);
        }
    }, [showModal, messages])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketRef.current?.id && socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };


    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    
    let connect = () => {
        setAskForUsername(false);
        setMeetingStartTime(Date.now());
        getMedia();
    }


    return (
        <div>

            {askForUsername === true ?

                <div className="lobbyPageContainer">
                    <div className="homeOverlay"></div>

                    <nav className="homeNav">
                        <div className="homeNavHeader">
                            <h2>Connectly</h2>
                        </div>
                    </nav>

                    <div className="lobbyContent">
                        <div className="lobbyCard">
                            <div className="lobbyVideoPreview">
                                <video ref={localVideoref} autoPlay muted></video>
                            </div>
                            <div className="lobbyFormSection">
                                <h2 className="lobbyTitle">Ready to join?</h2>
                                <p className="lobbySubtitle">Enter your name to join the meeting</p>
                                <div className="lobbyInputGroup">
                                    <input
                                        className="authInput"
                                        type="text"
                                        placeholder="Your name"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && username.trim()) connect(); }}
                                    />
                                    <button
                                        className="homeJoinBtn"
                                        onClick={connect}
                                        disabled={!username.trim()}
                                        style={{ width: '100%' }}
                                    >
                                        Connect
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> :


                <div className={styles.meetVideoContainer}>

                    <div className={`${styles.mainArea} ${showModal ? styles.mainAreaWithChat : ''}`}>
                        <div className={styles.meetHeader}>
                            <h2 className={styles.logoText} onClick={() => window.location.href = "/home"}>Connectly</h2>
                            <div className={styles.headerRight}>
                                <div className={styles.timerDisplay}>
                                    <AccessTimeIcon style={{ fontSize: '1rem' }} />
                                    <span>{elapsedTime}</span>
                                </div>
                                <div className={styles.participantCount}>
                                    <PeopleIcon style={{ fontSize: '1rem' }} />
                                    <span>{Object.keys(participants).length}</span>
                                </div>
                                <div className={styles.meetInfo}>
                                    <span className={styles.meetCodeLabel}>Meeting Code:</span>
                                    <span className={styles.meetCodeValue}>{window.location.pathname.split("/").pop()}</span>
                                    <Tooltip title="Copy meeting code">
                                        <IconButton onClick={() => {
                                            navigator.clipboard.writeText(window.location.pathname.split("/").pop());
                                        }} className={styles.copyBtn}>
                                            <ContentCopyIcon style={{ fontSize: '1.1rem' }} />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        <div className={styles.conferenceView}>
                            {videos.filter(v => v.stream).map((video) => (
                                <div className={styles.videoTile} key={video.socketId}>
                                    <video
                                        data-socket={video.socketId}
                                        ref={ref => {
                                            if (ref && video.stream) {
                                                ref.srcObject = video.stream;
                                            }
                                        }}
                                        autoPlay
                                    >
                                    </video>
                                </div>
                            ))}

                            {videos.length === 0 && (
                                <div className={styles.waitingMessage}>
                                    <p>Waiting for others to join...</p>
                                </div>
                            )}
                        </div>

                        <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

                        <div className={styles.buttonContainers}>
                            <div className={styles.controlsBar}>
                                <Tooltip title={video ? "Turn off camera" : "Turn on camera"}>
                                    <IconButton onClick={handleVideo} className={`${styles.controlBtn} ${video ? styles.controlBtnActive : styles.controlBtnOff}`}>
                                        {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="End call">
                                    <IconButton onClick={handleEndCall} className={styles.endCallBtn}>
                                        <CallEndIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={audio ? "Mute" : "Unmute"}>
                                    <IconButton onClick={handleAudio} className={`${styles.controlBtn} ${audio ? styles.controlBtnActive : styles.controlBtnOff}`}>
                                        {audio === true ? <MicIcon /> : <MicOffIcon />}
                                    </IconButton>
                                </Tooltip>

                                {screenAvailable === true ?
                                    <Tooltip title={screen ? "Stop sharing" : "Share screen"}>
                                        <IconButton onClick={handleScreen} className={`${styles.controlBtn} ${screen ? styles.controlBtnActive : ''}`}>
                                            {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                                        </IconButton>
                                    </Tooltip> : <></>}

                                <div className={styles.emojiPickerWrapper}>
                                    <Tooltip title="Reactions">
                                        <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`${styles.controlBtn} ${showEmojiPicker ? styles.controlBtnActive : ''}`}>
                                            <EmojiEmotionsIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {showEmojiPicker && (
                                        <div className={styles.emojiTray}>
                                            {reactionEmojis.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    className={styles.emojiBtn}
                                                    onClick={() => {
                                                        socketRef.current.emit('reaction', emoji);
                                                        setShowEmojiPicker(false);
                                                    }}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Tooltip title={showParticipants ? "Hide participants" : "Show participants"}>
                                    <IconButton onClick={() => { setShowParticipants(!showParticipants); if (!showParticipants) setModal(false); }} className={`${styles.controlBtn} ${showParticipants ? styles.controlBtnActive : ''}`}>
                                        <PeopleIcon />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title={showModal ? "Close chat" : "Open chat"}>
                                    <Badge badgeContent={newMessages} max={999} color='primary'>
                                        <IconButton onClick={() => { setModal(!showModal); if (!showModal) setShowParticipants(false); }} className={`${styles.controlBtn} ${showModal ? styles.controlBtnActive : ''}`}>
                                            <ChatIcon />
                                        </IconButton>
                                    </Badge>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {showModal && (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <h1 className={styles.chatTitle}>Chat</h1>

                                <div className={styles.chattingDisplay}>
                                    {messages.length !== 0 ? messages.map((item, index) => {
                                        return (
                                            <div className={styles.chatMessage} key={index}>
                                                <p className={styles.chatSender}>{item.sender}</p>
                                                <p className={styles.chatText}>{item.data}</p>
                                            </div>
                                        )
                                    }) : <p className={styles.noMessages}>No Messages Yet</p>}
                                </div>

                                <div className={styles.chattingArea}>
                                    <input
                                        className={styles.chatInput}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        onKeyDown={(e) => { if (e.key === 'Enter' && message.trim()) sendMessage(); }}
                                    />
                                    <button className={styles.chatSendBtn} onClick={sendMessage}>Send</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showParticipants && (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <h1 className={styles.chatTitle}>Participants ({Object.keys(participants).length})</h1>
                                <div className={styles.chattingDisplay}>
                                    {Object.entries(participants).map(([socketId, name]) => (
                                        <div className={styles.participantItem} key={socketId}>
                                            <div className={styles.participantAvatar}>
                                                <PersonIcon style={{ fontSize: '1.2rem', color: '#FF9839' }} />
                                            </div>
                                            <span className={styles.participantName}>
                                                {name}
                                                {(socketId === socketRef.current?.id || socketId === socketIdRef.current) ? ' (You)' : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Floating Emoji Reactions Overlay */}
                    <div className={styles.reactionsOverlay}>
                        {floatingReactions.map((reaction) => (
                            <div
                                key={reaction.id}
                                className={styles.floatingReaction}
                                style={{ left: `${reaction.left}%` }}
                            >
                                <span className={styles.floatingEmoji}>{reaction.emoji}</span>
                                <span className={styles.floatingReactionName}>{reaction.senderName}</span>
                            </div>
                        ))}
                    </div>

                </div>

            }

        </div>
    )
}