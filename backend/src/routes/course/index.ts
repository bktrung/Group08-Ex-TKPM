import { Router } from "express";
import { asyncHandler } from "../../helpers/asyncHandler";
import { addCourseValidator } from "../../validators/course/add-course.validator"
import { updateCourseValidator } from "../../validators/course/update-course.validator";
import { container } from '../../configs/di.config';
import { TYPES } from '../../configs/di.types';
import { CourseController } from '../../controllers/course.controller';

const router = Router();

// Lazy resolution of controller
const getCourseController = () => container.get<CourseController>(TYPES.CourseController);

router.get('', asyncHandler((req, res, next) => 
	getCourseController().getCourses(req, res, next)
));
router.post('', addCourseValidator, asyncHandler((req, res, next) => 
	getCourseController().addCourse(req, res, next)
));
router.patch('/:courseCode', updateCourseValidator, asyncHandler((req, res, next) => 
	getCourseController().updateCourse(req, res, next)
));
router.delete('/:courseCode', asyncHandler((req, res, next) => 
	getCourseController().deleteCourse(req, res, next)
));

export default router;