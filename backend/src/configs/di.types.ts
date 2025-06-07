// Create symbols for dependency injection
export const TYPES = {
	// Repositories
	ClassRepository: Symbol.for("ClassRepository"),
	CourseRepository: Symbol.for("CourseRepository"),
	
	// Services
	ClassService: Symbol.for("ClassService"),
	
	// Controllers
	ClassController: Symbol.for("ClassController"),
}; 