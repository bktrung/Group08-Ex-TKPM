// Create symbols for dependency injection
export const TYPES = {
	// Repositories
	ClassRepository: Symbol.for("ClassRepository"),
	CourseRepository: Symbol.for("CourseRepository"),
	DepartmentRepository: Symbol.for("DepartmentRepository"),
	EnrollmentRepository: Symbol.for("EnrollmentRepository"),
	ProgramRepository: Symbol.for("ProgramRepository"),
	SemesterRepository: Symbol.for("SemesterRepository"),
	
	// Services
	ClassService: Symbol.for("ClassService"),
	CourseService: Symbol.for("CourseService"),
	DepartmentService: Symbol.for("DepartmentService"),
	ProgramService: Symbol.for("ProgramService"),
	SemesterService: Symbol.for("SemesterService"),
	AddressService: Symbol.for("AddressService"),
	
	// Controllers
	ClassController: Symbol.for("ClassController"),
	CourseController: Symbol.for("CourseController"),
	DepartmentController: Symbol.for("DepartmentController"),
	ProgramController: Symbol.for("ProgramController"),
	SemesterController: Symbol.for("SemesterController"),
	AddressController: Symbol.for("AddressController"),
}; 