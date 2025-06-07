import { Router } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { addClassValidator } from '../../validators/class/add-class.validator';
import { container } from '../../configs/di.config';
import { TYPES } from '../../configs/di.types';
import { ClassController } from '../../controllers/class.controller';

const router = Router();

// Lazy resolution of controller
const getClassController = () => container.get<ClassController>(TYPES.ClassController);

router.post('', addClassValidator, asyncHandler((req, res, next) => 
	getClassController().addClass(req, res, next)
));
router.get('', asyncHandler((req, res, next) => 
	getClassController().getClasses(req, res, next)
));

export default router;