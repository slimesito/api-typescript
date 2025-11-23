import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest, authMiddleware } from '../../middlewares';
import { apiResponse, generateExcelBuffer } from '../../core/utils';
import { eventBus, EVENTS } from '../../core/event-bus';

const prisma = new PrismaClient();
const router = Router();

// --- FormRequests ---
const CreateBookSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    authorId: z.number().int().positive()
  })
});

// --- Controller ---

// POST: Crear libro (Dispara el Job)
router.post('/', authMiddleware, validateRequest(CreateBookSchema), async (req: Request, res: Response) => {
  const { authorId, title, description } = req.body;

  // Validar existencia autor
  const authorExists = await prisma.author.findUnique({ where: { id: authorId } });
  if (!authorExists) return apiResponse(res, null, 'Author not found', 404);

  const book = await prisma.book.create({
    data: { title, description, authorId }
  });

  // DISPARAR EL EVENTO (JOB)
  eventBus.emit(EVENTS.BOOK_CREATED, authorId);

  return apiResponse(res, book, 'Book created and sync job started', 201);
});

// GET: Listar Libros
router.get('/', authMiddleware, async (req, res) => {
  const books = await prisma.book.findMany({ include: { author: true } });
  return apiResponse(res, books);
});

// GET: Exportar Libros Excel
router.get('/export/excel', authMiddleware, async (req, res) => {
  const books = await prisma.book.findMany({ include: { author: true } });
  const data = books.map(b => ({
    ID: b.id,
    Title: b.title,
    Author: b.author.name,
    Created: b.createdAt
  }));
  
  const buffer = generateExcelBuffer(data, 'Books');
  res.setHeader('Content-Disposition', 'attachment; filename=books.xlsx');
  res.send(buffer);
});

export const bookRouter = router;