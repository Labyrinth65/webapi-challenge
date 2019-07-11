const express = require("express");

const actionsDB = require("./actionModel.js");
const mappers = require("./mappers.js");

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const posts = await actionsDB.get(req.query);
		res.status(200).json(posts);
	} catch (error) {
		// log error to database
		console.log(error);
		res.status(500).json({
			error: "The posts could not be retrieved."
		});
	}
});

router.get("/:id", validatePostId, async (req, res) => {
	try {
		res.status(200).json(req.post);
	} catch (error) {
		// log error to database
		console.log(error);
		res.status(500).json({
			error: "The post could not be retrieved."
		});
	}
});

router.delete("/:id", validatePostId, async (req, res) => {
	try {
		const count = await actionsDB.remove(req.params.id);
		if (count > 0) {
			res.status(200).json(req.post);
		}
	} catch (error) {
		// log error to database
		console.log(error);
		res.status(500).json({
			error: "The post could not be removed"
		});
	}
});

router.put("/:id", validatePostId, validatePost, async (req, res) => {
	try {
		const post = await actionsDB.update(req.params.id, req.body);
		res.status(200).json(post);
	} catch (error) {
		// log error to database
		console.log(error);
		res.status(500).json({
			error: "The post could not be modified."
		});
	}
});

// custom middleware

async function validatePostId(req, res, next) {
	try {
		const post = await actionsDB.getById(req.params.id);
		if (post) {
			req.post = post;
			next();
		} else {
			res.status(400).json({ message: "invalid post id" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "The post information could not be retrieved."
		});
	}
}

function validatePost(req, res, next) {
	if (Object.keys(req.body).length === 0) {
		res.status(400).json({ message: "missing post data" });
	} else if (!req.body.text) {
		res.status(400).json({ message: "missing required text field" });
	} else {
		next();
	}
}

module.exports = router;
