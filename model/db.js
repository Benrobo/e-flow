import dotenv from "dotenv"
import mysql from "mysql"

dotenv.config()
// SingleStore x MySql connection

export const conn = mysql.createConnection({
    host: 'svc-4984488b-31cb-4ad5-8b26-c972ca23018d-dml.aws-virginia-4.svc.singlestore.com',
    user: 'admin',
    password: "Benrobo-tut71",
    database: "eflow"
});