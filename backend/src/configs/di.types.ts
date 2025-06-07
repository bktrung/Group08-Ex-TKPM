// Create symbols for dependency injection
export const TYPES = {
	// Repositories
	ClassRepository: Symbol.for("ClassRepository"),
	CourseRepository: Symbol.for("CourseRepository"),
	DepartmentRepository: Symbol.for("DepartmentRepository"),
	EnrollmentRepository: Symbol.for("EnrollmentRepository"),
	GradeRepository: Symbol.for("GradeRepository"),
	ProgramRepository: Symbol.for("ProgramRepository"),
	SemesterRepository: Symbol.for("SemesterRepository"),
	StudentRepository: Symbol.for("StudentRepository"),
	
	// Services
	ClassService: Symbol.for("ClassService"),
	CourseService: Symbol.for("CourseService"),
	DepartmentService: Symbol.for("DepartmentService"),
	EnrollmentService: Symbol.for("EnrollmentService"),
	GradeService: Symbol.for("GradeService"),
	ProgramService: Symbol.for("ProgramService"),
	SemesterService: Symbol.for("SemesterService"),
	StudentService: Symbol.for("StudentService"),
	TranscriptService: Symbol.for("TranscriptService"),
	AddressService: Symbol.for("AddressService"),
	
	// Controllers
	ClassController: Symbol.for("ClassController"),
	CourseController: Symbol.for("CourseController"),
	DepartmentController: Symbol.for("DepartmentController"),
	EnrollmentController: Symbol.for("EnrollmentController"),
	GradeController: Symbol.for("GradeController"),
	ProgramController: Symbol.for("ProgramController"),
	SemesterController: Symbol.for("SemesterController"),
	StudentController: Symbol.for("StudentController"),
	TranscriptController: Symbol.for("TranscriptController"),
	AddressController: Symbol.for("AddressController"),
}; 