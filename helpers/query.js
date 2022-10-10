import dotenv from "dotenv"
import { db } from "./global.js"

dotenv.config()

const DB_TYPE = process.env.DB_TYPE;

async function queryDB(sqlQuery, data) {
    if (DB_TYPE === "mysql") return await mysqlQuery(sqlQuery, data)
    if (DB_TYPE === "postgresql") return await postgresqlQuery(sqlQuery, data)
}

export default queryDB

function mysqlQuery(query, data = null) {
    return new Promise((res, rej) => {
        const queryData = typeof data === "undefined" || data === null ? [] : data.length > 0 ? [...data] : data || [];

        db.query({
            sql: query,
            timeout: 100000,
            values: queryData
        }, (err, results, fields) => {
            const queryresult = {
                results: null,
                err: null
            }

            if (err) {
                queryresult.err = err;
                queryresult.results = null;
                return rej(queryresult)
            }

            queryresult.err = null;
            queryresult.results = results;
            res(queryresult)
        })
    })
}

function postgresqlQuery(query, data = null) {
    const queryData = typeof data === "undefined" || data === null ? [] : data.length > 0 ? [...data] : data || [];

    return new Promise((res, rej) => {
        db.query(query, queryData, (err, results) => {
            const queryresult = {
                results: null,
                err: null
            }
            if (err) {
                queryresult.err = err;
                queryresult.results = null;
                return rej(queryresult)
            }

            queryresult.err = null;
            queryresult.results = results;
            res(queryresult)
        })
    })
}