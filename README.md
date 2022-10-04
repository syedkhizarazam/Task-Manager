# Task-Manager
 Assignment to create a task management system


Guide on how to run:

Step 1. Clone the repository

Step 2. Lets deal with the backend first, open the folder in your preferred IDE, make sure you're at ...\task-backend

Step 3. Run npm install in the terminal

Step 4. Once that is done, execute npm run, and then npm start. After this, you are done!

Step 5. Now frontend, open the folder in a seperate window in your preferred IDE (make sure the backend is still running), make sure you're at ...\task-frontend

Step 6. Run npm install in the terminal

Step 7. Once that is done, execute npm run, and then npm start. The app should now be live at http://localhost:3000/






Known bugs and issues: 

Bugs:
1. Sometimes when you have a situation where the task is as such: 

Task

├── subtask

│   ├── child of subtask

and you delete the Task, although this deletes the task and subtask, it doesnt erase "child of subtask" from the DB. "child of subtask" will no longer show up on the screen however, the name of this "child of subtask", will be taken up and cannot be reused now. 



Link to documentation: https://docs.google.com/document/d/1HU9sZ15p2n_qltfkZefgToJPW5AMSJyq8gBhzzseOvM/edit?usp=sharing





