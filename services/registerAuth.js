
import { db, util } from "../helpers/global.js";

export default class RegisterAuth {

    // register student
    async student(res, data) {
        if (res === "" || res === undefined || res === null) {
            return "user authentication requires a valid {res} object but got none"
        }

        if (data && Object.entries(data).length > 0) {
            if (data.email === undefined || data.userName === undefined || data.password === undefined || data.type === undefined || data.phoneNumber === "") {
                return util.sendJson(res, { error: true, message: "data requires a valid fields [userName, email, password, type] but got undefined" }, 400)
            }
            if (data.userName === "") {
                return util.sendJson(res, { error: true, message: "userName cant be empty" }, 400)
            }
            if (data.email === "") {
                return util.sendJson(res, { error: true, message: "email cant be empty" }, 400)
            }
            if (data.type === "") {
                return util.sendJson(res, { error: true, message: "type cant be empty" }, 400)
            }
            if (data.phoneNumber === "") {
                return util.sendJson(res, { error: true, message: "phoneNumber cant be empty" }, 400)
            }
            if (data.password === "") {
                return util.sendJson(res, { error: true, message: "user password cant be empty" }, 400)
            }
            // validate data
            if (util.validateEmail(data.email) === false) {
                return util.sendJson(res, { error: true, message: "user mail is invalid" })
            }

            if (util.validatePhonenumber(data.phoneNumber) === false) {
                return util.sendJson(res, { error: true, message: "user phone number is invalid" })
            }

            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE mail=? OR "phoneNumber"=?`
                db.query(sql, [data.email, data.phoneNumber], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.length > 0) {
                        return util.sendJson(res, { error: true, message: "student with that email or phone number already exists" }, 400)
                    }

                    // insert data
                    const { userName, email, phoneNumber, password } = data
                    const id = util.genId()
                    const userId = util.genId()
                    const refreshToken = 0
                    const hash = util.genHash(password)
                    const status = "pending"
                    const joined = util.formatDate()
                    const role = "user"
                    let modifiedType = "student";

                    const sql2 = `INSERT INTO users(id, userId, userName,mail,phoneNumber,hash,type,userStatus, userRole,refreshToken,joined) VALUES(?,?,?,?,?,?,?,?,?,?,?)`
                    db.query(sql2, [id, userId, userName, email, phoneNumber, hash, modifiedType, status, role, refreshToken, joined], (err, result) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        return util.sendJson(res, { error: false, message: "user registerd succesfully." }, 200)
                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }

    }

    async #removeToken(token) {
        return new Promise((res, rej) => {
            const sql = `DELETE FROM codes WHERE token=?`
            db.query(sql, [token], (err, data) => {
                if (err) return rej(err)
                res({ msg: "token deleted" })
            })
        })
    }

    // register staff
    async staff(res, data) {
        if (res === "" || res === undefined || res === null) {
            return "user authentication requires a valid {res} object but got none"
        }

        if (data && Object.entries(data).length > 0) {
            if (data.email === undefined || data.userName === undefined || data.password === undefined || data.type === undefined || data.token === undefined) {
                return util.sendJson(res, { error: true, message: "data requires a valid fields [userName, email, password, token, type] but got undefined" }, 400)
            }
            if (data.userName === "") {
                return util.sendJson(res, { error: true, message: "userName cant be empty" }, 400)
            }
            if (data.email === "") {
                return util.sendJson(res, { error: true, message: "email cant be empty" }, 400)
            }
            if (data.type === "") {
                return util.sendJson(res, { error: true, message: "type cant be empty" }, 400)
            }
            if (data.token === "") {
                return util.sendJson(res, { error: true, message: "token cant be empty" }, 400)
            }
            if (data.password === "") {
                return util.sendJson(res, { error: true, message: "user password cant be empty" }, 400)
            }
            // validate data
            if (util.validateEmail(data.email) === false) {
                return util.sendJson(res, { error: true, message: "user mail is invalid" })
            }

            if (util.validatePhonenumber(data.phoneNumber) === false) {
                return util.sendJson(res, { error: true, message: "user phone number is invalid" })
            }

            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE mail=? OR phoneNumber=?`
                db.query(sql, [data.email, data.phoneNumber], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.length > 0) {
                        return util.sendJson(res, { error: true, message: "user with that email or phone number already exists" }, 400)
                    }

                    // check if token entered match the created token in database
                    const sql2 = `SELECT * FROM codes WHERE token=?`
                    db.query(sql2, [data.token], (err, resultData) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (resultData.length === 0) {
                            return util.sendJson(res, { error: true, message: "token as either expired or is invalid" }, 403)
                        }

                        // insert data
                        const { userName, email, phoneNumber, password } = data
                        const id = util.genId()
                        const userId = util.genId()
                        const refreshToken = 0
                        const hash = util.genHash(password)
                        const status = "pending"
                        const joined = util.formatDate()
                        const role = "user"
                        const permissionLevel = 1;
                        let modifiedType = "staff";

                        const sql3 = `INSERT INTO users(id, userId, userName,mail,phoneNumber,hash,type,userStatus, userRole,refreshToken,joined,documentPermissions) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`
                        db.query(sql3, [id, userId, userName, email, phoneNumber, hash, modifiedType, status, role, refreshToken, joined, permissionLevel], async (err, result) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            const tokenData = await this.#removeToken(data.token)

                            console.log(tokenData)

                            return util.sendJson(res, { error: false, message: "user registerd succesfully. waiting to be approved by admin" }, 200)
                        })

                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }

    }

    // register admin
    async admin(res, data) {
        if (res === "" || res === undefined || res === null) {
            return "officerAuth requires a valid {res} object but got none"
        }

        if (data && Object.entries(data).length > 0) {
            if (data.email === undefined || data.userName === undefined || data.password === undefined || data.phoneNumber === undefined || data.type === undefined) {
                return util.sendJson(res, { error: true, message: "data requires a valid fields [userName, email, password, phonenumber, type] but got undefined" }, 400)
            }
            if (data.userName === "") {
                return util.sendJson(res, { error: true, message: "userName cant be empty" }, 400)
            }
            if (data.email === "") {
                return util.sendJson(res, { error: true, message: "email cant be empty" }, 400)
            }
            if (data.password === "") {
                return util.sendJson(res, { error: true, message: "user password cant be empty" }, 400)
            }
            if (data.phoneNumber === "") {
                return util.sendJson(res, { error: true, message: "user phone number cant be empty" }, 400)
            }
            if (data.type === "") {
                return util.sendJson(res, { error: true, message: "user type cant be empty" }, 400)
            }
            // validate data
            if (util.validateEmail(data.email) === false) {
                return util.sendJson(res, { error: true, message: "user mail is invalid" })
            }

            if (util.validatePhonenumber(data.phoneNumber) === false) {
                return util.sendJson(res, { error: true, message: "user phone number is invalid" })
            }

            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE mail=? OR phoneNumber=?`
                db.query(sql, [data.email, data.phoneNumber], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.length > 0) {
                        return util.sendJson(res, { error: true, message: "user with that email or phone number already exists" }, 400)
                    }


                    // insert data
                    const { userName, email, phoneNumber, password } = data
                    const id = util.genId()
                    const userId = util.genId()
                    const refreshToken = 0
                    const hash = util.genHash(password)
                    const status = "approved"
                    const joined = util.formatDate()
                    const role = "admin"
                    const permissionLevel = 3;
                    let modifiedType = "staff";

                    const sql3 = `INSERT INTO users(id, userId, userName,mail,phoneNumber,hash,type,userStatus, userRole,refreshToken,joined,documentPermissions) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`
                    db.query(sql3, [id, userId, userName, email, phoneNumber, hash, modifiedType, status, role, refreshToken, joined, permissionLevel], (err, result) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        return util.sendJson(res, { error: false, message: "user registerd succesfully" }, 200)
                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }
    }

}