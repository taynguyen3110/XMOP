import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';

const SetNewPasswordForm = ({ userAttributes, handleSetNewPassword }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        handleSetNewPassword(newPassword);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="formfield">
                <TextField
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    label="New Password"
                />
            </div>
            <div className="formfield">
                <TextField
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    label="Confirm Password"
                />
            </div>
            {error && <Typography variant="body">{error}</Typography>}
            <div className="formfield">
                <Button type="submit" variant="contained">Set New Password</Button>
            </div>
        </form>
    );
};

export default SetNewPasswordForm;
