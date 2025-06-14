import { Router } from 'express';
import { asyncHandler } from "../../helpers/asyncHandler";
import { deleteDepartmentValidator } from "../../validators/department/delete-department.validator";
import { container } from '../../configs/di.config';
import { TYPES } from '../../configs/di.types';
import { DepartmentController } from '../../controllers/department.controller';

const router = Router();

// Lazy resolution of controller
const getDepartmentController = () => container.get<DepartmentController>(TYPES.DepartmentController);

router.get('', asyncHandler((req, res, next) => 
	getDepartmentController().getDepartments(req, res, next)
));
router.post('', asyncHandler((req, res, next) => 
	getDepartmentController().addDepartment(req, res, next)
));
router.patch('/:id', asyncHandler((req, res, next) => 
	getDepartmentController().updateDepartment(req, res, next)
));
router.delete('/:id', deleteDepartmentValidator, asyncHandler((req, res, next) => 
	getDepartmentController().deleteDepartment(req, res, next)
));

export default router;