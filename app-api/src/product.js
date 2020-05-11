// import library
const { success, failure, adminIsNotSignin, customerIsNotSignin } = require('../helper/response');

const {isAdminSignin} = require('../jwt/adminAuth')
const Joi = require('@hapi/joi');
const uuid = require('uuid/v4');
require('dotenv').config()

// AWS config
var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});

var table = "product";
var docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// create product api
module.exports.create = (event, context, callback) => {
  const tokenRaw = event.headers.Authorization;
  isAdminSignin(tokenRaw, (err, data) => {
    if (err) {
      return callback(null, adminIsNotSignin());
    } else {
      // verify input data by joi
      const { name, des, image_url, price, sale } = JSON.parse(event.body);
      const schema = Joi.object({
        name: Joi.string().required(),
        des: Joi.string().required(),
        image_url: Joi.string().required(),
        price: Joi.number().integer().required(),
        sale: Joi.number().integer().min(0).max(100).required(),
      });
      const { error, value } = schema.validate({ name, des, image_url, price, sale });
      if (error) {
        console.log(error);
        return callback(null, failure('Params Error!', []));
      }
      else {
        // product name exist or not
        var paramsScanProductName = {
          TableName: table,
          FilterExpression: "#name =  :name",
          ExpressionAttributeValues: {
            ":name": name
          },
          ExpressionAttributeNames: {
            "#name": "name"
          }
        };
        docClient.scan(paramsScanProductName).promise().then(result => {
          if (result.Count === 0) {
            // name is not exist => create product
            var params = {
              TableName: table,
              Item: {
                "productId": uuid(),
                "name": value.name,
                "des": value.des,
                "image_url": value.image_url,
                "price": value.price,
                "sale": value.sale,
                "createAt": new Date().getTime()
              }
            };
            docClient.put(params).promise().then(result => {
              return callback(null, success('Create Product Success!', result));
            })
              .catch(error => {
                console.log(error);
                return callback(null, failure('Create Product Failure!', error));
              })
          } else {
            // name exist => can not create product
            return callback(null, failure('Product Name exists!', []));
          }
        })
      }
    }
  })
}

// delete product
module.exports.delete = (event, context, callback) => {
  const tokenRaw = event.headers.Authorization;
  isAdminSignin(tokenRaw, (err, data) => { //verify admin by token
    if (err) {
      console.log(err)
      return callback(null, adminIsNotSignin());
    } else {
      const { productId } = JSON.parse(event.body);
      const schema = Joi.object({
        productId: Joi.string().required(),
      });
      const { error, value } = schema.validate( { productId } );
      if (error) {
        return callback(null,failure('Params Error!',[]));
      } else {
        var params = {
          TableName: table,
          Key: {
            "productId": value.productId
          }
        }
        docClient.delete(params).promise().then(result => {
          console.log(result);
          return callback(null, success('Delete Product Success', result))
        }).catch(error => {
          console.log(error);
          return callback(null, failure('Delete Product Failure', error))
        })
      }
    }
  })
}

// list all product
module.exports.listall = (event, context, callback) => {
  var params = {
    TableName: table,
  }
  // get product by table name
  docClient.scan(params).promise().then(result => {
    console.log(result);
    return callback(null, success('List All Product Succes', result))
  }).catch(error => {
    console.log(error);
    return callback(null, failure('List All Product Failure', error))
  })
}

// get product by productId
module.exports.get = (event, context, callback) => {
  const { productId } = JSON.parse(event.body);
  const schema = Joi.object({
    productId: Joi.string().required(),
  });
  const { error, value } = schema.validate( { productId } );
  if (error) {
    return callback(null,failure('Params Error!',[]));
  } else {
    var params = {
      TableName: table,
      Key: {
        "productId": value.productId //get proudct wihtout sort key
      }
    }
    docClient.get(params).promise().then(result => {
      console.log(result);
      return callback(null, success('Get Product Success', result))
    }).catch(error => {
      console.log(error);
      return callback(null, failure('Get Product Failure', error))
    })
  }
}

// update product 
module.exports.update = (event, context, callback) => {
  const tokenRaw = event.headers.Authorization;
  isAdminSignin(tokenRaw, (err, data) => {
    if (err) {
      return callback(null, adminIsNotSignin());
    } else {
      const { productId, name, des, image_url, price, sale } = JSON.parse(event.body);
      const schema = Joi.object({
        productId: Joi.string().required(),
        name: Joi.string().required(),
        des: Joi.string().required(),
        image_url: Joi.string().required(),
        price: Joi.number().integer().required(),
        sale: Joi.number().integer().min(0).max(100).required(),
      });

      const { error, value } = schema.validate({ productId, name, des, image_url, price, sale });
      if (error) {
        console.log(error);
        return callback(null, failure('Params Error', []))
      }
      else {
        // check name is unique
        var paramsScanProductName = {
          TableName: table,
          FilterExpression: "#name =  :name",
          ExpressionAttributeValues: {
            ":name": name
          },
          ExpressionAttributeNames: {
            "#name": "name"
          }
        };
        docClient.scan(paramsScanProductName).promise().then(result => {
          if (result.Count === 0) { // name is unique => udpate product
            var params = {
              TableName: table,
              Key: {
                "productId": productId,
              },
              // update attribute values
              UpdateExpression: 'set #name = :name, #des = :des, #image_url = :image_url, #price = :price, #sale = :sale',
              ExpressionAttributeValues: {
                ":name": value.name,
                ":des": value.des,
                ":image_url": value.image_url,
                ":price": value.price,
                ":sale": value.sale,
              },
              ExpressionAttributeNames: {
                "#name": "name",
                "#des": "des",
                "#image_url": "image_url",
                "#price": "price",
                "#sale": "sale",
              }
            };
            docClient.update(params).promise().then((result) => {
              console.log(result);
              return callback(null, success('Update Product Succes', result))
            })
              .catch((error) => {
                console.log(error);
                return callback(null, failure('Update Product Failure', error))
              })
          } else { //product name is exist => change to other name
            console.log("here")
            console.log(result)
            if (result.Items[0].productId == productId){
              var params = {
                TableName: table,
                Key: {
                  "productId": productId,
                },
                // update attribute values
                UpdateExpression: 'set #name = :name, #des = :des, #image_url = :image_url, #price = :price, #sale = :sale',
                ExpressionAttributeValues: {
                  ":name": value.name,
                  ":des": value.des,
                  ":image_url": value.image_url,
                  ":price": value.price,
                  ":sale": value.sale,
                },
                ExpressionAttributeNames: {
                  "#name": "name",
                  "#des": "des",
                  "#image_url": "image_url",
                  "#price": "price",
                  "#sale": "sale",
                }
              };
              docClient.update(params).promise().then((result) => {
                console.log(result);
                return callback(null, success('Update Product Succes', result))
              })
                .catch((error) => {
                  console.log(error);
                  return callback(null, failure('Update Product Failure', error))
                })
            }
            else {
              return callback(null, failure('Product Name exists', []))
            }
          }
        })
      }
    }
  })
}

//  upload image to S3
module.exports.upload = (event,context, callback) => {
  const tokenRaw = event.headers.Authorization;
  isAdminSignin(tokenRaw, (err,data) => {
      if (err) {
          return callback(null, adminIsNotSignin());
      } else {
          console.log(event.body);
          const data = JSON.parse(event.body); // get image in base64string format
          console.log(data);
          const {base64String} = data;
          // check base64 param
          if (!base64String) {
              console.log('Params Error!');
              return callback(null,failure('Params Error!',[]));
          }
          else {
            // get type  and image value from raw base 64 string
              const type = base64String.split(';')[0].split('/')[1];
              var buffer = new Buffer(base64String.split(';')[1].split(',')[1],'base64');
              const params = {
                  Bucket: 'alice-shop-image',
                  Key: "images/" + uuid() + '.' + type,
                  Body: buffer,
                  ContentEncoding: 'base64',
                  ContentType: `image/${type}`
              }
              // upload to s3 
              s3.upload(params, function(s3Err, data) {
                  if (s3Err){
                      console.log(s3Err);
                      return callback(null,failure('Upload Failure!',{}));
                  }
                  else {
                      console.log(`File uploaded successfully at ${data.Location}`)
                      return callback(null,success(`File uploaded successfully at`,{url : data.Location}));
                  }
              });
          }
      }
  })
}