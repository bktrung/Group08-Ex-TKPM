import { Router } from 'express';
import ClassController from '../../controllers/class.controller';
import { asyncHandler } from '../../helpers/asyncHandler';
import { addClassValidator } from '../../validators/class/add-class.validator';

const router = Router();

router.post('', addClassValidator, asyncHandler(ClassController.addClass));
router.get('', asyncHandler(ClassController.getClasses));

export default router;