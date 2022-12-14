import { db, util } from "../helpers/global.js";

/**
 * 
  Course form
    Hod *
    Course advisor 
    School Officer 

  Final project
    Supervisor 
    HOD *
    External Supervisor
 */

//  @Permissions_State (documents)
//  [Levels]
//   [ 1 ] -> READ/WRITE : normal staffs ( Course Cordinators)
//   [ 2 ] -> READ/WRITE : staff with higher responsibility ( HODS)
//   [ 3 ] -> READ/WRITE/EXECUTE/HighPermission : admins only
//   [ 4 ] -> READ/WRITE/EXECUTE : supervisor only
//   [ 5 ] -> READ/WRITE/EXECUTE : school officer only (for document approval / signing)
//   [ 6 ] -> READ/WRITE/EXECUTE : course advisor only (for document approval / signing)
//   [ 7 ] -> READ/WRITE/EXECUTE : External Supervisor only (for document approval / signing)

// Course form - School officer -> Course Advisor -> HOD
// Final year- Supervisor -> External examiner -> HOD

export default class Document {
  allDocs(res) {
    if (res === "" || res === undefined || res === null) {
      return "getting all documents requires a valid {res} object but got none";
    }
    try {
      const sql = `
                  SELECT 
                      documents.id,
                      documents.title,
                      documents.documentType,
                      documents.courseType,
                      documents.courseName,
                      documents.userId,
                      documents.groupId,
                      documents.status,
                      documents.HOD,
                      documents.supervisor,
                      documents.externalSupervisor,
                      documents.schoolOfficer,
                      documents.courseAdvisor,
                      users.userName,
                      documents.file
                  FROM 
                      documents
                  INNER JOIN
                      users
                  ON
                      users.userId=documents.HOD
                        `;
      db.query(sql, (err, result) => {
        if (err) {
          return util.sendJson(res, { error: true, message: err.message }, 400);
        }

        let documentData = [];

        if (result.length > 0) {
          result.forEach((data) => {
            documentData.push(data);
          });
        }

        return util.sendJson(
          res,
          { error: false, document: documentData },
          200
        );
      });
    } catch (err) {
      console.log(err);
      return util.sendJson(res, { error: true, message: err.message }, 500);
    }
  }

  docsById(res, payload) {
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

      // check if user exist
      try {
        const sql = `
                        SELECT 
                            documents.id,
                            documents.title,
                            documents.documentType,
                            documents.courseType,
                            documents.courseName,
                            documents.userId,
                            documents.groupId,
                            documents.status,
                            documents.HOD,
                            users.userName,
                            users.userName,
                            users.type,
                            users.documentPermissions,
                            documents.file
                        FROM 
                            documents
                        INNER JOIN
                            users
                        ON
                            users.userId=documents.userId
                        WHERE
                            documents.id=?
                        `;
        db.query(sql, [payload.documentId.trim()], async (err, result) => {
          if (err) {
            return util.sendJson(
              res,
              { error: true, message: err.message },
              400
            );
          }

          const {
            id,
            title,
            documentType,
            courseType,
            courseName,
            userId,
            groupId,
            status,
            HOD,
            userName,
            type,
            documentPermissions,
            file,
          } = result[0];

          // getting HOD info from users table

          const q1 = `SELECT * FROM users WHERE userId=?`;
          db.query(q1, [HOD], (err, data1) => {
            if (err) {
              return util.sendJson(
                res,
                { error: true, message: err.message },
                400
              );
            }

            const sendData = {
              id,
              title,
              documentType,
              courseType,
              courseName,
              userId,
              groupId,
              status,
              HOD,
              hodName: data1[0].userName,
              studentName: userName,
              type,
              documentPermissions: data1[0].documentPermissions,
              file,
            };

            return util.sendJson(
              res,
              { error: false, document: [sendData] },
              200
            );
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  docsByUserId(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "feteching documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (payload.userId === undefined) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [userId] but got undefined",
          },
          400
        );
      }

      if (payload.userId === "") {
        return util.sendJson(
          res,
          { error: true, message: "userId cant be empty" },
          400
        );
      }

      try {
        const { userId } = payload;
        // check if user exist
        const q1 = `SELECT * FROM users`;
        db.query(q1, [userId.trim()], (err, data1) => {
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
                message: "failed getting document: user doesnt exist",
              },
              404
            );
          }

          const q2 = `
                    SELECT *

                    FROM 
                        documents 
                    WHERE 
                        userId=?
                    `;
          db.query(q2, [userId.trim()], (err, data2) => {
            if (err) {
              return util.sendJson(
                res,
                { error: true, message: err.message },
                400
              );
            }

            return util.sendJson(
              res,
              { error: false, document: data2 },
              200
            );
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  docsByGroupId(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "deleting documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (payload.groupId === undefined) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [groupId] but got undefined",
          },
          400
        );
      }

      if (payload.groupId === "") {
        return util.sendJson(
          res,
          { error: true, message: "groupId cant be empty" },
          400
        );
      }

      // check if user exist
      try {
        let groupData = {};

        const sql = `SELECT * FROM documents WHERE groupId=?`;
        db.query(sql, [payload.groupId.trim()], (err, result) => {
          if (err) {
            return util.sendJson(
              res,
              { error: true, message: err.message },
              400
            );
          }

          if (result.length > 0) {
            groupData["name"] = result[0].name;
            groupData["users"] = result[0].users;
          }

          // return util.sendJson(res, { error: false, data: result.rows }, 200)
        });

        return groupData;
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }
  // Add final
  addFYP(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "submitting documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.title === undefined ||
        payload.userId === undefined ||
        payload.supervisor === undefined ||
        payload.externalSupervisor === undefined ||
        payload.HOD === undefined ||
        payload.groupId === undefined ||
        payload.courseName === undefined ||
        payload.courseType === undefined ||
        payload.file === undefined ||
        payload.documentType === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [userId,supervisor,externalSupervisor,HOD,groupId,courseName,courseType,title,file,documentType] but got undefined",
          },
          400
        );
      }
      if (payload.title === "") {
        return util.sendJson(
          res,
          { error: true, message: "title cant be empty" },
          400
        );
      }
      if (payload.userId === "") {
        return util.sendJson(
          res,
          { error: true, message: "userId cant be empty" },
          400
        );
      }
      if (payload.supervisor === "") {
        return util.sendJson(
          res,
          { error: true, message: "supervisor cant be empty" },
          400
        );
      }
      if (payload.externalSupervisor === "") {
        return util.sendJson(
          res,
          { error: true, message: "externalSupervisor cant be empty" },
          400
        );
      }
      if (payload.HOD === "") {
        return util.sendJson(
          res,
          { error: true, message: "HOD cant be empty" },
          400
        );
      }
      if (payload.groupId === "") {
        return util.sendJson(
          res,
          { error: true, message: "groupId cant be empty" },
          400
        );
      }
      if (payload.courseType === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseType cant be empty" },
          400
        );
      }
      if (payload.courseName === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseName cant be empty" },
          400
        );
      }
      if (Object.entries(payload.file).length === 0) {
        return util.sendJson(
          res,
          { error: true, message: "file cant be empty" },
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

      // validate file
      const validFileExt = ["pdf"];
      if (
        payload.file.type !== undefined &&
        validFileExt.includes(payload.file.type) === false
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message: `invalid file type [ ${payload.file.type} ] valid file [.pdf]`,
          },
          400
        );
      }
      if (payload.file.data === undefined || payload.file.data === "") {
        return util.sendJson(
          res,
          { error: true, message: "expected file data, but got nothing" },
          400
        );
      }

      // unpack data
      const {
        title,
        userId,
        supervisor,
        externalSupervisor,
        HOD,
        groupId,
        courseName,
        courseType,
        file,
        documentType,
      } = payload;

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE userId=?`;
        db.query(sql, [userId.trim()], (err, result) => {
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
                message: "failed to submit document: student doesnt exist",
              },
              400
            );
          }

          // check if school officer exists in database
          const check1 = `SELECT * FROM users WHERE userId=?`;
          // check if course advisor exists in database
          const check2 = `SELECT * FROM users WHERE userId=?`;
          // check if HOD exists in database
          const check3 = `SELECT * FROM users WHERE userId=?`;

          // CHECK 1

          db.query(check1, [supervisor.trim()], (err, data1) => {
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
                  message: "failed to submit document: supervisor doesnt exist",
                },
                404
              );
            }
            // if exist, check if it has a documentPermission of 3
            if (data1.length > 0 && data1[0].documentPermissions !== 4) {
              return util.sendJson(
                res,
                {
                  error: true,
                  message: "the staff you added isnt a supervisor.",
                },
                403
              );
            }

            // CHECK 2

            db.query(check2, [externalSupervisor.trim()], (err, data2) => {
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
                    message:
                      "failed to submit document: external supervisor doesnt exist",
                  },
                  404
                );
              }

              // if exist, check if it has a documentPermission of 7
              if (
                data2.length > 0 &&
                data2[0].documentPermissions !== 7
              ) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message: "the staff you added isnt external supervisor.",
                  },
                  403
                );
              }

              // CHECK 3
              db.query(check3, [HOD.trim()], (err, data3) => {
                if (err) {
                  return util.sendJson(
                    res,
                    { error: true, message: err.message },
                    400
                  );
                }

                if (data3.length === 0) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message: "failed to submit document: HOD doesnt exist",
                    },
                    404
                  );
                }

                // if exist, check if it has a documentPermission of 5
                if (
                  data3.length > 0 &&
                  data3[0].documentPermissions !== 2
                ) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message: "the staff you added isnt an H.O.D.",
                    },
                    403
                  );
                }

                // Continue if all went well

                // check if user submitting document isnt a staff
                if (result[0].type === "staff") {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message:
                        "only students are meant to submit document not staff",
                    },
                    400
                  );
                }

                // check if group exists
                const sql2 = `SELECT * FROM groups WHERE id=?`;
                db.query(sql2, [groupId.trim()], (err, data4) => {
                  if (err) {
                    return util.sendJson(
                      res,
                      { error: true, message: err.message },
                      400
                    );
                  }

                  if (data4.length === 0) {
                    return util.sendJson(
                      res,
                      {
                        error: true,
                        message: "the group you added doesnt exists.",
                      },
                      404
                    );
                  }

                  // check if student/user trying to submit document for a specific group exist in that group

                  const sql3 = `SELECT * FROM groups WHERE id=? AND memberId=?`;
                  db.query(
                    sql3,
                    [payload.groupId.trim(), payload.userId.trim()],
                    (err, data5) => {
                      if (err) {
                        return util.sendJson(
                          res,
                          { error: true, message: err.message },
                          400
                        );
                      }

                      if (data5.length === 0) {
                        return util.sendJson(
                          res,
                          {
                            error: true,
                            message:
                              "failed: cant submit document for a group you dont belong to.",
                          },
                          403
                        );
                      }

                      // check if document which the group is trying to submit already exists
                      const sql3 = `SELECT * FROM documents WHERE groupId=? AND documentType=? AND title=? AND courseType=? AND courseName=?`;
                      db.query(
                        sql3,
                        [
                          payload.groupId,
                          payload.documentType,
                          payload.title,
                          payload.courseType,
                          payload.courseName,
                        ],
                        (err, data6) => {
                          if (err) {
                            return util.sendJson(
                              res,
                              { error: true, message: err.message },
                              400
                            );
                          }

                          if (data6.length > 0) {
                            return util.sendJson(
                              res,
                              {
                                error: true,
                                message:
                                  "document youre trying to submit already exist.",
                              },
                              200
                            );
                          }

                          // save document in database
                          const fileData = file.data;
                          const id = util.genId();
                          const status = "pending";
                          const date = util.formatDate();

                          const sql4 = `INSERT INTO documents(id,title,documentType,courseType,courseName,userId, groupId,supervisor, externalSupervisor, HOD,status,file,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                          db.query(
                            sql4,
                            [
                              id.trim(),
                              title.trim(),
                              documentType.trim(),
                              courseType.trim(),
                              courseName.trim(),
                              userId.trim(),
                              groupId.trim(),
                              supervisor,
                              externalSupervisor,
                              HOD,
                              status.trim(),
                              fileData.trim(),
                              date.trim(),
                            ],
                            (err) => {
                              if (err) {
                                return util.sendJson(
                                  res,
                                  { error: true, message: err.message },
                                  400
                                );
                              }

                              // insert into notification table
                              const id = util.genId()
                              const joined = util.formatDate()
                              const isSeen = false;
                              const type = "document added"
                              const message = `You were added in behalf of a ${documentType === "CF" ? "Course Form Document" : "Final Project Document"} `

                              const q4 = `INSERT INTO notifications(id, userId,staffId,message,isSeen, type, issued_at) VALUES(?,?,?,?,?,?,?)`
                              db.query(q4, [id, schoolOfficer.trim(), userId.trim(), message, isSeen, type, joined], (err) => {
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
                                    message: "document submitted successfully.",
                                  },
                                  200
                                );
                              })
                            }
                          );
                        }
                      );
                    }
                  );
                });
              });
            });
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }
  // Add COURSE FORM
  addCF(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "submitting documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.title === undefined ||
        payload.userId === undefined ||
        payload.schoolOfficer === undefined ||
        payload.courseAdvisor === undefined ||
        payload.HOD === undefined ||
        payload.courseName === undefined ||
        payload.courseType === undefined ||
        payload.file === undefined ||
        payload.documentType === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [userId,staffId,courseName,courseType,title,file,documentType] but got undefined",
          },
          400
        );
      }
      if (payload.title === "") {
        return util.sendJson(
          res,
          { error: true, message: "title cant be empty" },
          400
        );
      }
      if (payload.userId === "") {
        return util.sendJson(
          res,
          { error: true, message: "userId cant be empty" },
          400
        );
      }
      if (payload.schoolOfficer === "") {
        return util.sendJson(
          res,
          { error: true, message: "school officer cant be empty" },
          400
        );
      }
      if (payload.courseAdvisor === "") {
        return util.sendJson(
          res,
          { error: true, message: "course advisor cant be empty" },
          400
        );
      }
      if (payload.HOD === "") {
        return util.sendJson(
          res,
          { error: true, message: "HOD cant be empty" },
          400
        );
      }
      if (payload.courseName === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseName cant be empty" },
          400
        );
      }
      if (Object.entries(payload.file).length === 0) {
        return util.sendJson(
          res,
          { error: true, message: "file cant be empty" },
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

      // validate file
      const validFileExt = ["pdf"];
      if (
        payload.file.type !== undefined &&
        validFileExt.includes(payload.file.type) === false
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message: `invalid file type [ ${payload.file.type} ] valid file [.pdf]`,
          },
          400
        );
      }
      if (payload.file.data === undefined || payload.file.data === "") {
        return util.sendJson(
          res,
          { error: true, message: "expected file data, but got nothing" },
          400
        );
      }

      // unpack data
      const {
        title,
        userId,
        schoolOfficer,
        courseAdvisor,
        HOD,
        courseName,
        courseType,
        file,
        documentType,
      } = payload;
      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE userId=?`;
        db.query(sql, [userId.trim()], (err, result) => {
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
                message: "failed to submit document: student doesnt exist",
              },
              404
            );
          }

          // check if school officer exists in database
          const check1 = `SELECT * FROM users WHERE userId=?`;
          // check if course advisor exists in database
          const check2 = `SELECT * FROM users WHERE userId=?`;
          // check if HOD exists in database
          const check3 = `SELECT * FROM users WHERE userId=?`;

          db.query(check1, [schoolOfficer.trim()], (err, data1) => {
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
                  message:
                    "failed to submit document: schoolOfficer doesnt exist",
                },
                404
              );
            }
            // if exist, check if it has a documentPermission of 5
            if (data1.length > 0 && data1[0].documentPermissions !== 5) {
              return util.sendJson(
                res,
                {
                  error: true,
                  message: "the staff you added isnt a school officer.",
                },
                403
              );
            }

            db.query(check2, [courseAdvisor.trim()], (err, data2) => {
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
                    message:
                      "failed to submit document: course advisor doesnt exist",
                  },
                  404
                );
              }

              // if exist, check if it has a documentPermission of 5
              if (
                data2.length > 0 &&
                data2[0].documentPermissions !== 6
              ) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message: "the staff you added isnt a course advisor.",
                  },
                  403
                );
              }

              db.query(check3, [HOD.trim()], (err, data3) => {
                if (err) {
                  return util.sendJson(
                    res,
                    { error: true, message: err.message },
                    400
                  );
                }

                if (data3.length === 0) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message: "failed to submit document: HOD doesnt exist",
                    },
                    404
                  );
                }

                // if exist, check if it has a documentPermission of 5
                if (
                  data3.length > 0 &&
                  data3[0].documentPermissions !== 2
                ) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message: "the staff you added isnt an H.O.D.",
                    },
                    403
                  );
                }

                // /Continue if all went well

                // check if user submitting document isnt a staff based on the first query above
                if (result[0].type === "staff") {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message:
                        "only students are meant to submit document not staff",
                    },
                    400
                  );
                }

                // check if document which the user/student is trying to submit already exists
                const sql3 = `SELECT * FROM documents WHERE userId=? AND documentType=? AND title=? AND courseType=? AND courseName=?`;
                db.query(
                  sql3,
                  [
                    userId.trim(),
                    documentType.trim(),
                    title.trim(),
                    courseType.trim(),
                    courseName.trim(),
                  ],
                  (err, data4) => {
                    if (err) {
                      return util.sendJson(
                        res,
                        { error: true, message: err.message },
                        400
                      );
                    }

                    if (data4.length > 0) {
                      return util.sendJson(
                        res,
                        {
                          error: true,
                          message:
                            "document youre trying to submit already exist.",
                        },
                        200
                      );
                    }

                    // save document in database
                    const fileData = file.data;
                    const id = util.genId();
                    const status = "pending";
                    const date = util.formatDate();

                    const sql4 = `INSERT INTO documents(id,title,documentType,courseType,courseName,userId,schoolOfficer, courseAdvisor, HOD,status,file,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`;
                    db.query(
                      sql4,
                      [
                        id.trim(),
                        title.trim(),
                        documentType.trim(),
                        courseType.trim(),
                        courseName.trim(),
                        userId.trim(),
                        schoolOfficer,
                        courseAdvisor,
                        HOD,
                        status.trim(),
                        fileData.trim(),
                        date.trim(),
                      ],
                      (err) => {
                        if (err) {
                          return util.sendJson(
                            res,
                            { error: true, message: err.message },
                            400
                          );
                        }

                        // send notification
                        // insert into notification table
                        const id = util.genId()
                        const joined = util.formatDate()
                        const isSeen = false;
                        const type = "document added"
                        const message = `You were added in behalf of a ${documentType === "CF" ? "Course Form Document" : "Final Project Document"} `

                        const q4 = `INSERT INTO notifications(id, userId,staffId,message,isSeen, type, issued_at) VALUES(?,?,?,?,?,?,?)`
                        db.query(q4, [id, schoolOfficer.trim(), userId.trim(), message, isSeen, type, joined], (err) => {
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
                              message: "document submitted successfully",
                            },
                            200
                          );
                        })


                      }
                    );
                  }
                );
              });
            });
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  editFYP(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "editing documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.title === undefined ||
        payload.userId === undefined ||
        payload.staffId === undefined ||
        payload.groupId === undefined ||
        payload.courseName === undefined ||
        payload.courseType === undefined ||
        payload.changeFile === undefined ||
        payload.documentType === undefined ||
        payload.documentId === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [userId,staffId,groupId,courseName,courseType,title,file,documentType,changeFile,documentId] but got undefined",
          },
          400
        );
      }
      if (payload.title === "") {
        return util.sendJson(
          res,
          { error: true, message: "title cant be empty" },
          400
        );
      }
      if (payload.userId === "") {
        return util.sendJson(
          res,
          { error: true, message: "userId cant be empty" },
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
      if (payload.groupId === "") {
        return util.sendJson(
          res,
          { error: true, message: "groupId cant be empty" },
          400
        );
      }
      if (payload.courseType === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseType cant be empty" },
          400
        );
      }
      if (payload.courseName === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseName cant be empty" },
          400
        );
      }
      if (Object.entries(payload.file).length === 0) {
        return util.sendJson(
          res,
          { error: true, message: "file cant be empty" },
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
      if (payload.documentId === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentId cant be empty" },
          400
        );
      }

      // validate file
      const validFileExt = ["pdf"];
      if (
        payload.changeFile === true &&
        payload.file.type !== undefined &&
        validFileExt.includes(payload.file.type) === false
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message: `invalid file type [ ${payload.file.type} ] valid file [.pdf]`,
          },
          400
        );
      }
      if (
        (payload.changeFile === true && payload.file.data === undefined) ||
        payload.file.data === ""
      ) {
        return util.sendJson(
          res,
          { error: true, message: "expected file data, but got nothing" },
          400
        );
      }

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE "userId"=$1`;
        db.query(sql, [payload.userId.trim()], (err, result) => {
          if (err) {
            return util.sendJson(
              res,
              { error: true, message: err.message },
              400
            );
          }

          if (result.rowCount === 0) {
            return util.sendJson(
              res,
              {
                error: true,
                message: "failed to edit document: student doesnt exist",
              },
              400
            );
          }

          // check if user editting document isnt a staff
          if (result.rows[0].type === "staff") {
            return util.sendJson(
              res,
              {
                error: true,
                message: "only students are meant to edit document not staff",
              },
              400
            );
          }

          // check if staff/cordinator exists
          db.query(sql, [payload.staffId.trim()], (err, data1) => {
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
                  message:
                    "failed to submit document: cordinator doesnt exists",
                },
                404
              );
            }

            // check if user submitting document is a staff
            if (data1.rows[0].type !== "staff") {
              return util.sendJson(
                res,
                { error: true, message: "cordinator added isnt a staff" },
                400
              );
            }

            // check if group exists
            const sql2 = `SELECT * FROM groups WHERE id=?`;
            db.query(sql2, [payload.groupId.trim()], (err, data2) => {
              if (err) {
                return util.sendJson(
                  res,
                  { error: true, message: err.message },
                  400
                );
              }

              if (data2.rowCount === 0) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message: "the group you added doesnt exists.",
                  },
                  404
                );
              }

              // check if student/user trying to editing document for a specific group exist in that group

              const membersIds = data2.rows[0].usersId;

              if (membersIds.includes(payload.userId) === false) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message:
                      "fialed: cant edit document for a group you dont belong to.",
                  },
                  403
                );
              }

              // check if document which the group is trying to edit exists
              const sql3 = `SELECT * FROM documents WHERE groupId=? AND documentType=? AND userId=? AND id=?`;
              db.query(
                sql3,
                [
                  payload.groupId.trim(),
                  payload.documentType.trim(),
                  payload.userId.trim(),
                  payload.documentId.trim(),
                ],
                (err, data3) => {
                  if (err) {
                    return util.sendJson(
                      res,
                      { error: true, message: err.message },
                      400
                    );
                  }

                  if (data3.length === 0) {
                    return util.sendJson(
                      res,
                      {
                        error: true,
                        message: "failed to delete: document not found.",
                      },
                      404
                    );
                  }

                  // save document in database
                  const {
                    title,
                    documentType,
                    documentId,
                    userId,
                    groupId,
                    staffId,
                    courseName,
                    courseType,
                    changeFile,
                  } = payload;
                  const date = util.formatDate();

                  // check if the user is trying to edit file
                  if (changeFile === false) {
                    const sql4 = `UPDATE documents SET title=?, documentType=?,courseType=?,courseName=?, userId=? ,groupId=? ,staffId=? ,created_at=? WHERE groupId=? AND userId=? AND id=?`;
                    db.query(
                      sql4,
                      [
                        title.trim(),
                        documentType.trim(),
                        courseType.trim(),
                        courseName.trim(),
                        userId.trim(),
                        groupId.trim(),
                        staffId.trim(),
                        date.trim(),
                        groupId.trim(),
                        userId.trim(),
                        documentId.trim(),
                      ],
                      (err) => {
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
                            error: true,
                            message: "document updated successfully.",
                          },
                          200
                        );
                      }
                    );
                  }

                  if (changeFile === true) {
                    const fileData = payload.file.data;
                    const sql5 = `UPDATE documents SET title=?, documentType=?,courseType=?,courseName=?, userId=? ,groupId=?, staffId=?, file=? ,created_at=? WHERE groupId=?0 AND userId=? AND id=?`;

                    db.query(
                      sql5,
                      [
                        title.trim(),
                        documentType.trim(),
                        courseType.trim(),
                        courseName.trim(),
                        userId.trim(),
                        groupId.trim(),
                        staffId.trim(),
                        fileData.trim(),
                        date.trim(),
                        groupId.trim(),
                        userId.trim(),
                        documentId.trim(),
                      ],
                      (err) => {
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
                            error: true,
                            message: "document updated successfully.",
                          },
                          200
                        );
                      }
                    );
                  }
                }
              );
            });
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  editCF(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "editing documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.title === undefined ||
        payload.userId === undefined ||
        payload.staffId === undefined ||
        payload.courseName === undefined ||
        payload.courseType === undefined ||
        payload.changeFile === undefined ||
        payload.documentType === undefined ||
        payload.documentId === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [userId,staffId,courseName,courseType,title,file,documentType] but got undefined",
          },
          400
        );
      }
      if (payload.title === "") {
        return util.sendJson(
          res,
          { error: true, message: "title cant be empty" },
          400
        );
      }
      if (payload.userId === "") {
        return util.sendJson(
          res,
          { error: true, message: "userId cant be empty" },
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
      if (payload.courseType === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseType cant be empty" },
          400
        );
      }
      if (payload.courseName === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseName cant be empty" },
          400
        );
      }
      if (Object.entries(payload.file).length === 0) {
        return util.sendJson(
          res,
          { error: true, message: "file cant be empty" },
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
      if (payload.documentId === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentId cant be empty" },
          400
        );
      }

      // validate file
      const validFileExt = ["pdf"];
      if (
        payload.changeFile === true &&
        payload.file.type !== undefined &&
        validFileExt.includes(payload.file.type) === false
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message: `invalid file type [ ${payload.file.type} ] valid file [.pdf]`,
          },
          400
        );
      }
      if (
        (payload.changeFile === true && payload.file.data === undefined) ||
        payload.file.data === ""
      ) {
        return util.sendJson(
          res,
          { error: true, message: "expected file data, but got nothing" },
          400
        );
      }

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE userId=?`;
        db.query(sql, [payload.userId.trim()], (err, result) => {
          if (err) {
            return util.sendJson(
              res,
              { error: true, message: err.message },
              400
            );
          }

          if (result.rowCount === 0) {
            return util.sendJson(
              res,
              {
                error: true,
                message: "failed to edit document: student doesnt exist",
              },
              400
            );
          }

          // check if user editting document isnt a staff
          if (result[0].type === "staff") {
            return util.sendJson(
              res,
              {
                error: true,
                message: "only students are meant to edit document not staff",
              },
              400
            );
          }

          // check if staff/cordinator exists
          db.query(sql, [payload.staffId.trim()], (err, data1) => {
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
                  message:
                    "failed to submit document: cordinator doesnt exists",
                },
                404
              );
            }

            // check if user submitting document is a staff
            if (data1[0].type !== "staff") {
              return util.sendJson(
                res,
                { error: true, message: "cordinator added isnt a staff" },
                400
              );
            }

            // check if document which the group is trying to edit exists

            const sql3 = `SELECT * FROM documents WHERE id=? AND documentType=? AND userId=?`;
            db.query(
              sql3,
              [
                payload.documentId.trim(),
                payload.documentType.trim(),
                payload.userId.trim(),
              ],
              (err, data3) => {
                if (err) {
                  return util.sendJson(
                    res,
                    { error: true, message: err.message },
                    400
                  );
                }

                if (data3.length === 0) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message: "failed to delete: document not found.",
                    },
                    404
                  );
                }

                // update document in database
                const {
                  title,
                  documentType,
                  documentId,
                  userId,
                  staffId,
                  courseName,
                  courseType,
                  changeFile,
                } = payload;
                const date = util.formatDate();

                // check if the user is trying to edit file
                if (changeFile === false) {
                  const sql4 = `UPDATE documents SET title=$1, "documentType"=$2,"courseType"=$3,"courseName"=$4, "userId"=$5 ,"staffId"=$6 ,"created_at"=$7 WHERE "userId"=$8 AND id=$9`;
                  db.query(
                    sql4,
                    [
                      title.trim(),
                      documentType.trim(),
                      courseType.trim(),
                      courseName.trim(),
                      userId.trim(),
                      staffId.trim(),
                      date.trim(),
                      userId.trim(),
                      documentId.trim(),
                    ],
                    (err) => {
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
                          error: true,
                          message: "document updated successfully.",
                        },
                        200
                      );
                    }
                  );
                }

                if (changeFile === true) {
                  const fileData = payload.file.data;
                  const sql5 = `UPDATE documents SET title=?, documentType=?,courseType=?,courseName=?, userId=? ,groupId=?, staffId=?, file=? ,created_at=? WHERE groupId=?0 AND userId=? AND id=?`;

                  db.query(
                    sql5,
                    [
                      title.trim(),
                      documentType.trim(),
                      courseType.trim(),
                      courseName.trim(),
                      userId.trim(),
                      staffId.trim(),
                      fileData.trim(),
                      date.trim(),
                      userId.trim(),
                      documentId.trim(),
                    ],
                    (err) => {
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
                          error: true,
                          message: "document updated successfully.",
                        },
                        200
                      );
                    }
                  );
                }
              }
            );
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  delete(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "deleting documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.userId === undefined ||
        payload.documentId === undefined ||
        payload.documentType === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [userId,documentId,documentType] but got undefined",
          },
          400
        );
      }
      if (payload.userId === "") {
        return util.sendJson(
          res,
          { error: true, message: "userId cant be empty" },
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
      if (payload.documentId === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentId cant be empty" },
          400
        );
      }

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE userId=?`;
        db.query(sql, [payload.userId.trim()], (err, result) => {
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
                message: "failed to delete document: student doesnt exist",
              },
              400
            );
          }

          // check if user deleting document isnt a staff
          if (result[0].type === "staff") {
            return util.sendJson(
              res,
              {
                error: true,
                message: "only students are meant to delete document not staff",
              },
              400
            );
          }

          // check if document which the group/user is trying to edit exists
          const sql2 = `SELECT * FROM documents WHERE id=? AND documentType=? AND userId=?`;
          db.query(
            sql2,
            [
              payload.documentId.trim(),
              payload.documentType.trim(),
              payload.userId.trim(),
            ],
            (err, data1) => {
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
                    message: "failed to delete: document not found.",
                  },
                  404
                );
              }

              // update document in database
              const { documentType, documentId, userId } = payload;

              //   remove other data in relation with documents table before deleting main document

              const sql3 = `DELETE FROM docFeedback WHERE documentId=?`;
              db.query(sql3, [documentId.trim()], (err) => {
                if (err) {
                  return util.sendJson(
                    res,
                    { error: true, message: err.message },
                    400
                  );
                }

                // delete signature based on the documentId
                const delSignature = `DELETE FROM signatures WHERE documentId=?`;
                db.query(delSignature, [documentId.trim()], (err) => {
                  if (err) {
                    return util.sendJson(
                      res,
                      { error: true, message: err.message },
                      400
                    );
                  }

                  const sql4 = `DELETE FROM documents WHERE id=? AND userId=? AND documentType=?`;
                  db.query(
                    sql4,
                    [documentId.trim(), userId.trim(), documentType.trim()],
                    (err) => {
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
                          message: "document deleted successfully.",
                        },
                        200
                      );
                    }
                  );
                });
              });
            }
          );
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  docFeedback(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "fetching document feedback requires a valid {res} object but got none";
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

      // check if user exist
      try {
        const sql = `
                        SELECT 
                            docFeedback.id,
                            docFeedback.note,
                            docFeedback.staffId,
                            docFeedback.documentId,
                            users.userName
                        FROM 
                            docFeedback
                        INNER JOIN
                            users
                        ON
                            users.userId=docFeedback.staffId
                        WHERE
                            docFeedback.documentId=?
                        `;
        db.query(sql, [payload.documentId.trim()], async (err, result) => {
          if (err) {
            return util.sendJson(
              res,
              { error: true, message: err.message },
              400
            );
          }

          return util.sendJson(res, { error: false, data: result.rows }, 200);
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  addFeedBack(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "submitting documents feedback requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.note === undefined ||
        payload.staffId === undefined ||
        payload.documentId === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [staffId,documentId,note] but got undefined",
          },
          400
        );
      }
      if (payload.note === "") {
        return util.sendJson(
          res,
          { error: true, message: "note cant be empty" },
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
      if (payload.courseType === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseType cant be empty" },
          400
        );
      }
      if (payload.courseName === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseName cant be empty" },
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

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE userId=?`;
        db.query(sql, [payload.staffId.trim()], (err, result) => {
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
                message:
                  "failed to submit document feedback: user doesnt exist",
              },
              400
            );
          }

          // check if user submitting document isnt a student
          if (result[0].type === "student") {
            return util.sendJson(
              res,
              {
                error: true,
                message:
                  "only staff are meant to add document feedback not student",
              },
              400
            );
          }

          // check if staff/cordinator exists
          db.query(sql, [payload.staffId.trim()], (err, data1) => {
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
                  message:
                    "failed to submit document feedback: cordinator doesnt exists",
                },
                404
              );
            }

            // check if document which the staff is trying to submit already exists
            const sql3 = `SELECT * FROM documents WHERE id=?`;
            db.query(sql3, [payload.documentId.trim()], (err, data4) => {
              if (err) {
                return util.sendJson(
                  res,
                  { error: true, message: err.message },
                  400
                );
              }

              if (data4.rowCount === 0) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message:
                      "document youre trying to submit feedback for doesnt exist.",
                  },
                  200
                );
              }

              // save feedback in database
              const { note, groupId, staffId, documentId } = payload;
              const id = util.genId();
              const date = util.formatDate();

              const sql4 = `INSERT INTO docFeedback(id,note,staffId,documentId,created_at) VALUES(?,?,?,?,?)`;
              db.query(
                sql4,
                [
                  id.trim(),
                  note.trim(),
                  staffId.trim(),
                  documentId.trim(),
                  date.trim(),
                ],
                (err) => {
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
                      message: "feedback submitted successfully.",
                    },
                    200
                  );
                }
              );
            });
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  deleteFeedback(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "deleting document feedback requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.documentId === undefined ||
        payload.staffId === undefined ||
        payload.feedbackId === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [documentId, staffId, feedbackId] but got undefined",
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
      if (payload.staffId === "") {
        return util.sendJson(
          res,
          { error: true, message: "staffId cant be empty" },
          400
        );
      }
      if (payload.feedbackId === "") {
        return util.sendJson(
          res,
          { error: true, message: "feedbackId cant be empty" },
          400
        );
      }

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE userId=?`;
        db.query(sql, [payload.staffId.trim()], (err, result) => {
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
                message:
                  "failed to delete document feedback: user doesnt exist",
              },
              400
            );
          }

          // check if user deleting document isnt a staff
          if (result[0].type === "student") {
            return util.sendJson(
              res,
              {
                error: true,
                message:
                  "only staff are meant to delete document feedback not student",
              },
              403
            );
          }

          // check if document which the staff is trying to delete exists
          const sql2 = `SELECT * FROM documents WHERE id=?`;
          db.query(sql2, [payload.documentId.trim()], (err, data1) => {
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
                  message: "failed to delete feedback: document doesnt exist.",
                },
                404
              );
            }

            // update document in database
            const { feedbackId, documentId, staffId } = payload;

            // check if feedback exist before deletting
            const q3 = `SELECT * FROM docFeedback WHERE id=? AND staffId=?`;
            db.query(q3, [feedbackId.trim(), staffId.trim()], (err, data2) => {
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
                    message: "failed to delete: feedback doesnt exist.",
                  },
                  404
                );
              }

              const sql3 = `DELETE FROM docFeedback WHERE id=? AND staffId=? AND documentId=?`;
              db.query(
                sql3,
                [feedbackId.trim(), staffId.trim(), documentId.trim()],
                (err) => {
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
                      message: "document feedback deleted successfully.",
                    },
                    200
                  );
                }
              );
            });
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }
}
