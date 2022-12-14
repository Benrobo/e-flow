import { db, util } from "../helpers/global.js";


export function createTokens(res, data) {
    if (res === "" || res === undefined || res === null) {
        return "adding of case requires a valid {res} object but got none"
    }

    if (data && Object.entries(data).length > 0) {
        if (data.userId === undefined || data.token === undefined) {
            return util.sendJson(res, { error: true, message: "data requires a valid fields [userid,token] but got undefined" }, 400)
        }

        if (data.userId === "") {
            return util.sendJson(res, { error: true, message: "code generation requires a valid userid but got none" }, 400)
        }
        if (data.token === "") {
            return util.sendJson(res, { error: true, message: "code generation requires a valid token but got none" }, 400)
        }

        try {
            // check if officer id and userid exist in db
            const q1 = `SELECT * FROM users WHERE userId=?`
            db.query(q1, [data.userId], (err, result) => {
                if (err) {
                    return util.sendJson(res, { error: true, message: err.message }, 400)
                }

                if (result.length === 0) {
                    return util.sendJson(res, { error: true, message: "fail to generate code: user [id] doesnt exist" }, 404)
                }

                const { userId, token } = data;


                // check if token exist in db
                const sql1 = `SELECT * FROM codes WHERE token=? AND userId=?`
                db.query(sql1, [token, userId], (err, dataReturned) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (dataReturned.length > 0) {
                        return util.sendJson(res, { error: true, message: "fail to generate code: code already exist", code: dataReturned[0].token }, 400)
                    }

                    const date = util.formatDate()
                    const sql = `INSERT INTO codes(userId,token,issued_at) VALUES(?,?,?)`;
                    db.query(sql, [userId, token, date], (err) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        return util.sendJson(res, { error: false, message: "code generated succesfully" }, 200)
                    })
                })
            })
        } catch (err) {
            return util.sendJson(res, { error: true, message: err.message }, 500)
        }
    }
}

export function getTokens(res, data) {
    if (res === "" || res === undefined || res === null) {
        return "adding of case requires a valid {res} object but got none"
    }

    if (data && Object.entries(data).length > 0) {
        if (data.userId === undefined) {
            return util.sendJson(res, { error: true, message: "data requires a valid fields [userid] but got undefined" }, 400)
        }

        if (data.userId === "") {
            return util.sendJson(res, { error: true, message: "getting tokens requires a valid userid but got none" }, 400)
        }

        try {
            // check if officer id and userid exist in db
            const q1 = `SELECT * FROM users WHERE userId=?`
            db.query(q1, [data.userId], (err, result) => {
                if (err) {
                    return util.sendJson(res, { error: true, message: err.message }, 400)
                }

                if (result.length === 0) {
                    return util.sendJson(res, { error: true, message: "fail to get tokens: user [id] doesnt exist" }, 404)
                }

                if (result[0].userRole.toLowerCase() === "student") {
                    return util.sendJson(res, { message: "you dont have permissions to get all tokens" }, 500)
                }
                else if (result[0].userRole.toLowerCase() === "staff") {
                    return util.sendJson(res, { message: "you dont have permissions to get tokens" }, 500)
                }
                else if (result[0].userRole.toLowerCase() === "admin") {

                    const { userId } = data;

                    // check if token exist in db
                    const sql1 = `SELECT * FROM codes WHERE userId=?`
                    db.query(sql1, [userId.trim()], (err, dataReturned) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        return util.sendJson(res, { error: false, data: dataReturned }, 200)
                    })
                }
            })
        } catch (err) {
            return util.sendJson(res, { error: true, message: err.message }, 500)
        }
    }
}

export function deleteToken(res, data) {
    if (res === "" || res === undefined || res === null) {
        return "deleting tokens requires a valid {res} object but got none"
    }

    if (data && Object.entries(data).length > 0) {
        if (data.userId === undefined || data.token === undefined) {
            return util.sendJson(res, { error: true, message: "data requires a valid fields [userid, token] but got undefined" }, 400)
        }

        if (data.userId === "") {
            return util.sendJson(res, { error: true, message: "deleting token requires a valid userid but got none" }, 400)
        }
        if (data.token === "") {
            return util.sendJson(res, { error: true, message: "deleting token requires a valid token but got none" }, 400)
        }

        try {
            // check if user exist in db
            const q1 = `SELECT * FROM users WHERE userId=?`
            db.query(q1, [data.userId.trim()], (err, result) => {
                if (err) {
                    return util.sendJson(res, { error: true, message: err.message }, 400)
                }

                if (result.length === 0) {
                    return util.sendJson(res, { error: true, message: "fail to get tokens: user [id] doesnt exist" }, 404)
                }

                if (result[0].userRole.toLowerCase() === "student") {
                    return util.sendJson(res, { message: "you dont have permissions to get all tokens" }, 500)
                }
                else if (result[0].userRole.toLowerCase() === "staff") {
                    return util.sendJson(res, { message: "you dont have permissions to get tokens" }, 500)
                }
                else if (result[0].userRole.toLowerCase() === "admin") {

                    const { userId, token } = data;

                    // check if token exist in db
                    const sql1 = `SELECT * FROM codes WHERE userId=? AND token=?`
                    db.query(sql1, [userId.trim(), token.trim()], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.length === 0) {
                            return util.sendJson(res, { error: true, message: "failed to delete token: token not found" }, 404)
                        }

                        const sql2 = `DELETE FROM codes WHERE userId=? AND token=?`
                        db.query(sql2, [userId.trim(), token.trim()], (err, data2) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            if (data2.length === 0) {
                                return util.sendJson(res, { error: true, message: "failed to delete token: token not found" }, 404)
                            }



                            return util.sendJson(res, { error: false, message: "token deleted" }, 200)
                        })
                    })
                }
            })
        } catch (err) {
            return util.sendJson(res, { error: true, message: err.message }, 500)
        }
    }
}
