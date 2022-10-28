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
    host: 'svc-4984488b-31cb-4ad5-8b26-c972ca23018d-dml.aws-virginia-4.svc.singlestore.com',
    user: 'admin',
    password: "Benrobo-tut71",
    database: "eflow"
});