const express = require("express");
const sqlite_3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();

const JoinPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
let db = null;

const intializeDbWithServer = async() => {
    try{
        db = await open({
            filename: JoinPath,
            driver: sqlite_3.Database,
        });
        app.listen(3000, () => 
            console.log("server started running")
        );
    }
    catch(error){
        console.log(`db started giving error ${error.message}`);
        process.exit(1);
    }
};

intializeDbWithServer();

app.get("/todos/" async (request, response) => {
    const {search_q = "", priority = "", status = ""} = request.query;
    const queryTodo = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}' AND status = '${status}';`;
    const finalTodo = await db.all(queryTodo);
    response.send(finalTodo);
});

app.get("/todos/:todoId/", async (request, response) => {
    const{todoId} = request.params;
    const todoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
    const todoSelect = await db.get(todoQuery);
    response.send(todoSelect);
});

app.post("/todos/", async (request, response) => {
    const{id, todo, priority, status} = request.body;
    const createQuery = `INSERT INTO todo (id, todo, priority, status)
    VALUES(${id}, '${todo}', '${priority}', '${status}');`;
    await db.run(createQuery);
    response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async(request, response) => {
    const{todoId} = request.params;
    const getQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
    const prevQuery = await db.get(getQuery);
    const {todo = prevQuery.todo, priority = prevQuery.priority, status = prevQuery.status} = request.body;
    const updateTodo = `UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}' WHERE id = ${todoId};`;
    await db.run(updateTodo);
    response.send("Status Updated");
});
app.delete("/todos/:todoId/", async (request, response) => {
    const {todoId} = request.params;
    const delQuery = `DELETE FROM todo WHERE id = ${todoId};`;
    await db.run(delQuery);
    response.send("Todo Deleted");

});

module.exports = app;



