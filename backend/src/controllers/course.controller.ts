import { injectable, inject } from "inversify";
import { CREATED, OK } from '../responses/success.responses';
import { Request, Response, NextFunction } from 'express';
import { ICourseService } from '../interfaces/services/course.service.interface';
import { TYPES } from '../configs/di.types';

@injectable()
export class CourseController {
	constructor(
		@inject(TYPES.CourseService) private courseService: ICourseService
	) {}

	addCourse = async (req: Request, res: Response, next: NextFunction) => {
		const courseData = req.body;
		const newCourse = await this.courseService.addCourse(courseData);
		return new CREATED({
			message: 'Course added successfully',
			metadata: { newCourse },
		}).send(res);
	};

	updateCourse = async (req: Request, res: Response, next: NextFunction) => {
		const courseCode = req.params.courseCode;
		const courseData = req.body;
		const updatedCourse = await this.courseService.updateCourse(courseCode, courseData);
		return new OK({
			message: 'Course updated successfully',
			metadata: { updatedCourse },
		}).send(res);
	};

	deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
		const courseCode = req.params.courseCode;
		const deletedCourse = await this.courseService.deleteCourse(courseCode);
		return new OK({
			message: 'Course deleted successfully',
			metadata: { deletedCourse },
		}).send(res);
	};

	getCourses = async (req: Request, res: Response, next: NextFunction) => {
		const courses = await this.courseService.getCourses(req.query);
		return new OK({
			message: 'Courses retrieved successfully',
			metadata: { courses },
		}).send(res);
	}; 
}