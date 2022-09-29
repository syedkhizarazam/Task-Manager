const express = require("express");
const db = require("../Connection");
const Router = express.Router();

//CREATE ONE
Router.post("/insert", (req, res) => {
  db.query("INSERT INTO tasks SET ?", [req.body], (err, rows, fields) => {
    !err
      ? res.send(`Task ${req.body.ID} inserted successfully!`)
      : console.log(err);
  });
});

//READ LIST
Router.post("/readList", (req, res) => {
  db.query("SELECT * FROM tasks", (err, rows, fields) => {
    !err ? res.send(rows) : console.log(err);
  });
});

//UPDATE ONE
Router.post("/update", (req, res) => {
  db.query(
    "UPDATE tasks SET Name = ?, Status = ?, ParentID = ? WHERE ID = ?",
    [req.body.Name, req.body.Status, req.body.ParentID, req.body.ID],
    (err, rows, fields) => {
      !err
        ? res.send(`Task ${req.body.ID} updated successfully!`)
        : console.log(err);
    }
  );
});

//UPDATE LIST
Router.post("/updateList", (req, res) => {
  req.body.map((el) => {
    db.query(
      "UPDATE tasks SET Name = ?, Status = ?, ParentID = ? WHERE ID = ?",
      [el.Name, el.Status, el.ParentID, el.ID],
      (err, rows, fields) => {
        err && console.log(err);
      }
    );
  });
  res.send(`Tasks updated successfully!`);
});

//DELETE ONE
Router.post("/delete", (req, res) => {
  db.query(
    "DELETE FROM tasks WHERE ID IN (?)",
    [req.body],
    (err, rows, fields) => {
      !err ? res.send(`Task deleted successfully!`) : console.log(err);
    }
  );
});

module.exports = Router;
