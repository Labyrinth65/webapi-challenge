const express = require("express");

const actionsDB = require("./actionModel.js");

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const actions = await actionsDB.getAll(req.query);
		res.status(200).json(actions);
	} catch (error) {
		// log error to database
		console.log(error);
		res.status(500).json({
			error: "The actions could not be retrieved."
		});
	}
});

router.get("/:id", checkActionId, async (req, res) => {
	try {
		res.status(200).json(req.action);
	} catch (error) {
		// log error to database
		console.log(error);
		res.status(500).json({
			error: "The action could not be retrieved."
		});
	}
});

router.delete("/:id", checkActionId, async (req, res) => {
	try {
		const count = await actionsDB.remove(req.params.id);
		if (count > 0) {
			res.status(200).json(req.action);
		}
	} catch (error) {
		// log error to database
		console.log(error);
		res.status(500).json({
			error: "The action could not be removed"
		});
	}
});

router.put("/:id", checkActionId, checkAction, async (req, res) => {
	try {
		const action = await actionsDB.update(req.params.id, req.body);
		res.status(200).json(action);
	} catch (error) {
		// log error to database
		console.log(error);
		res.status(500).json({
			error: "The action could not be modified."
		});
	}
});

// custom middleware

async function checkActionId(req, res, next) {
	try {
		const exist = await actionsDB.getAll(req.query);
		await exist.map(el => el.id).includes(parseInt(req.params.id));
		console.log(exist);
		console.log(await exist.map(el => el.id).includes(parseInt(req.params.id)));
		if (exist === false) {
			res.status(400).json({ message: "invalid action id" });
		} else {
			const action = await actionsDB.get(req.params.id);
			req.action = action;
			next();
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "The action information could not be retrieved."
		});
	}
}

function checkAction(req, res, next) {
	if (Object.keys(req.body).length === 0)
		return res.status(400).json({ message: "missing action data" });
	const { description, notes } = req.body;
	if (!description || !notes)
		return res
			.status(400)
			.json({ message: "missing required description or notes field" });
	next();
}

module.exports = router;
