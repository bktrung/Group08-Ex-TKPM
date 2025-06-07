import { Router } from 'express';
import { asyncHandler } from "../../helpers/asyncHandler";
import { container } from '../../configs/di.config';
import { TYPES } from '../../configs/di.types';
import { TranscriptController } from '../../controllers/transcript.controller';

const router = Router();

// Lazy resolution of controller
const getTranscriptController = () => container.get<TranscriptController>(TYPES.TranscriptController);

router.get('/:studentId', asyncHandler((req, res, next) => 
	getTranscriptController().generateTranscript(req, res, next)
));

export default router;