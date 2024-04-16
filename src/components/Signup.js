
import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import userpool from '../userpool';

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const [emailErr, setEmailErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [phoneErr, setPhoneErr] = useState(''); 

  const formInputChange = (formField, value) => {
    switch (formField) {
      case "email":
        setEmail(value);
        break;
      case "username":
        setUsername(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "phone":
        setPhoneNumber(value); 
        break;
      default:
        break;
    }
  };

  const validation = () => {
    return new Promise((resolve, reject) => {
      let isValid = true;
      setEmailErr("");
      setPasswordErr("");
      setPhoneErr("");

      if (!email) {
        setEmailErr("Email is required");
        isValid = false;
      }
      if (!username) {
      }
      if (!password) {
        setPasswordErr("Password is required");
        isValid = false;
      } else if (password.length < 6) {
        setPasswordErr("Password must be at least 6 characters");
        isValid = false;
      }
      if (!phoneNumber) {
        setPhoneErr("Phone number is required");
        isValid = false;
      }

      if (isValid) {
        resolve();
      } else {
        reject("Validation failed");
      }
    });
  };

  const handleClick = () => {
    validation().then(() => {
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        }),
        new CognitoUserAttribute({
          Name: 'phone_number',
          Value: phoneNumber, 
        }),
      ];

userpool.signUp(username, password, attributeList, null, (err, data) => {
  if (err) {
    console.error(err);
    alert("Couldn't sign up: " + err.message || JSON.stringify(err));
  } else {
    console.log(data);
    alert('Verification code sent. Please check your email.');
    navigate('/confirm-signup', { state: { username: username } }); 
  }
});

    }).catch(err => {
      console.error(err);
      alert(err);
    });
  };

  return (
    <div className="signup">
      <div className='form'>
        <div className="formfield">
          <TextField
            value={email}
            onChange={(e) => formInputChange("email", e.target.value)}
            label="Email"
            error={!!emailErr}
            helperText={emailErr}
          />
        </div>
        <div className="formfield">
          <TextField
            value={phoneNumber}
            onChange={(e) => formInputChange("phone", e.target.value)}
            label="Phone Number"
            error={!!phoneErr}
            helperText={phoneErr}
          />
        </div>
        <div className="formfield">
          <TextField
            value={username}
            onChange={(e) => formInputChange("username", e.target.value)}
            label="Username"
          />
        </div>
        <div className="formfield">
          <TextField
            value={password}
            onChange={(e) => formInputChange("password", e.target.value)}
            type="password"
            label="Password"
            error={!!passwordErr}
            helperText={passwordErr}
          />
        </div>
        <div className='formfield'>
          <Button type='submit' variant='contained' onClick={handleClick}>Signup</Button>
        </div>
      </div>
    </div>
  );
};

export default Signup;

