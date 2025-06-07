import { Router } from 'express';
import { asyncHandler } from "../../helpers/asyncHandler";
import { addStudentValidator } from "../../validators/student/add-student.validator";
import { updateStudentValidator } from "../../validators/student/update-student.validator";
import { container } from '../../configs/di.config';
import { TYPES } from '../../configs/di.types';
import { StudentController } from '../../controllers/student.controller';

const router = Router();

// Lazy resolution of controller
const getStudentController = () => container.get<StudentController>(TYPES.StudentController);

router.post('', addStudentValidator, asyncHandler((req, res, next) => 
	getStudentController().addStudent(req, res, next)
));
router.get('', asyncHandler((req, res, next) => 
	getStudentController().getAllStudents(req, res, next)
));
router.post('/status-transitions', asyncHandler((req, res, next) => 
	getStudentController().addStudentStatusTransition(req, res, next)
));
router.get('/status-transitions', asyncHandler((req, res, next) => 
	getStudentController().getStudentStatusTransition(req, res, next)
));
router.delete('/status-transitions', asyncHandler((req, res, next) => 
	getStudentController().deleteStudentStatusTransition(req, res, next)
));
router.patch('/:studentId', updateStudentValidator, asyncHandler((req, res, next) => 
	getStudentController().updateStudent(req, res, next)
));
router.delete('/:studentId', asyncHandler((req, res, next) => 
	getStudentController().deleteStudent(req, res, next)
));
router.get('/search', asyncHandler((req, res, next) => 
	getStudentController().searchStudents(req, res, next)
));
router.get('/status-types', asyncHandler((req, res, next) => 
	getStudentController().getStudentStatusType(req, res, next)
));
router.post('/status-types', asyncHandler((req, res, next) => 
	getStudentController().addStudentStatusType(req, res, next)
));
router.put('/status-types/:statusId', asyncHandler((req, res, next) => 
	getStudentController().modifyStudentStatusType(req, res, next)
));
router.get('/department/:departmentId', asyncHandler((req, res, next) => 
	getStudentController().getStudentByDepartment(req, res, next)
));

export default router;