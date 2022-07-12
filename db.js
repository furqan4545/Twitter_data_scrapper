const {Client} = require("pg");

const client = new Client({
    user: "ubuntu",
    password: "password",
    database: "sns_app_db",
    host: "ec2-3-39-102-69.ap-northeast-2.compute.amazonaws.com",
    post: 5432
});


module.exports = client;