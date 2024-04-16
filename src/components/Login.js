import React, { useState } from 'react';
import { Button, TextField, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authenticate } from '../services/authenticate';
import { CognitoUser } from 'amazon-cognito-identity-js';
import userpool from '../userpool';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [user, setUser] = useState(null);

    const handleClick = () => {
        authenticate(email, password)
            .then((data) => {
                console.log("Authentication successful");
                navigate('/workspace');
            })
            .catch((error) => {
                if (error.mfaRequired) {
                    console.log("Multi-factor authentication required");
                    setMfaRequired(true);
                    setUser(new CognitoUser({ Username: email, Pool: userpool }));
                } else {
                    console.error("Authentication error", error);
                    setLoginError(error.message);
                }
            });
    };

    const handleMFAVerification = () => {
        if (user) {
            user.sendMFACode(mfaCode, {
                onSuccess: (result) => {
                    console.log("MFA Verification successful");
                    navigate('/workspace');
                },
                onFailure: (err) => {
                    console.error("MFA Verification error", err);
                    setLoginError(err.message);
                }
            });
        }
    };

    return (
        <div className="login">
            <div className='form'>
                {mfaRequired ? (
                    <>
                        <TextField
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value)}
                            label="MFA Code"
                            margin="normal"
                            fullWidth
                        />
                        <Button variant='contained' onClick={handleMFAVerification}>Verify MFA</Button>
                        {loginError && <Typography color="error">{loginError}</Typography>}
                    </>
                ) : (
                    <>
                        <TextField
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            label="Email/Username"
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            label="Password"
                            margin="normal"
                        />
                        <Button variant='contained' onClick={handleClick}>Login</Button>
                        <Typography variant="body2" style={{ marginTop: '10px' }}>
                            <Link href="#" onClick={() => navigate('/forgot-password')} style={{ cursor: 'pointer' }}>Forgot Password / Change Password?</Link>
                        </Typography>
                        {loginError && <Typography color="error">{loginError}</Typography>}
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;
