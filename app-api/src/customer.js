// import library
const Joi = require('@hapi/joi');
var { success, failure } = require('../helper/response');
const { customerSignUp, customerSignIn} = require('../jwt/customerAuth')

// sign up customer
module.exports.signup = (event, content, callback) => {
    //validate data
    const { email, password, phone, address } = JSON.parse(event.body);
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        phone: Joi.string().required(),
        address: Joi.string().required()
    });
    const { error, value } = schema.validate({ email, password, phone, address });
    if (error) {
      console.log(error);
      return callback(null, failure('Params Error', []))
    }
    else {
        // call customer sign up from customer Auth
        customerSignUp(value, (err, data) => {
            if (err) {
                return callback(null,failure(err,[]));
            }
            else {
                return callback(null,success('Signup Success!',data));
            }
        })
    }
}

// sign in customer 
module.exports.signin = (event, content, callback) => {
    const { email, password} = JSON.parse(event.body);
    //validate data
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    const { error, value } = schema.validate({ email, password});
    if (error) {
      console.log(error);
      return callback(null, failure('Params Error', []))
    }
    else {
        // call customer sign in from customer Auth
        customerSignIn(value, (err, data) => {
            if (err) {
                return callback(null,failure(err,[]));
            }
            else {
                return callback(null,success('Signin Success!',data));
            }
        })
    }
}

