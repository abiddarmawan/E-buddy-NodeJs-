require('dotenv').config()

module.exports = {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
     
    pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
    }
};