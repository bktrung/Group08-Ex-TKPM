import { Request, Response, NextFunction } from 'express';
import AddressService from '../services/address.service';
import { CREATED, OK } from '../responses/success.responses';

class AddressController {
	getCountries = async (req: Request, res: Response, next: NextFunction) => {
		const countries = await AddressService.getCountries();
		return new OK({
			message: 'Countries retrieved successfully',
			metadata: { countries }
		}).send(res);
	}

	getChildren = async (req: Request, res: Response, next: NextFunction) => {
		const geonameId = req.params.geonameId;
		const children = await AddressService.getChildren(geonameId);
		return new OK({
			message: 'Children retrieved successfully',
			metadata: { children }
		}).send(res);
	}

	getNationalities = async (req: Request, res: Response, next: NextFunction) => {
		const nationalities = await AddressService.getNationalities();
		return new OK({
			message: 'Nationalities retrieved successfully',
			metadata: { nationalities }
		}).send(res);
	}
}

export default new AddressController();