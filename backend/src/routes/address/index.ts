import { Router } from 'express';
import AddressController from '../../controllers/address.controller';
import { asyncHandler } from "../../helpers/asyncHandler";
const router = Router();

router.get('/countries', asyncHandler(AddressController.getCountries));
router.get('/children/:geonameId', asyncHandler(AddressController.getChildren));
router.get('/nationalities', asyncHandler(AddressController.getNationalities));

export default router;