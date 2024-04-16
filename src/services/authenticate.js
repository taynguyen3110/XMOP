import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import userpool from '../userpool';

export const authenticate = (email, password, newPasswordCallback) => {
    return new Promise((resolve, reject) => {
        const user = new CognitoUser({
            Username: email,
            Pool: userpool,
        });

        const authDetails = new AuthenticationDetails({
            Username: email,
            Password: password,
        });

        user.authenticateUser(authDetails, {
            onSuccess: (result) => {
                console.log("Login successful");
                resolve(result);
            },
            onFailure: (err) => {
                console.log("Login failed", err);
                reject(err);
            },
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                console.log("New password required");
                newPasswordCallback(userAttributes, requiredAttributes);
            },
            mfaRequired: (challengeName, challengeParameters) => {
                console.log("Multi-factor authentication required");
                reject({ mfaRequired: true, challengeName, challengeParameters });
            },
        });
    });
};

export const logout = () => {
    const user = userpool.getCurrentUser();
    if (user) {
        localStorage.clear();
        user.signOut();
        console.log("User signed out successfully");
    }
};
