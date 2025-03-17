import { Request, Response, NextFunction } from 'express';
import AddressService from '../services/address.service';
import { CREATED, OK } from '../responses/success.responses';

class AddressController {
	static async getCountries(req: Request, res: Response, next: NextFunction) {
		const countries = await AddressService.getCountries();
		return new OK({
			message: 'Countries retrieved successfully',
			metadata: { countries }
		}).send(res);
	}

	static async getChildren(req: Request, res: Response, next: NextFunction) {
		const geonameId = req.params.geonameId;
		const children = await AddressService.getChildren(geonameId);
		return new OK({
			message: 'Children retrieved successfully',
			metadata: { children }
		}).send(res);
	}
}

export default AddressController;