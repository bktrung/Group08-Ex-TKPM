import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./di.types";

// Create and configure the container
const container = new Container();

// Function to configure bindings - will be called after all modules are loaded
export const configureDI = () => {
	// Import implementations here to avoid circular dependencies
	const { ClassRepository } = require("../repositories/class.repository");
	const { CourseRepository } = require("../repositories/course.repository");
	const { ClassService } = require("../services/class.service");
	const { ClassController } = require("../controllers/class.controller");

	// Bind repositories
	container.bind(TYPES.ClassRepository).to(ClassRepository);
	container.bind(TYPES.CourseRepository).to(CourseRepository);

	// Bind services
	container.bind(TYPES.ClassService).to(ClassService);

	// Bind controllers
	container.bind(TYPES.ClassController).to(ClassController);
};

export { container }; 