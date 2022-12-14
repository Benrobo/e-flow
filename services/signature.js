import dotenv from "dotenv";
import { db, util } from "../helpers/global.js";
import sendMail from "./sendMail.js";
import nodemailer from "nodemailer";
dotenv.config();



// get documentPermission type
function docPermission(docPermission) {
    switch (docPermission) {
        case 2:
            return "H.O.D"
            break;
        case 4:
            return "Supervisor"
            break
        case 5:
            return "School Officer"
            break
        case 6:
            return "Course Advisor"
            break
        case 7:
            return "External Supervisor"
            break

        default:
            return "Staff"
            break;
    }
}

class Signature {

    get(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "fetching document requires a valid {res} object but got none";
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.documentId === undefined) {
                return util.sendJson(
                    res,
                    {
                        error: true,
                        message:
                            "payload requires a valid fields [documentId] but got undefined",
                    },
                    400
                );
            }

            if (payload.documentId === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "documentId cant be empty" },
                    400
                );
            }

            const { documentId } = payload

            const sql = `
                SELECT
                    signatures.image,
                    signatures.id,
                    signatures.staffId,
                    users.userName,
                    users.documentPermissions
                FROM 
                    signatures
                INNER JOIN
                    users
                ON
                    users.userId=signatures.staffId
                WHERE
                    signatures.documentId=?
            `
            db.query(sql, [documentId.trim()], (err, data) => {
                if (err) {
                    return util.sendJson(
                        res,
                        { error: true, message: err.message },
                        400
                    );
                }

                return util.sendJson(
                    res,
                    {
                        error: false,
                        data: data,
                    },
                    400
                );

            })

        }
    }

    add(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "fetching document requires a valid {res} object but got none";
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.documentId === undefined || payload.staffId === undefined || payload.documentType === undefined || payload.image === undefined || payload.studentId === undefined) {
                return util.sendJson(
                    res,
                    {
                        error: true,
                        message:
                            "payload requires a valid fields [documentId, staffId, studentId, documentType, image] but got undefined",
                    },
                    400
                );
            }
            if (payload.documentId === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "documentId cant be empty" },
                    400
                );
            }
            if (payload.documentType === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "documentType cant be empty" },
                    400
                );
            }
            if (payload.staffId === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "staffId cant be empty" },
                    400
                );
            }
            if (payload.studentId === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "studentId cant be empty" },
                    400
                );
            }
            if (payload.image === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "image cant be empty" },
                    400
                );
            }

            // validate type
            const validType = ["CF", "FYP"]
            if (!validType.includes(payload.documentType)) {
                return util.sendJson(
                    res,
                    { error: true, message: "document type is invalid: " + payload.documentType },
                    400
                );
            }


            try {

                const { documentId, documentType, staffId, studentId, image } = payload;
                const sql = `SELECT * FROM users WHERE userId=?`;
                db.query(sql, [staffId.trim()], (err, result) => {
                    if (err) {
                        return util.sendJson(
                            res,
                            { error: true, message: err.message },
                            400
                        );
                    }

                    if (result.length === 0) {
                        return util.sendJson(
                            res,
                            {
                                error: true,
                                message: "failed to save signature: staff doesnt exist",
                            },
                            400
                        );
                    }

                    // check the usertype cause we dont wanna allow student adding signature
                    if (result[0].type === "student") {
                        return util.sendJson(
                            res,
                            {
                                error: true,
                                message: "Not permitted to add signature",
                            },
                            403
                        );
                    }

                    // check if the studentId exists
                    const sql2 = `SELECT * FROM users WHERE userId=?`;
                    db.query(sql2, [studentId.trim()], (err, result2) => {
                        if (err) {
                            return util.sendJson(
                                res,
                                { error: true, message: err.message },
                                400
                            );
                        }

                        if (result2.length === 0) {
                            return util.sendJson(
                                res,
                                {
                                    error: true,
                                    message: "failed to save signature: student doesnt exists",
                                },
                                404
                            );
                        }

                        // check if the user was actually the one who submitted the doc
                        const check1 = `SELECT * FROM documents WHERE userId=? AND id=?`;
                        db.query(check1, [studentId.trim(), documentId.trim()], (err, result3) => {
                            if (err) {
                                return util.sendJson(
                                    res,
                                    { error: true, message: err.message },
                                    400
                                );
                            }

                            if (result3.length === 0) {
                                return util.sendJson(
                                    res,
                                    {
                                        error: true,
                                        message: "failed to save signature: student doesnt exists for this document",
                                    },
                                    404
                                );
                            }

                            // check the document permissions cause we only wanna allow those having valid permissions
                            const validPermission = [2, 4, 5, 6, 7]

                            if (!validPermission.includes(result[0].documentPermissions)) {
                                return util.sendJson(
                                    res,
                                    {
                                        error: true,
                                        message: "Not permitted to add signature",
                                    },
                                    403
                                );
                            }

                            // check if document exist
                            const q1 = `SELECT * FROM documents WHERE id=?`
                            db.query(q1, [documentId.trim()], (err, data1) => {
                                if (err) {
                                    return util.sendJson(
                                        res,
                                        { error: true, message: err.message },
                                        400
                                    );
                                }

                                if (data1.length === 0) {
                                    return util.sendJson(
                                        res,
                                        {
                                            error: true,
                                            message: "document doesnt exist, failed to add signature",
                                        },
                                        404
                                    );
                                }

                                // check if these user already have a signature added for this document

                                // store how many staff has signed
                                let staffSignatureLength = 0
                                let staffSignatureCheck = false


                                const q2 = `SELECT * FROM signatures WHERE documentId=? AND staffId=?`
                                db.query(q2, [documentId.trim(), staffId.trim()], (err, data2) => {
                                    if (err) {
                                        return util.sendJson(
                                            res,
                                            { error: true, message: err.message },
                                            400
                                        );
                                    }

                                    if (data2.rowCount > 0) {
                                        return util.sendJson(
                                            res,
                                            { error: true, message: "Your signature already exists for this document." },
                                            400
                                        );
                                    }

                                    // check then total signature and approve user document
                                    // check the total length of signature for a specific documents
                                    const checkSignatureLength = `SELECT * FROM signatures WHERE documentId=?`
                                    db.query(checkSignatureLength, [documentId.trim()], (err, checkRes) => {
                                        if (err) {
                                            return util.sendJson(
                                                res,
                                                { error: true, message: err.message },
                                                400
                                            );
                                        }

                                        // return console.log(checkRes.rows);

                                        staffSignatureLength = checkRes.length

                                        // check length if it equal to 3 and update document table
                                        const { mail, userName } = result2[0]
                                        const staffData = result[0]

                                        if (staffSignatureLength === 2) {
                                            // update document table 
                                            const docStatus = "approved"
                                            const updatesql = `UPDATE documents SET status=? WHERE id=?`
                                            return db.query(updatesql, [docStatus, documentId.trim()], (err) => {
                                                if (err) {
                                                    return util.sendJson(
                                                        res,
                                                        { error: true, message: err.message },
                                                        400
                                                    );
                                                }

                                                // send mail
                                                const payload = {
                                                    from: "E-Flow",
                                                    to: mail,
                                                    subject: "Document Approved",
                                                    body: `
                                                    <h1>Hello: ${userName}</h1>
                                                    <h1>Your ${documentType === "CF" ? "Course Form Document" : "Final Project Document"} Has been Approved by: </h1>
        
                                                    <h1>Name: ${staffData.userName}</h1>
                                                    <h1>Type: ${docPermission(staffData.documentPermissions)}</h1>
        
                                                    Date: ${util.formatDate()}`,
                                                }

                                                const mailResult = customMailer(payload)

                                                if (mailResult && mailResult !== undefined && mailResult.error === true) {
                                                    return util.sendJson(
                                                        res,
                                                        {
                                                            error: true,
                                                            message: "Failed to send mail: " + mailResult.message,
                                                        },
                                                        200
                                                    );
                                                }

                                                // INsert last staff in db
                                                const id = util.genId()
                                                const date = util.formatDate()
                                                const q3 = `INSERT INTO signatures(id,documentId, staffId, image, documentType, issued_at) VALUES(?,?,?,?,?,?)`

                                                db.query(q3, [id, documentId.trim(), staffId.trim(), image.trim(), documentType.trim(), date], (err) => {
                                                    if (err) {
                                                        return util.sendJson(
                                                            res,
                                                            { error: true, message: err.message },
                                                            400
                                                        );
                                                    }

                                                    // Update notifications table
                                                    // insert into notification table
                                                    const id = util.genId()
                                                    const joined = util.formatDate()
                                                    const isSeen = false;
                                                    const type = "document signature"
                                                    const message = `Your ${documentType === "CF" ? "Course Form Document" : "Final Project Document"} Has been approved`

                                                    const q4 = `INSERT INTO notifications(id, userId,staffId,message,isSeen, type, issued_at) VALUES(?,?,?,?,?,?,?)`
                                                    db.query(q4, [id, studentId.trim(), staffId.trim(), message, isSeen, type, joined], (err) => {
                                                        if (err) {
                                                            return util.sendJson(
                                                                res,
                                                                { error: true, message: err.message },
                                                                400
                                                            );
                                                        }

                                                        return util.sendJson(
                                                            res,
                                                            {
                                                                error: false,
                                                                message: "signature added successfully: document approved",
                                                            },
                                                            200
                                                        );
                                                    })
                                                })

                                            })
                                        }

                                        // if it not, then just do normal
                                        // send mail to student mail

                                        const payload = {
                                            from: "E-Flow",
                                            to: mail,
                                            subject: "Document Approved",
                                            body: `
                                            <h1>Hello: ${userName}</h1>

                                            <h1>Your ${documentType === "CF" ? "Course Form Document" : "Final Project Document"} Has been Signed by: </h1>

                                            <h1>Name: ${staffData.userName}</h1>
                                            <h1>Type: ${docPermission(staffData.documentPermissions)}</h1>

                                            Date: ${util.formatDate()}
                                        `,
                                        }

                                        const mailResult = customMailer(payload)

                                        console.log(mailResult);

                                        if (mailResult && mailResult !== undefined && mailResult.error === true) {
                                            return util.sendJson(
                                                res,
                                                {
                                                    error: true,
                                                    message: "Failed to send mail: " + mailResult.message,
                                                },
                                                200
                                            );
                                        }

                                        // insert signature in db
                                        const id = util.genId()
                                        const date = util.formatDate()
                                        const q3 = `INSERT INTO signatures(id,documentId, staffId, image, documentType, issued_at) VALUES(?,?,?,?,?,?)`

                                        db.query(q3, [id, documentId.trim(), staffId.trim(), image.trim(), documentType.trim(), date], (err) => {
                                            if (err) {
                                                return util.sendJson(
                                                    res,
                                                    { error: true, message: err.message },
                                                    400
                                                );
                                            }

                                            // Update notifications table
                                            // insert into notification table
                                            const id = util.genId()
                                            const joined = util.formatDate()
                                            const isSeen = false;
                                            const type = "document signature"
                                            const message = `Your ${documentType === "CF" ? "Course Form Document" : "Final Project Document"} Has been signed by <b>${staffData.userName}</b> ${docPermission(staffData.documentPermissions)}`

                                            const q4 = `INSERT INTO notifications(id, userId,staffId,message,isSeen, type, issued_at) VALUES(?,?,?,?,?,?,?)`
                                            db.query(q4, [id, studentId.trim(), staffId.trim(), message, isSeen, type, joined], (err) => {
                                                if (err) {
                                                    return util.sendJson(
                                                        res,
                                                        { error: true, message: err.message },
                                                        400
                                                    );
                                                }

                                                return util.sendJson(
                                                    res,
                                                    {
                                                        error: false,
                                                        message: "signature added successfully",
                                                    },
                                                    200
                                                );
                                            })
                                        })
                                    })

                                    return

                                    if (data2.rowCount > 0) {
                                        return util.sendJson(
                                            res,
                                            {
                                                error: true,
                                                message: "your signature already exists for this document",
                                            },
                                            400
                                        );
                                    }


                                    if (staffSignature === 2) {
                                        staffSignatureCheck = true

                                    }

                                    // insert signature in db
                                    const id = util.genId()
                                    const date = util.formatDate()
                                    const q3 = `INSERT INTO signatures(id,"documentId", "staffId", image, "documentType", "issued_at") VALUES($1,$2,$3,$4,$5,$6)`

                                    db.query(q3, [id, documentId.trim(), staffId.trim(), image.trim(), documentType.trim(), date], (err) => {
                                        if (err) {
                                            return util.sendJson(
                                                res,
                                                { error: true, message: err.message },
                                                400
                                            );
                                        }

                                        // send mail to student mail
                                        const { mail, userName } = result2.rows[0]
                                        const staffData = result.rows[0]


                                        const payload = {
                                            from: "E-Flow",
                                            to: mail,
                                            subject: documentType === "CF" ? "New Course Form Signature" : "New Final Project Signature",
                                            body: `
                                            <h1>Your ${documentType === "CF" ? "Course Form Document" : "Final Project Document"} Has been signed by: </h1>

                                            <h1>Name: ${staffData.userName}</h1>
                                            <h1>Type: ${docPermission(staffData.documentPermissions)}</h1>

                                            Date: ${util.formatDate()}
                                        `,
                                        }

                                        const mailResult = sendMail(res, payload)

                                        if (mailResult && mailResult.error === true) {
                                            return util.sendJson(
                                                res,
                                                {
                                                    error: true,
                                                    message: "Failed to send mail: " + mailResult.message,
                                                },
                                                200
                                            );
                                        }

                                        if (staffSignatureCheck === true) {
                                            // update document table 
                                            const docStatus = "approved"
                                            const updatesql = `UPDATE documents SET status=$1`
                                            db.query(updatesql, [docStatus], (err) => {
                                                if (err) {
                                                    return util.sendJson(
                                                        res,
                                                        { error: true, message: err.message },
                                                        400
                                                    );
                                                }
                                            })
                                        }

                                        // insert into notification table
                                        const id = util.genId()
                                        const joined = util.formatDate()
                                        const isSeen = false;
                                        const message = `Your ${documentType === "CF" ? "Course Form Document" : "Final Project Document"} Has been signed by  ${staffData.userName} ${docPermission(staffData.documentPermissions)}`

                                        const q4 = `INSERT INTO notifications() VALUES($1,$2,$3,$4)`
                                        db.query(q4, [id, studentId.trim(), staffId.trim()])

                                        return util.sendJson(
                                            res,
                                            {
                                                error: true,
                                                message: "signature added successfully",
                                            },
                                            200
                                        );
                                    })
                                })
                            })
                        })
                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500);
            }
        }
    }

    delete(res, payload) {
        if (payload && Object.entries(payload).length > 0) {
            if (payload.documentId === undefined || payload.staffId === undefined || payload.signatureId === undefined || payload.studentId === undefined) {
                return util.sendJson(
                    res,
                    {
                        error: true,
                        message:
                            "payload requires a valid fields [documentId, staffId, signatureId] but got undefined",
                    },
                    400
                );
            }
            if (payload.documentId === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "documentId cant be empty" },
                    400
                );
            }
            if (payload.signatureId === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "signatureId cant be empty" },
                    400
                );
            }
            if (payload.staffId === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "staffId cant be empty" },
                    400
                );
            }

            if (payload.studentId === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "studentId cant be empty" },
                    400
                );
            }


            try {

                const { documentId, signatureId, studentId, staffId } = payload;
                const sql = `SELECT * FROM users WHERE userId=?`;
                db.query(sql, [staffId.trim()], (err, result) => {
                    if (err) {
                        return util.sendJson(
                            res,
                            { error: true, message: err.message },
                            400
                        );
                    }

                    if (result.length === 0) {
                        return util.sendJson(
                            res,
                            {
                                error: true,
                                message: "failed to save signature: staff doesnt exist",
                            },
                            400
                        );
                    }

                    // check the usertype cause we dont wanna allow student deleting signature
                    if (result[0].type === "student") {
                        return util.sendJson(
                            res,
                            {
                                error: true,
                                message: "Not permitted to delete signature",
                            },
                            403
                        );
                    }

                    // check the document permissions cause we only wanna allow those having valid permissions
                    const validPermission = [2, 4, 5, 6, 7]

                    if (!validPermission.includes(result.rows[0].documentPermissions)) {
                        return util.sendJson(
                            res,
                            {
                                error: true,
                                message: "Not permitted to delete signature",
                            },
                            403
                        );
                    }

                    // check if student exist in db
                    const checkstudent = `SELECT * FROM users WHERE userId=?`
                    db.query(checkstudent, [studentId.trim()], (err, studentData) => {
                        if (err) {
                            return util.sendJson(
                                res,
                                { error: true, message: err.message },
                                400
                            );
                        }

                        if (studentData.length === 0) {
                            return util.sendJson(
                                res,
                                {
                                    error: true,
                                    message: "failed to save signature: student doesnt exist",
                                },
                                400
                            );
                        }

                        // check if document exist
                        const q1 = `SELECT * FROM documents WHERE id=?`
                        db.query(q1, [documentId.trim()], (err, data1) => {
                            if (err) {
                                return util.sendJson(
                                    res,
                                    { error: true, message: err.message },
                                    400
                                );
                            }

                            if (data1.rowCount === 0) {
                                return util.sendJson(
                                    res,
                                    {
                                        error: true,
                                        message: "document doesnt exist, failed to delete signature",
                                    },
                                    404
                                );
                            }

                            // check if signature exists

                            const q2 = `SELECT * FROM signatures WHERE id=? AND staffId=?`
                            db.query(q2, [signatureId.trim(), staffId.trim()], (err, data2) => {
                                if (err) {
                                    return util.sendJson(
                                        res,
                                        { error: true, message: err.message },
                                        400
                                    );
                                }

                                if (data2.length === 0) {
                                    return util.sendJson(
                                        res,
                                        {
                                            error: true,
                                            message: "failed to delete: signature not found.",
                                        },
                                        404
                                    );
                                }

                                // delete signature

                                const q3 = `DELETE FROM signatures WHERE id=? AND staffId=?`

                                db.query(q3, [signatureId.trim(), staffId.trim()], (err) => {
                                    if (err) {
                                        return util.sendJson(
                                            res,
                                            { error: true, message: err.message },
                                            400
                                        );
                                    }

                                    // deleting the signature would make the document in pending state, so we need to update the document based on the id and also send a notification to the student.

                                    // document update statement
                                    const q4 = `UPDATE documents SET status=? WHERE id=?`
                                    const status = "pending"
                                    db.query(q4, [status, documentId.trim()], (err) => {
                                        if (err) {
                                            return util.sendJson(
                                                res,
                                                { error: true, message: err.message },
                                                400
                                            );
                                        }

                                        // notification statement
                                        const id = util.genId()
                                        const joined = util.formatDate()
                                        const isSeen = false;
                                        const type = "document signature"
                                        const message = `${result.rows[0].userName} (${docPermission(result.rows[0].documentPermissions)}) deleted [her/his] signature from your ${data1.rows[0].documentType === "CF" ? "Course Form Document" : "Final Project Document"} `

                                        const q5 = `INSERT INTO notifications(id, userId,staffId,message,isSeen, type, issued_at) VALUES(?,?,?,?,?,?,?)`
                                        db.query(q5, [id, studentId.trim(), staffId.trim(), message, isSeen, type, joined], (err) => {
                                            if (err) {
                                                return util.sendJson(
                                                    res,
                                                    { error: true, message: err.message },
                                                    400
                                                );
                                            }

                                            return util.sendJson(
                                                res,
                                                {
                                                    error: false,
                                                    message: "signature deleted successfully",
                                                },
                                                200
                                            );
                                        })
                                    })
                                })
                            })
                        })

                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500);
            }
        }
    }
}

export default new Signature()

function customMailer(payload) {
    if (payload.from === undefined || payload.to === undefined) {
        return {
            error: true,
            message: "Failed to send mail, [ftom, to, payload] params might be missing",
        }
    }

    if (payload.body === undefined) {
        return {
            error: true,
            message: "Failed to send mail, payload [body] is undefined",
        }
    }
    if (payload.subject === undefined) {
        return {
            error: true,
            message: "Failed to send mail, payload [subject] is undefined",
        }
    }
    if (payload.subject === "") {
        return {
            error: true,
            message: "Failed to send mail, payload [subject] is empty",
        }
    }
    if (payload.body === "") {
        return { error: true, message: "Failed to send mail, payload [body] is empty" }

    }

    if (Object.entries(payload).length === 0) {
        return { error: true, message: "Failed to send mail, empty payload" }
    }

    if (payload.from === "") {
        return { error: true, message: "Failed to send mail, from is empty" }
    }
    if (payload.to === "") {
        return { error: true, message: "Failed to send mail, to is empty" }
    }

    const { from, to, subject, body } = payload;

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    let mailOptions = {
        from,
        to,
        subject,
        html: body,
    };

    try {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return { error: true, message: error.message }
            } else {
                return { error: false, message: "message sent successfully" }
            }
        });
    } catch (err) {
        return { error: true, message: err.message }
    }
}