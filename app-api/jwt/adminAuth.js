// npm library
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const saltRounds = 10;
require('dotenv').config();
const uuid = require('uuid/v4');

// config AWS
var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1",
});

var table = "admin";
var docClient = new AWS.DynamoDB.DocumentClient();


// admin Auth sign up with brypt
const adminSignUp = (data, callback) => {
    const { email, password} = data;
    var paramsScanUser = {
        TableName: table,
        FilterExpression: "email =  :value",
        ExpressionAttributeValues: {
            ":value": email
        }
    };
    // sign up admin with bcrypt
    docClient.scan(paramsScanUser).promise().then(result => {
        if (result.Count === 0) {
            // not exist => create new account
            bcrypt.genSalt(saltRounds, function(err, salt) {
                if (err) {
                    return callback('Encrypt Error!', null);
                }
                else {
                    bcrypt.hash(password, salt, function (err, hash) {
                        if (err) {  
                            return callback('Encrypt Error!', null);
                        }
                        else {
                             // bcrypt password 
                            var paramsSignUpUser = {
                                TableName : table,
                                Item: { 
                                    'adminId': uuid(), 
                                    'email': email,
                                    'password': hash
                                }
                            };
                            // store to database
                            docClient.put(paramsSignUpUser).promise().then(result => {
                                return callback(null, data);
                            })
                            .catch(err => {
                                console.log(err)
                                return callback('Server Error!',null);
                            })
                        }
                    })
                }
            });
        }
        else {
            return callback('Admin Exists',null);
        }
    })
    .catch(err => {
        console.log(err)
        return callback('Server Error!',null);
    })
}


// admin sign up compare bcrypt
const adminSignIn = (data, callback) => {
    const { email, password } = data;
    // check if account with email exists
    var paramsScanUser = {
        TableName: table,
        FilterExpression: "email =  :value",
        ExpressionAttributeValues: {
            ":value": email
        }
    };
    docClient.scan(paramsScanUser).promise().then(result => {
        if (result.Count === 0) {
            return callback('Account does not exist',null);
        } else {
            // compare password with brypt password from result from datavase
            bcrypt.compare(password, result.Items[0].password, function (err, resBcrypt) {
                if (resBcrypt == true) {
                    // success => create token => send to browser
                    const token = jwt.sign({ adminId: result.Items[0].adminId ,role: 'admin'}, process.env.JWT_KEY );
                    return callback(null, {token: token})
                } else {
                    return callback('Wrong password!', null)
                }
            });
        }
    }).catch(err => {
        console.log(err)
        return callback('Server Error!',null);
    })
}


// verify token
const isAdminSignin = (tokenRaw, callback) => {
    if (!tokenRaw) {
        return callback('Not Sign in!',null);
    }
    else {
        // verify token with signature
        const token = tokenRaw.replace('Bearer ', '')
        jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
            if (err) {
                return callback('Token verify failed!',null);
            }
            else {
                // decode token
                const role = decoded.role;
                const id = decoded.adminId;
                if (role === "admin") {
                    const user = { id, role }
                    return callback(null, user)
                }
                else {
                    return callback('Role is not admin',null);
                }
            }
        });
    }
}


module.exports = {adminSignUp, adminSignIn, isAdminSignin};