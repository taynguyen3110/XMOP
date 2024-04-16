import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { CognitoUser } from 'amazon-cognito-identity-js';
import userpool from '../userpool';

const ConfirmSignup = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [verificationCode, setVerificationCode] = useState('');
  const username = location.state?.username; 

  const handleConfirm = () => {
    const userData = {
      Username: username,
      Pool: userpool,
    };
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      }
      alert("Account confirmed successfully!");
      navigate('/login'); 
    });
  };

  return (
    <div className="confirmSignup">
      <div className="form">
        <div className="formfield">
          <TextField
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            label="Verification Code"
          />
        </div>
        <div className="formfield">
          <Button variant="contained" onClick={handleConfirm}>Confirm Account</Button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmSignup;
