import * as React from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import ChatIcon from '@mui/icons-material/Chat';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import "../App.css";

export default function Authentication() {

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");

    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false)

    const { handleRegister, handleLogin } = React.useContext(AuthContext);


    let handleAuth = async () => {
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            }
            if (formState === 1) {
              let result=await handleRegister(name,username,password);
              console.log(result);
              setMessage(result);
                setUsername("");
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {

            console.log(err);
            let message = err?.response?.data?.message || "Something went wrong. Please try again.";
            setError(message);
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAuth();
        }
    }

    return (
        <div className="authPageContainer">
            <div className="authPageOverlay"></div>

            <nav className="authNav">
                <div className="navHeader">
                    <h2 onClick={() => window.location.href = "/"} style={{ cursor: 'pointer' }}>Connectly</h2>
                </div>
            </nav>

            <div className="authContentWrapper">
                <div className="authLeftSection">
                    <h1>
                        <span style={{ color: "#FF9839" }}>Welcome</span> back to Connectly
                    </h1>
                    <p className="authSubtext">
                        Connect with your loved ones through seamless video calls, no matter the distance.
                    </p>
                    <div className="authFeatures">
                        <div className="authFeatureItem">
                            <div className="featureIcon"><VideocamIcon style={{ fontSize: '1.2rem', color: '#FF9839' }} /></div>
                            <span>HD Video Calls</span>
                        </div>
                        <div className="authFeatureItem">
                            <div className="featureIcon"><ChatIcon style={{ fontSize: '1.2rem', color: '#FF9839' }} /></div>
                            <span>Real-time Chat</span>
                        </div>
                        <div className="authFeatureItem">
                            <div className="featureIcon"><ScreenShareIcon style={{ fontSize: '1.2rem', color: '#FF9839' }} /></div>
                            <span>Screen Sharing</span>
                        </div>
                    </div>
                </div>

                <div className="authCard">
                    <div className="authCardInner">
                        <div className="authTabContainer">
                            <button
                                className={`authTab ${formState === 0 ? 'authTabActive' : ''}`}
                                onClick={() => { setFormState(0); setError(""); }}
                            >
                                Sign In
                            </button>
                            <button
                                className={`authTab ${formState === 1 ? 'authTabActive' : ''}`}
                                onClick={() => { setFormState(1); setError(""); }}
                            >
                                Sign Up
                            </button>
                        </div>

                        <h2 className="authCardTitle">
                            {formState === 0 ? "Welcome back" : "Create your account"}
                        </h2>
                        <p className="authCardSubtitle">
                            {formState === 0
                                ? "Sign in to continue to Connectly"
                                : "Join Connectly and start connecting"}
                        </p>

                        <div className="authForm">
                            {formState === 1 && (
                                <div className="authInputGroup">
                                    <label htmlFor="fullname">Full Name</label>
                                    <input
                                        id="fullname"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        className="authInput"
                                    />
                                </div>
                            )}

                            <div className="authInputGroup">
                                <label htmlFor="auth-username">Username</label>
                                <input
                                    id="auth-username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="authInput"
                                />
                            </div>

                            <div className="authInputGroup">
                                <label htmlFor="auth-password">Password</label>
                                <input
                                    id="auth-password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="authInput"
                                />
                            </div>

                            {error && <p className="authError">{error}</p>}

                            <button
                                className="authSubmitBtn"
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Sign In" : "Create Account"}
                            </button>

                            <p className="authSwitchText">
                                {formState === 0
                                    ? "Don't have an account? "
                                    : "Already have an account? "}
                                <span
                                    className="authSwitchLink"
                                    onClick={() => { setFormState(formState === 0 ? 1 : 0); setError(""); }}
                                >
                                    {formState === 0 ? "Sign Up" : "Sign In"}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                message={message}
            />
        </div>
    );
}