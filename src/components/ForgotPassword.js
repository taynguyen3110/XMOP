import React, { useState } from "react";
import { Button, TextField, Typography } from "@mui/material";
import { CognitoUser } from "amazon-cognito-identity-js";
import userpool from "../userpool";
import { useNavigate } from "react-router-dom"; 

const ForgotPassword = () => {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showResetFields, setShowResetFields] = useState(false);

  const handleResetPassword = () => {
    const userData = {
      Username: email,
      Pool: userpool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.forgotPassword({
      onSuccess: () => {
        setSuccessMessage("Password reset instructions sent to your email.");
        setErrorMessage("");
        setShowResetFields(true); 
      },
      onFailure: (err) => {
        setErrorMessage(err.message || JSON.stringify(err));
        setSuccessMessage("");
      },
      inputVerificationCode: () => {
        setShowResetFields(true); 
      },
    });
  };

  const handleNewPassword = () => {
    const userData = {
      Username: email,
      Pool: userpool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmPassword(resetCode, newPassword, {
      onSuccess: () => {
        setSuccessMessage("Your password has been successfully reset.");
        setErrorMessage("");
        setShowResetFields(false);
        setTimeout(() => navigate("/login"), 2000);
      },
      onFailure: (err) => {
        setErrorMessage(err.message || JSON.stringify(err));
        setSuccessMessage("");
      },
    });
  };

  return (
    <div className="ForgotPassword">
      <div className="form">
        <Typography variant="h5">Forgot Password</Typography>
        <TextField
          label="Email/Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          fullWidth
        />
        {showResetFields && (
          <>
            <TextField
              label="Reset Code"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              margin="normal"
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              fullWidth
            />
            <Button onClick={handleNewPassword} variant="contained">
              Set New Password
            </Button>
          </>
        )}
        {!showResetFields && (
          <>
            <br />
            <Button onClick={handleResetPassword} variant="contained">
              Send Password Reset Code
            </Button>
            <br />
            <Button
              onClick={() => navigate("/login")}
              variant="contained"
              style={{ marginLeft: "10px" }}
            >
              Back to Login
            </Button>
          </>
        )}
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        {successMessage && (
          <Typography color="success">{successMessage}</Typography>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
