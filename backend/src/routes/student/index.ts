import { Router } from 'express';
import StudentController from "../../controllers/student.controller";
import { asyncHandler } from "../../helpers/asyncHandler";
import { addStudentValidator } from "../../validators/student/add-student.validator";
import { updateStudentValidator } from "../../validators/student/update-student.validator";
const router = Router();

router.post('', addStudentValidator, asyncHandler(StudentController.addStudent));
router.get('', asyncHandler(StudentController.getAllStudents));
router.patch('/:studentId', updateStudentValidator, asyncHandler(StudentController.updateStudent));
router.delete('/:studentId', asyncHandler(StudentController.deleteStudent));
router.get('/search', asyncHandler(StudentController.searchStudents));
router.get('/status-types', asyncHandler(StudentController.getStudentStatusType));
router.post('/status-types', asyncHandler(StudentController.addStudentStatusType));
router.put('/status-types/:statusId', asyncHandler(StudentController.modifyStudentStatusType));
router.get('/department/:departmentId', asyncHandler(StudentController.getStudentByDepartment));

export default router;