import type { NextFunction, Request, Response } from "express";

import {
  propertyIdParamSchema,
  propertyQuerySchema,
  propertySchema,
  type PropertyIdParam,
  type PropertyInput,
  type PropertyQuery
} from "../shared/schema";
import {
  createPropertyRecord,
  deletePropertyRecord,
  getPropertyMetadataRecord,
  getPropertyRecord,
  listPropertyRecords,
  updatePropertyRecord
} from "../services/property.service";

export async function createProperty(req: Request, res: Response, next: NextFunction) {
  try {
    const property = propertySchema.parse(req.body) as PropertyInput;
    await createPropertyRecord(property);

    return res.status(201).json({
      message: "Property added successfully"
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPropertyMetadata(_req: Request, res: Response, next: NextFunction) {
  try {
    const metadata = await getPropertyMetadataRecord();

    return res.status(200).json({
      message: "Property metadata fetched successfully",
      metadata
    });
  } catch (error) {
    return next(error);
  }
}

export async function listProperties(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = propertyQuerySchema.parse(req.query) as PropertyQuery;
    const properties = await listPropertyRecords(userId);

    return res.status(200).json({
      message: "Properties fetched successfully",
      properties
    });
  } catch (error) {
    return next(error);
  }
}

export async function getProperty(req: Request, res: Response, next: NextFunction) {
  try {
    const { propertyId } = propertyIdParamSchema.parse(req.params) as PropertyIdParam;
    const property = await getPropertyRecord(propertyId);

    return res.status(200).json({
      message: "Property fetched successfully",
      property
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateProperty(req: Request, res: Response, next: NextFunction) {
  try {
    const { propertyId } = propertyIdParamSchema.parse(req.params) as PropertyIdParam;
    const property = propertySchema.parse(req.body) as PropertyInput;

    await updatePropertyRecord(propertyId, property);

    return res.status(200).json({
      message: "Property updated successfully"
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteProperty(req: Request, res: Response, next: NextFunction) {
  try {
    const { propertyId } = propertyIdParamSchema.parse(req.params) as PropertyIdParam;
    await deletePropertyRecord(propertyId);

    return res.status(200).json({
      message: "Property deleted successfully"
    });
  } catch (error) {
    return next(error);
  }
}
