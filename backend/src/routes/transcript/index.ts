import TranscriptController from '../../controllers/transcript.controller';
import { asyncHandler } from "../../helpers/asyncHandler";
import e, { Router } from 'express';
const router = Router();

router.get('/:studentId', asyncHandler(TranscriptController.generateTranscript));

export default router;