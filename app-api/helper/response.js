// hepler class to send response to user

// success response 
const success = (msg, data) => {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            "success" : true,
            "msg": msg,
            "data": data
        })
    } 
}

// fail response 
const failure = (msg, data) => {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            "success" : false,
            "msg": msg,
            "data": data
        })
    } 
}

// unauthorized customer 
const customerIsNotSignin = () => {
    return {
        statusCode: 401,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: ''
    }
}

// unauthorized admin
const adminIsNotSignin = () => {
    return {
        statusCode: 401,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: ''
    }
}

module.exports = {success, failure, customerIsNotSignin, adminIsNotSignin};