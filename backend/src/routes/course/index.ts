import courseController from "../../controllers/course.controller";
import { Router } from "express";
import { asyncHandler } from "../../helpers/asyncHandler";
import { addCourseValidator } from "../../validators/course/add-course.validator"
import { updateCourseValidator } from "../../validators/course/update-course.validator";

const router = Router();

router.get('', asyncHandler(courseController.getCourses));
router.post('', addCourseValidator, asyncHandler(courseController.addCourse));
router.patch('/:courseCode', updateCourseValidator, asyncHandler(courseController.updateCourse));
router.delete('/:courseCode', asyncHandler(courseController.deleteCourse));

export default router;