import { Response } from 'express';
import jwt from 'jsonwebtoken';
import * as xlsx from 'xlsx';
import { config } from '../config';

// Helper Mejorado: Solo envía 'data' si no es null ni undefined
export const apiResponse = (res: Response, data: any, message = 'Success', status = 200) => {
  const responseBody: any = {
    status,
    message
  };

  // Condición mágica: Solo agregamos la propiedad si tiene valor
  if (data !== null && data !== undefined) {
    responseBody.data = data;
  }

  return res.status(status).json(responseBody);
};

// Generador de Token JWT
export const generateToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: '24h' });
};

// Generador de Archivos Excel en Buffer
export const generateExcelBuffer = (data: any[], sheetName: string): Buffer => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};