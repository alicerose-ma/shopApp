// import library
const Joi = require('@hapi/joi');
var { success, failure} = require('../helper/response');
const {adminSignUp, adminSignIn} = require('../jwt/adminAuth')


// sign up admin
module.exports.signup = (event, content, callback) => {
    const { email, password } = JSON.parse(event.body);
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
        adminSignUp(value, (err, data) => {
            if (err) {
                return callback(null,failure(err,[]));
            }
            else {
                return callback(null,success('Signup Success!',data));
            }
        })
    }
}


//  sign in admin
module.exports.signin = (event, content, callback) => {
    const { email, password} = JSON.parse(event.body);
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
    });
  
    const { error, value } = schema.validate({ email, password});
    if (error) {
      console.log(error);
      return callback(null, failure('Params Error', []))
    }
    else {
        adminSignIn(value, (err, data) => {
            if (err) {
                return callback(null,failure(err,[]));
            }
            else {
                return callback(null,success('Signin Success!',data));
            }
        })
    }
}

