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
	const { GradeRepository } = require("../repositories/grade.repository");
	const { ProgramRepository } = require("../repositories/program.repository");
	const { SemesterRepository } = require("../repositories/semester.repository");
	const { StudentRepository } = require("../repositories/student.repository");
	const { ClassService } = require("../services/class.service");
	const { CourseService } = require("../services/course.service");
	const { DepartmentService } = require("../services/department.service");
	const { EnrollmentService } = require("../services/enrollment.service");
	const { GradeService } = require("../services/grade.service");
	const { ProgramService } = require("../services/program.service");
	const { SemesterService } = require("../services/semester.service");
	const { StudentService } = require("../services/student.service");
	const { TranscriptService } = require("../services/transcript.service");
	const { AddressService } = require("../services/address.service");
	const { ClassController } = require("../controllers/class.controller");
	const { CourseController } = require("../controllers/course.controller");
	const { DepartmentController } = require("../controllers/department.controller");
	const { EnrollmentController } = require("../controllers/enrollment.controller");
	const { GradeController } = require("../controllers/grade.controller");
	const { ProgramController } = require("../controllers/program.controller");
	const { SemesterController } = require("../controllers/semester.controller");
	const { StudentController } = require("../controllers/student.controller");
	const { TranscriptController } = require("../controllers/transcript.controller");
	const { AddressController } = require("../controllers/address.controller");

	// Bind repositories
	container.bind(TYPES.ClassRepository).to(ClassRepository);
	container.bind(TYPES.CourseRepository).to(CourseRepository);
	container.bind(TYPES.DepartmentRepository).to(DepartmentRepository);
	container.bind(TYPES.EnrollmentRepository).to(EnrollmentRepository);
	container.bind(TYPES.GradeRepository).to(GradeRepository);
	container.bind(TYPES.ProgramRepository).to(ProgramRepository);
	container.bind(TYPES.SemesterRepository).to(SemesterRepository);
	container.bind(TYPES.StudentRepository).to(StudentRepository);

	// Bind services
	container.bind(TYPES.ClassService).to(ClassService);
	container.bind(TYPES.CourseService).to(CourseService);
	container.bind(TYPES.DepartmentService).to(DepartmentService);
	container.bind(TYPES.EnrollmentService).to(EnrollmentService);
	container.bind(TYPES.GradeService).to(GradeService);
	container.bind(TYPES.ProgramService).to(ProgramService);
	container.bind(TYPES.SemesterService).to(SemesterService);
	container.bind(TYPES.StudentService).to(StudentService);
	container.bind(TYPES.TranscriptService).to(TranscriptService);
	container.bind(TYPES.AddressService).to(AddressService);

	// Bind controllers
	container.bind(TYPES.ClassController).to(ClassController);
	container.bind(TYPES.CourseController).to(CourseController);
	container.bind(TYPES.DepartmentController).to(DepartmentController);
	container.bind(TYPES.EnrollmentController).to(EnrollmentController);
	container.bind(TYPES.GradeController).to(GradeController);
	container.bind(TYPES.ProgramController).to(ProgramController);
	container.bind(TYPES.SemesterController).to(SemesterController);
	container.bind(TYPES.StudentController).to(StudentController);
	container.bind(TYPES.TranscriptController).to(TranscriptController);
	container.bind(TYPES.AddressController).to(AddressController);
};

export { container }; 