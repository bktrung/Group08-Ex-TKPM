// Create symbols for dependency injection
export const TYPES = {
	// Repositories
	ClassRepository: Symbol.for("ClassRepository"),
	CourseRepository: Symbol.for("CourseRepository"),
	DepartmentRepository: Symbol.for("DepartmentRepository"),
	EnrollmentRepository: Symbol.for("EnrollmentRepository"),
	
	// Services
	ClassService: Symbol.for("ClassService"),
	CourseService: Symbol.for("CourseService"),
	DepartmentService: Symbol.for("DepartmentService"),
	
	// Controllers
	ClassController: Symbol.for("ClassController"),
	CourseController: Symbol.for("CourseController"),
	DepartmentController: Symbol.for("DepartmentController"),
}; 