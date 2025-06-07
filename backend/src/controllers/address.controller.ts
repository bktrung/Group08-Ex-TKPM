import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from 'express';
import { IAddressService } from '../interfaces/services/address.service.interface';
import { CREATED, OK } from '../responses/success.responses';
import { TYPES } from '../configs/di.types';

@injectable()
export class AddressController {
	constructor(
		@inject(TYPES.AddressService) private addressService: IAddressService
	) {}

	getCountries = async (req: Request, res: Response, next: NextFunction) => {
		const countries = await this.addressService.getCountries();
		return new OK({
			message: 'Countries retrieved successfully',
			metadata: { countries }
		}).send(res);
	}

	getChildren = async (req: Request, res: Response, next: NextFunction) => {
		const geonameId = req.params.geonameId;
		const children = await this.addressService.getChildren(geonameId);
		return new OK({
			message: 'Children retrieved successfully',
			metadata: { children }
		}).send(res);
	}

	getNationalities = async (req: Request, res: Response, next: NextFunction) => {
		const nationalities = await this.addressService.getNationalities();
		return new OK({
			message: 'Nationalities retrieved successfully',
			metadata: { nationalities }
		}).send(res);
	}
}