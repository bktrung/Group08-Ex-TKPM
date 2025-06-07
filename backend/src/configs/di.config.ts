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
	const { DepartmentRepository } = require("../repositories/department.repository");
	const { EnrollmentRepository } = require("../repositories/enrollment.repository");
	const { ClassService } = require("../services/class.service");
	const { CourseService } = require("../services/course.service");
	const { DepartmentService } = require("../services/department.service");
	const { ClassController } = require("../controllers/class.controller");
	const { CourseController } = require("../controllers/course.controller");
	const { DepartmentController } = require("../controllers/department.controller");

	// Bind repositories
	container.bind(TYPES.ClassRepository).to(ClassRepository);
	container.bind(TYPES.CourseRepository).to(CourseRepository);
	container.bind(TYPES.DepartmentRepository).to(DepartmentRepository);
	container.bind(TYPES.EnrollmentRepository).to(EnrollmentRepository);

	// Bind services
	container.bind(TYPES.ClassService).to(ClassService);
	container.bind(TYPES.CourseService).to(CourseService);
	container.bind(TYPES.DepartmentService).to(DepartmentService);

	// Bind controllers
	container.bind(TYPES.ClassController).to(ClassController);
	container.bind(TYPES.CourseController).to(CourseController);
	container.bind(TYPES.DepartmentController).to(DepartmentController);
};

export { container }; 