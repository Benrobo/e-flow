### E-flow Logic

This is an electronic workflow system system built for SingleStore Hackathon. a system meant for automating the workflow when submitting either `school form`, `final year report` , `course form` or any other school documents.

-------

<img src="https://raw.githubusercontent.com/Benrobo/e-workflow-client/main/readmeImg/dashboard.png" />

<img src="https://raw.githubusercontent.com/Benrobo/e-workflow-client/main/readmeImg/grant%20request.png" />

<img src="https://raw.githubusercontent.com/Benrobo/e-workflow-client/main/readmeImg/collab.png" />

<img src="https://raw.githubusercontent.com/Benrobo/e-workflow-client/main/readmeImg/submission.png" />

<img src="https://raw.githubusercontent.com/Benrobo/e-workflow-client/main/readmeImg/document-sub.png" />


This contain the backend logic of `e-workflow` client app.

This system is made up of two different users having different roles
`staffs` (this can also be an admin) and `students`.

The system can have multiple admins having level of permissions to take certain actions.

Before allowing other `users` to get registered into the system, staff are sent a one time `code` which would be used when creating a new account. If the code expires, request would lead to failure making it more secure from allowing fake users signing up as a staff.

The admin would then be able to `grant` staff request or `reject` request.

#### Permissions
This are the list of permissions present in the system

- `Admin`
  - [x] Grant other staffs requests when registering.
  - [x] View all staffs within the system.
  - [x] He would be able to set course form reviews for individual registered staffs.
  - [x] Assign roles: he/she would be able to assign roles to individual users (`users -> admin`, `admin -> user`)
  - [x] View all registered students.

- `Staffs`
    - [x] Notifications
    - [x] He/she would be able to view submitted `documents` specifically to the staff permissions.
    - [x] he/she would be able to view all `rejected/approved/pending` form reviews.  

- `Students`
  - [x] Notifications
  - [x] Collaboration `video / audio`. students would be able to have realtime audio / video collaborations.
  - [x] This enable student to submit different documents.  
  - [x] He/she would be able to view submitted `documents` specifically to the staff permissions.
  - [x] he/she would be able to view all `rejected/approved/pending` form reviews.  


------

## Getting Started

### Tech Stacks.

This project is created using the below technologies:

- Frontend

  - [React](https://reactjs.org/) :- A single page application library meant for creating reusable UI components.
  - [Notyf](https://carlosroso.com/notyf/) :- A smooth toast notification library.
  - [React-Router](https://reactrouter.com/) :- A react dynamic routing library.
  
- Backend
  - [Node.js](https://nodejs.org/en/) :- A javascript runtime environment made for building realtime , data intensive applications.
  - [Express.js](https://expressjs.com/) :- is a back end web application framework for Node.js, released as free and open-source software under the MIT License. It is designed for building web applications and APIs
  - [SingleStoreDB x Mysql](https://singlestore.com) :- REAL-TIME. UNIFIED .DISTRIBUTED SQL.

### Running Frontend Locally.

Running this project locally it is required you have the above tools pre-installed on your pc, if not, follow the instructions below.

1. Clone the client repo on branch `client`
```
  C:/users/benrobo/desktop> git -b clone https://github.com/Benrobo/e-flow.git ./client
  
```

2. Install all Dependencies.
```
npm install
```

If everything installed sucessfully with no error, congratulation your're all setup for the client application to be view on the browser.
But holdon a bit, we cant just run this fullstack application without the need of a `backend`. Now let setup our backend

### Setting up the backend and database logic.

1. Download or clone the backend api logic using the instructions below

  ```sh
  git clone -b API https://github.com/benrobo/e-flow.git ./server
  ```

2. Now installed all the dependencies present in the project `package.json` file using

```
   benrobo@benrobo:~/Desktop/e-flow/server$ npm install
```

> The backend api relies on a real-time singlestore database. if you would like to test this on your personal singlestore instance, create an account on [singlestore](https://singlestore.com) and run the below `SQL` queries batch by batch. As you can see, the syntax looks quite different from your tradiational sql queries.

```sql
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
    file TEXT NOT NULL,
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

```

you should be presented with this screen after starting client.

<img src="https://raw.githubusercontent.com/Benrobo/e-workflow-client/main/readmeImg/login.PNG">

Now you're ready to navigate through the site.

🎊🎊🎊🎊🎊 Congratulation 🎊🎊🎊🎊🎊

### Registering as an Admin

to register has an overall admin of this application, visit the route below

[http://localhost:3000/admin/user/signup](http://localhost:3000/admin/user/signup)

