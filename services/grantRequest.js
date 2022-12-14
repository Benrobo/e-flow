
import { db, util } from "../helpers/global.js";

export default class GrantRequest {
    // logged In users
    staffRegApproved(res, data) {
        if (res === "" || res === undefined || res === null) {
            return "user registeration to be approved requires a valid {res} object but got none"
        }

        if (data && Object.entries(data).length > 0) {
            if (data.userId === undefined) {
                return util.sendJson(res, { error: true, message: "data requires a valid fields [userId] but got undefined" }, 400)
            }
            if (data.userId === "") {
                return util.sendJson(res, { error: true, message: "userId cant be empty" }, 400)
            }
            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE userId=?`
                db.query(sql, [data.userId], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.length === 0) {
                        return util.sendJson(res, { error: true, message: "officer with that ID dont exists" }, 404)
                    }

                    // check if userStatus is pending
                    if (result[0].userStatus === "pending") {
                        // update data
                        const status = "approved"
                        const sql2 = `UPDATE users SET userStatus=? WHERE userId=?`
                        db.query(sql2, [status, data.userId], (err) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            util.sendJson(res, { error: false, message: "user successfully approved." }, 200)
                        })
                        return
                    }

                    return util.sendJson(res, { error: false, message: "user has been approved already." }, 200)

                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }
    }

    staffRegReject(res, data) {
        if (res === "" || res === undefined || res === null) {
            return "user registeration to be approved requires a valid {res} object but got none"
        }

        if (data && Object.entries(data).length > 0) {
            if (data.userId === undefined) {
                return util.sendJson(res, { error: true, message: "data requires a valid fields [userId] but got undefined" }, 400)
            }
            if (data.userId === "") {
                return util.sendJson(res, { error: true, message: "userId cant be empty" }, 400)
            }
            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE userId=?`
                db.query(sql, [data.userId], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.length === 0) {
                        return util.sendJson(res, { error: true, message: "user with that ID dont exists" }, 404)
                    }

                    // if (result.rows[0].userRole === "user") {

                    // }

                    // check if userStatus is pending
                    if (result[0].userStatus === "approved" || result[0].userStatus === "pending") {
                        // update data
                        const status = "pending"
                        const sql2 = `UPDATE users SET userStatus=? WHERE userId=?`
                        db.query(sql2, [status, data.userId], (err) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            return util.sendJson(res, { error: false, message: "user status has been set to pending." }, 200)
                        })
                    }

                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }
    }
}