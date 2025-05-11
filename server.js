const http = require("node:http");
const fs = require("node:fs");
const url = require("url");

const db = require("./db.json");

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/users") {
    fs.readFile("db.json", (err, data) => {
      if (err) throw err;
      const dataList = JSON.parse(data)?.users;
      res.writeHead(200, { "content-type": "application/json" });
      res.write(JSON.stringify(dataList));
      res.end();
    });
  } else if (req.method === "GET" && req.url === "/api/books") {
    fs.readFile("db.json", (err, data) => {
      if (err) throw err;
      const dataList = JSON.parse(data)?.books;
      res.writeHead(200, { "content-type": "application/json" });
      res.write("<html><head></head><body><h1>test</h1></body></html>");
      res.end();
    });
  } else if (req.method === "DELETE" && req.url.startsWith("/api/books")) {
    const parsedUrl = url.parse(req.url, true);
    const id = parsedUrl?.query?.id;
    const newBooks = db.books.filter((book) => +id !== +book.id);

    if (newBooks.length === db.books.length) {
      res.writeHead(401, { "content-type": "application/json" });
      res.write(JSON.stringify({ message: "book not found" }));
      res.end();
    } else {
      fs.writeFile(
        "db.json",
        JSON.stringify({ ...db, books: newBooks }),
        (err) => {
          if (err) {
            throw err;
          }
          res.writeHead(200, { "content-type": "application/json" });
          res.write(
            JSON.stringify({
              message: "book removed successfully",
              data: newBooks,
            })
          );
          res.end();
        }
      );
    }
  } else if (req.method === "POST" && req.url === "/api/books") {
    let book = "";

    req.on("data", (data) => {
      book += data.toString();
    });

    req.on("end", () => {
      const newBook = {
        ...JSON.parse(book),
        id: Math.round(Math.random() * 1000),
        free: 1,
      };
      db.books.push(newBook);
      book = "";

      fs.writeFile("db.json", JSON.stringify({ ...db }), (err) => {
        if (err) {
          throw err;
        }
        res.writeHead(200, { "content-type": "application/json" });
        res.write(
          JSON.stringify({
            message: "book added successfully",
            data: db.books,
          })
        );
        res.end();
      });
    });
  } else if (req.method === "PUT" && req.url.startsWith("/api/books")) {
    const bookId = req.url.split("/").slice(-1)[0];
    const bookIndex = db.books.findIndex((book) => +book.id === +bookId);

    let bookbody = "";

    req.on("data", (data) => {
      bookbody += data.toString();
    });

    req.on("end", (err) => {
      if (err) {
        throw err;
      }

      const parsedBook = JSON.parse(bookbody);

      if (bookIndex !== -1 && db.books[bookIndex]) {
        db.books[bookIndex] = {
          title: parsedBook?.title || null,
          author: parsedBook?.author || null,
          free: parsedBook?.free || null,
          price: parsedBook?.price || null,
          id: +bookId,
        };
        fs.writeFile("db.json", JSON.stringify(db), (err) => {
          if (err) {
            throw err;
          }
          res.writeHead(200, { "content-type": "application/json" });
          res.write(
            JSON.stringify({
              message: "book updated successfully",
              data: db.books,
            })
          );
          res.end();
        });
      } else {
        res.writeHead(200, { "content-type": "application/json" });
        res.write(
          JSON.stringify({
            message: "book not found",
          })
        );
        res.end();
      }
    });
  } else if (req.method === "POST" && req.url === "/api/users") {
    let newUser = "";

    req.on("data", (data) => {
      newUser += data.toString();
    });

    req.on("end", (err) => {
      if (err) {
        throw err;
      }
      const parsedNewUser = JSON.parse(newUser);
      db.users.push({
        name: parsedNewUser?.name || null,
        userName: parsedNewUser?.userName || null,
        email: parsedNewUser?.email || null,
        role: parsedNewUser?.role || null,
        id: Math.round(Math.random() * 1000),
        crime: 0,
      });

      fs.writeFile("db.json", JSON.stringify(db), (err) => {
        if (err) {
          throw err;
        }
        res.writeHead(201, { "content-type": "application/json" });
        res.write(JSON.stringify({ message: "user added successfully" }));
        res.end();
      });
    });
  } else if (req.method === "PUT" && req.url.startsWith("/api/users")) {
    const userId = req.url.split("/").slice(-1)[0];

    const userIndex = db.users.findIndex((user) => +user.id === +userId);

    let updateUserData = "";
    req.on("data", (data) => {
      updateUserData += data.toString();
    });

    req.on("end", (err) => {
      if (err) {
        throw err;
      }
      if (userIndex !== -1) {
        const parsedUserData = JSON.parse(updateUserData);
        db.users[userIndex] = {
          crime: parsedUserData?.crime || db.users[userIndex].crime,
          email: parsedUserData?.email || db.users[userIndex].email,
          name: parsedUserData?.name || db.users[userIndex].name,
          role: parsedUserData?.role || db.users[userIndex].role,
          userName: parsedUserData?.userName || db.users[userIndex].userName,
          id: +userId,
        };

        fs.writeFile("db.json", JSON.stringify(db), (err) => {
          if (err) {
            throw err;
          }

          res.writeHead(200, { "content-type": "application/json" });
          res.write(
            JSON.stringify({
              message: "user updated successfully",
              data: db.users,
            })
          );
          res.end();
        });
      } else {
        res.writeHead(200, { "content-type": "application/json" });
        res.write(JSON.stringify({ message: "user not found!" }));
        res.end();
      }
    });
  }
});

server.listen(4000, () => {
  console.log("server running on port 4000");
});
