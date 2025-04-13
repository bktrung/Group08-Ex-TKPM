import { CREATED, OK } from '../responses/success.responses';
import { Request, Response, NextFunction } from 'express';
import CourseService from '../services/course.service';

class CourseController {
	addCourse = async (req: Request, res: Response, next: NextFunction) => {
		const courseData = req.body;
		const newCourse = await CourseService.addCourse(courseData);
		return new CREATED({
			message: 'Course added successfully',
			metadata: { newCourse },
		}).send(res);
	};

	updateCourse = async (req: Request, res: Response, next: NextFunction) => {
		const courseCode = req.params.courseCode;
		const courseData = req.body;
		const updatedCourse = await CourseService.updateCourse(courseCode, courseData);
		return new OK({
			message: 'Course updated successfully',
			metadata: { updatedCourse },
		}).send(res);
	};

	deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
		const courseCode = req.params.courseCode;
		const deletedCourse = await CourseService.deleteCourse(courseCode);
		return new OK({
			message: 'Course deleted successfully',
			metadata: { deletedCourse },
		}).send(res);
	};

	getCourses = async (req: Request, res: Response, next: NextFunction) => {
		const courses = await CourseService.getCourses(req.query);
		return new OK({
			message: 'Courses retrieved successfully',
			metadata: { courses },
		}).send(res);
	}; 
}

export default new CourseController();