const express = require("express");
const helmet = require("helmet");

const projectRouter = require("./data/helpers/projectRouter");
const actionRouter = require("./data/helpers/actionRouter");

const server = express();

server.get("/", (req, res) => {
	res.send(`<h2>Building RESTful APIs with Express</h2>`);
});

//custom middleware

function logger(req, res, next) {
	console.log(`${req.method} to ${req.path}`);
	next();
}

server.use(logger);
server.use(helmet());
server.use(express.json());

server.use("/api/projects", projectRouter);
server.use("/api/actions", actionRouter);

server.use(errorHandler);

function errorHandler(error, req, res, next) {
	console.log(error);
	res.status(500).json({ error: "Data could not be retrieved" });
}

module.exports = server;
