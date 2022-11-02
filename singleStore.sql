
-- database creation

CREATE DATABASE IF NOT EXISTS eflow;

-- Tables Creations


CREATE TABLE IF NOT EXISTS users (
    id TEXT NOT NULL  PRIMARY KEY,
    userId TEXT NOT NULL,
    userName TEXT NOT NULL,
    mail TEXT NOT NULL,
    phoneNumber TEXT NOT NULL,
    type TEXT NOT NULL, -- student | staff
    hash TEXT NOT NULL,
    userRole TEXT NOT NULL, -- student | staff | admin
    userStatus TEXT NOT NULL, -- pending | approved
    refreshToken TEXT NOT NULL,
    joined TEXT NOT NULL, -- Date from moment
    documentPermissions INT
);


CREATE TABLE IF NOT EXISTS groups(
    id TEXT NOT NULL,
    name TEXT,
    courseType TEXT,
    courseName TEXT,
    userId TEXT NOT NULL,
    memberId TEXT NOT NULL,
    created_at TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS documents (
    id TEXT NOT NULL,
    title TEXT NOT NULL,
    documentType TEXT NOT NULL,
    courseType TEXT NOT NULL,
    courseName TEXT NOT NULL,
    userId TEXT , -- this would be filled up when submitting course form
    groupId TEXT, -- this would be filled up when submitting final year project
    supervisor TEXT,
    externalSupervisor TEXT,
    schoolOfficer TEXT,
    courseAdvisor TEXT,
    HOD TEXT,
    status TEXT NOT NULL,
    file LONGTEXT NOT NULL,
    created_at TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS docFeedback(
    id TEXT NOT NULL  PRIMARY KEY,
    note TEXT NOT NULL,
    documentId TEXT NOT NULL,
    staffId TEXT NOT NULL,
    created_at TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS codes (
    userId TEXT NOT NULL,
    token TEXT NOT NULL,
    issued_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT NOT NULL PRIMARY KEY,
    userId TEXT NOT NULL,
    staffId TEXT,
    message TEXT NOT NULL,
    isSeen TEXT NOT NULL,
    type TEXT NOT NULL,
    issued_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS signatures(
    id TEXT NOT NULL  PRIMARY KEY,
    documentId TEXT NOT NULL,
    staffId TEXT NOT NULL,
    image TEXT NOT NULL,
    documentType TEXT NOT NULL,
    issued_at TEXT NOT NULL
);








