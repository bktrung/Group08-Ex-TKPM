import { Router } from 'express';
import { asyncHandler } from "../../helpers/asyncHandler";
import { container } from '../../configs/di.config';
import { TYPES } from '../../configs/di.types';
import { AddressController } from '../../controllers/address.controller';

const router = Router();

// Lazy resolution of controller
const getAddressController = () => container.get<AddressController>(TYPES.AddressController);

router.get('/countries', asyncHandler((req, res, next) => 
	getAddressController().getCountries(req, res, next)
));
router.get('/children/:geonameId', asyncHandler((req, res, next) => 
	getAddressController().getChildren(req, res, next)
));
router.get('/nationalities', asyncHandler((req, res, next) => 
	getAddressController().getNationalities(req, res, next)
));

export default router;