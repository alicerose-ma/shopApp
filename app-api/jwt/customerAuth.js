// import library
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
var table = "customer";
var docClient = new AWS.DynamoDB.DocumentClient();

// sign up customer with bcrypt
const customerSignUp = (data, callback) => {
    const { email, password, phone, address } = data;
    var paramsScanUser = {
        TableName: table,
        FilterExpression: "email =  :value",
        ExpressionAttributeValues: {
            ":value": email
        }
    };
    // check customer email exist
    docClient.scan(paramsScanUser).promise().then(result => {
        if (result.Count === 0) {
            // not exist => create new account
            bcrypt.genSalt(saltRounds, function(err, salt) {
                if (err) {
                    return callback('Encrypt Error!', null);
                }
                else {
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) {  
                            return callback('Encrypt Error!', null);
                        }
                        else {
                            // bcrypt password 
                            var paramsSignUpUser = {
                                TableName : table,
                                Item: { 
                                    'customerId': uuid(), 
                                    'email': email,
                                    'password': hash,
                                    'phone': phone,
                                    'address': address,
                                    'createAt': new Date().getTime() }
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
            })
        }
        else {
            return callback('Customer Exists',null);
        }
    })
    .catch(err => {
        console.log(err)
        return callback('Server Error!',null);
    })
}


// sign in customer
const customerSignIn = (data, callback) => {
    const { email, password } = data;
    var paramsScanUser = {
        TableName: table,
        FilterExpression: "email =  :value",
        ExpressionAttributeValues: {
            ":value": email
        }
    };
    // check if account with email exists
    docClient.scan(paramsScanUser).promise().then(result => {
        if (result.Count === 0) {
            return callback('Account does not exist',null);
        } else {
            // compare password with brypt password from result from datavase
            bcrypt.compare(password, result.Items[0].password, function (err, resBcrypt) {
                if (resBcrypt == true) {
                    // success => create token => send to browser
                    const token = jwt.sign({ customerId: result.Items[0].customerId ,role: 'customer'}, process.env.JWT_KEY );
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
const isCustomerSignin = (tokenRaw, callback) => {
    // browser do not have token => notify customer to sign in
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
                const id = decoded.customerId;
                if (role === "customer") {
                    const user = { id, role }
                    return callback(null, user)
                }
                else {
                    return callback('Role is not customer',null);
                }
            }
        });
    }
}


module.exports = { customerSignUp, customerSignIn, isCustomerSignin };