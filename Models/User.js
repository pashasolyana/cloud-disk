const {Schema, model} = require("mongoose")
var ObjectId = require('mongodb').ObjectId;

const User = new Schema(
    {
    email : {type : "String", required: true, unique : true},
    password : {type : "String", required: true},
    diskSpace : {type : "Number", default: 1024**3*10},
    usedSpace : {type : "Number", default: 0},
    avatar : {type : "String"},
    files : [{type : ObjectId, ref : "File"}],
    }, { collection: 'cloud-disk' }
)

module.exports = model('User', User)