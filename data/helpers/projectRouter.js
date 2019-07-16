const express = require("express");

const projectsDB = require("./projectModel.js");
const actionsDB = require("./actionModel.js");

const router = express.Router();

router.post("/", checkProject, async (req, res) => {
	try {
		const project = await projectsDB.insert({
			...req.body,
			...(req.body.completed ? req.body.completed : { completed: false })
		});
		const newProject = await projectsDB.get(project.id);
		res.status(201).json(newProject);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "There was an error while adding the project to the database"
		});
	}
});

router.post("/:id/actions", checkProjectId, checkAction, async (req, res) => {
	try {
		const action = await actionsDB.insert({
			...req.body,
			project_id: req.params.id,
			...(req.body.completed ? req.body.completed : { completed: false })
		});
		res.status(201).json(action);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "There was an error while adding the action to the database"
		});
	}
});

router.get("/", async (req, res) => {
	try {
		const projects = await projectsDB.getAll(req.query);
		res.status(200).json(projects);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "The projects could not be retrieved."
		});
	}
});

router.get("/:id", checkProjectId, async (req, res) => {
	try {
		res.status(200).json(req.project);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "The project information could not be retrieved."
		});
	}
});

router.get("/:id/actions", checkProjectId, async (req, res) => {
	try {
		const actions = await projectsDB.getProjectActions(req.params.id);
		if (actions.length === 0) {
			res.status(200).json({
				message: "The project has no actions."
			});
		} else {
			res.status(200).json(actions);
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "The project actions information could not be retrieved."
		});
	}
});

router.delete("/:id", checkProjectId, async (req, res) => {
	try {
		const count = await projectsDB.remove(req.params.id);
		if (count > 0) {
			res.status(200).json(req.project);
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "The project could not be removed"
		});
	}
});

router.put("/:id", checkProjectId, checkProject, async (req, res) => {
	try {
		const project = await projectsDB.update(req.params.id, req.body);
		res.status(200).json(project);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "The project information could not be modified."
		});
	}
});

//custom middleware

async function checkProjectId(req, res, next) {
	try {
		const project = await projectsDB.get(req.params.id);
		if (project) {
			req.project = project;
			next();
		} else {
			res.status(400).json({ message: "invalid project id" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "The project information could not be retrieved."
		});
	}
}

function checkProject(req, res, next) {
	if (Object.keys(req.body).length === 0)
		return res.status(400).json({ message: "missing project data" });
	const { name, description } = req.body;
	if (!name || !description)
		return res
			.status(400)
			.json({ message: "missing required name or description field" });
	next();
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
