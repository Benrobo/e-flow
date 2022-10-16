import dotenv from "dotenv"
import mysql from "mysql"
import pg from "pg"

const { Pool } = pg

dotenv.config()

// postgresql connection

// export const conn = new Pool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PWD,
// })

// SingleStore x MySql connection

export const conn = mysql.createConnection({
    host: 'svc-768864ab-698c-462a-8989-47504edbad71-dml.aws-virginia-4.svc.singlestore.com',
    user: 'admin',
    password: "Benrobo-tut71",
    database: "eflow"
});