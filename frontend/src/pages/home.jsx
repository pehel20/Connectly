import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { AuthContext } from '../contexts/AuthContext';
import RestoreIcon from '@mui/icons-material/Restore';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';

function HomeComponent() {

    let navigate = useNavigate();

    const [meetingCode, setMeetingCode] = useState("");

    const {addToUserHistory} = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && meetingCode.trim()) {
            handleJoinVideoCall();
        }
    }

    return (
        <div className="homePageContainer">
            <div className="homeOverlay"></div>

            <nav className="homeNav">
                <div className="homeNavHeader">
                    <h2>Connectly</h2>
                </div>
                <div className="homeNavActions">
                    <button
                        className="homeNavBtn"
                        onClick={() => navigate("/history")}
                    >
                        <RestoreIcon style={{ fontSize: '1.1rem' }} />
                        History
                    </button>
                    <button
                        className="homeNavBtnLogout"
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }}
                    >
                        <LogoutIcon style={{ fontSize: '1rem', marginRight: '4px' }} />
                        Logout
                    </button>
                </div>
            </nav>

            <div className="homeContent">
                <div className="homeHeroSection">
                    <h1 className="homeTitle">
                        Start a <span style={{ color: "#FF9839" }}>meeting</span> or join one
                    </h1>
                    <p className="homeSubtitle">
                        Providing quality video calls just like quality connections.
                        Enter a meeting code to join instantly.
                    </p>

                    <div className="homeJoinBox">
                        <div className="homeInputWrapper">
                            <LinkIcon style={{ fontSize: '1.2rem', opacity: 0.5, color: 'white' }} />
                            <input
                                type="text"
                                className="homeInput"
                                placeholder="Enter meeting code"
                                value={meetingCode}
                                onChange={e => setMeetingCode(e.target.value)}
                                onKeyDown={handleKeyPress}
                            />
                        </div>
                        <button
                            className="homeJoinBtn"
                            onClick={handleJoinVideoCall}
                            disabled={!meetingCode.trim()}
                        >
                            Join
                        </button>
                    </div>

                    <div className="homeQuickActions">
                        <div className="homeQuickCard" onClick={() => {
                            const code = Math.random().toString(36).substring(2, 10);
                            setMeetingCode(code);
                        }}>
                            <div className="quickCardIcon">
                                <AddIcon style={{ fontSize: '1.3rem', color: '#FF9839' }} />
                            </div>
                            <div>
                                <p className="quickCardTitle">New Meeting</p>
                                <p className="quickCardSub">Generate a random code</p>
                            </div>
                        </div>
                        <div className="homeQuickCard" onClick={() => navigate("/history")}>
                            <div className="quickCardIcon">
                                <HistoryIcon style={{ fontSize: '1.3rem', color: '#FF9839' }} />
                            </div>
                            <div>
                                <p className="quickCardTitle">Past Meetings</p>
                                <p className="quickCardSub">View your history</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default withAuth(HomeComponent)