import { Router } from 'express';
import DepartmentController from '../../controllers/department.controller';
import { asyncHandler } from "../../helpers/asyncHandler";
const router = Router();

router.get('', asyncHandler(DepartmentController.getDepartments));
router.post('', asyncHandler(DepartmentController.addDepartment));
router.patch('/:id', asyncHandler(DepartmentController.updateDepartment));

export default router;