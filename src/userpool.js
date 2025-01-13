import { CognitoUserPool } from 'amazon-cognito-identity-js';
const poolData = {
  UserPoolId: "ap-southeast-2_t7EfS4ej7",
  ClientId: "26uhbp04i5p7l6imfig976u0a8",
};
export default new CognitoUserPool(poolData);