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
	const { ProgramRepository } = require("../repositories/program.repository");
	const { SemesterRepository } = require("../repositories/semester.repository");
	const { ClassService } = require("../services/class.service");
	const { CourseService } = require("../services/course.service");
	const { DepartmentService } = require("../services/department.service");
	const { ProgramService } = require("../services/program.service");
	const { SemesterService } = require("../services/semester.service");
	const { AddressService } = require("../services/address.service");
	const { ClassController } = require("../controllers/class.controller");
	const { CourseController } = require("../controllers/course.controller");
	const { DepartmentController } = require("../controllers/department.controller");
	const { ProgramController } = require("../controllers/program.controller");
	const { SemesterController } = require("../controllers/semester.controller");
	const { AddressController } = require("../controllers/address.controller");

	// Bind repositories
	container.bind(TYPES.ClassRepository).to(ClassRepository);
	container.bind(TYPES.CourseRepository).to(CourseRepository);
	container.bind(TYPES.DepartmentRepository).to(DepartmentRepository);
	container.bind(TYPES.EnrollmentRepository).to(EnrollmentRepository);
	container.bind(TYPES.ProgramRepository).to(ProgramRepository);
	container.bind(TYPES.SemesterRepository).to(SemesterRepository);

	// Bind services
	container.bind(TYPES.ClassService).to(ClassService);
	container.bind(TYPES.CourseService).to(CourseService);
	container.bind(TYPES.DepartmentService).to(DepartmentService);
	container.bind(TYPES.ProgramService).to(ProgramService);
	container.bind(TYPES.SemesterService).to(SemesterService);
	container.bind(TYPES.AddressService).to(AddressService);

	// Bind controllers
	container.bind(TYPES.ClassController).to(ClassController);
	container.bind(TYPES.CourseController).to(CourseController);
	container.bind(TYPES.DepartmentController).to(DepartmentController);
	container.bind(TYPES.ProgramController).to(ProgramController);
	container.bind(TYPES.SemesterController).to(SemesterController);
	container.bind(TYPES.AddressController).to(AddressController);
};

export { container }; 