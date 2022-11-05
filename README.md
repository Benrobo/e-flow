### E-workflow System `Still in Development Phase`

This is an electronic workflow system system built for SingleStore Hackathon. a system meant for automating the workflow when submitting either `school form`, `final year report` , `course form` or any other school documents.

[View Backend Code](https://github.com/Benrobo/e-flow)

![npm bundle size](https://img.shields.io/bundlephobia/min/react)
-------


<img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/002/278/081/datas/original.png" />

<img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/002/278/074/datas/original.png" />

<img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/002/278/078/datas/original.png" />

<img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/002/278/083/datas/original.png" />

<img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/002/278/077/datas/original.png" />

<img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/002/279/830/datas/original.png" />

<img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/002/279/831/datas/original.png" />

----

### Note

This system is still in `DEVELOPMENT` phase.


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

1. Download or Clone The Project.

Download the project from github either by using `curls` or `ssh`

  `CURL`
  
  CLIENT APP

  `GIT SSH`

```
  C:/users/benrobo/desktop> git clone -b client https://github.com/Benrobo/e-flow.git
  
```
  This would download this project in `desktop` directory having the name `e-workflow-server` and `e-workflow-client` if that where youre executing this command from.


1. Open the folder where it was downloaded on the terminal, in my case it would be

```
   // windows

   C:/user/Desktop/e-flow>

   // linux
   benrobo@benrobo:~/Desktop/e-flow$
```

3. Install all Dependencies.
   Before making use of the command stated below make sure you have the latest version of nodejs installed, if not here is a video on how to download and setup nodejs on your pc.

- windows
  - [https://www.youtube.com/watch?v=GjfYHwlFI-c](https://www.youtube.com/watch?v=GjfYHwlFI-c)
- Mac
  - [https://www.youtube.com/watch?v=0i-gstqgjuE](https://www.youtube.com/watch?v=0i-gstqgjuE)
- Linux
  - [https://www.youtube.com/watch?v=OMhMnj7SBRQ](https://www.youtube.com/watch?v=OMhMnj7SBRQ)

After doing that, make sure to check if it installed correctly on your pc. To verify, simply use the below command

```
 node --version
 //and
 npm --version
```

The above command would print each version of the node.js and npm package if installed correctly.

Now let install all dependencies in our client application which was downloaded previously using the command below.

```
   C:/user/Desktop/e-flow> npm install
```

If everything installed sucessfully with no error, congratulation your're all setup for the client application to be view on the browser.
But holdon a bit, we cant just run this fullstack application without the need of a `backend`. Now let setup our backend


### Run the backend api server and client

After applying all necessary instructions correctly, it time to put all this to the test using the below command.

Navigate to where the `e-flow-client` and `e-flow-server` was downloaded and run the command below

```js

    ... Running the client app

    // e-workflow client
    C:/users/benrobo/Desktop/e-workflow-client> npm start

    // this should spin up the local react server in your browser. with the url of http://localhost:3000

    ... Running the backend api server
        // e-workflow client
    C:/users/benrobo/Desktop/e-workflow-server> npm start

    // this should spin up the local nodejs server in your terminal.

```

you should be presented with this screen

<img src="https://raw.githubusercontent.com/Benrobo/e-workflow-client/main/readmeImg/login.PNG">

Now you're ready to navigate through the site.

🎊🎊🎊🎊🎊 Congratulation 🎊🎊🎊🎊🎊
