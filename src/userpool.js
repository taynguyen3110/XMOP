import { CognitoUserPool } from 'amazon-cognito-identity-js';
const poolData = {
  UserPoolId: "ap-southeast-2_bCcmBKJEl",
  ClientId: "5k9p6lrabtc2uicsblc3t7vvll",
};
export default new CognitoUserPool(poolData);