import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import "../App.css";
import HomeIcon from '@mui/icons-material/Home';
import VideocamIcon from '@mui/icons-material/Videocam';
import InboxIcon from '@mui/icons-material/Inbox';

export default function History() {

    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])

    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch {
                // IMPLEMENT SNACKBAR
            }
        }

        fetchHistory();
    }, [])

    let formatDate = (dateString) => {

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`

    }

    return (
        <div className="historyPageContainer">
            <div className="homeOverlay"></div>

            <nav className="homeNav">
                <div className="homeNavHeader">
                    <h2 onClick={() => routeTo("/home")} style={{ cursor: 'pointer' }}>Connectly</h2>
                </div>
                <div className="homeNavActions">
                    <button
                        className="homeNavBtn"
                        onClick={() => routeTo("/home")}
                    >
                        <HomeIcon style={{ fontSize: '1.1rem' }} />
                        Home
                    </button>
                </div>
            </nav>

            <div className="historyContent">
                <h1 className="historyTitle">
                    Meeting <span style={{ color: "#FF9839" }}>History</span>
                </h1>
                <p className="historySubtitle">Your past meeting sessions</p>

                <div className="historyList">
                    {meetings.length !== 0 ? meetings.map((e, i) => (
                        <div className="historyCard" key={i}>
                            <div className="historyCardIcon">
                                <VideocamIcon style={{ fontSize: '1.3rem', color: '#FF9839' }} />
                            </div>
                            <div className="historyCardInfo">
                                <p className="historyCardCode">{e.meetingCode}</p>
                                <p className="historyCardDate">{formatDate(e.date)}</p>
                            </div>
                            <button
                                className="historyRejoinBtn"
                                onClick={() => routeTo(`/${e.meetingCode}`)}
                            >
                                Rejoin
                            </button>
                        </div>
                    )) : (
                        <div className="historyEmpty">
                            <InboxIcon style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.3)' }} />
                            <p>No meetings yet</p>
                            <button className="homeJoinBtn" onClick={() => routeTo("/home")}>
                                Start a Meeting
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}