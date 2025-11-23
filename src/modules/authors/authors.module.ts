import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest, authMiddleware } from '../../middlewares';
import { apiResponse, generateExcelBuffer } from '../../core/utils';

const prisma = new PrismaClient();
const router = Router();

// --- FormRequests (Zod Schemas) ---
const CreateAuthorSchema = z.object({
  body: z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email().optional(),
  })
});

// --- Resources (Data Transformation) ---
const AuthorResource = (author: any) => ({
  id: author.id,
  fullName: author.name,
  contact: author.email,
  totalBooks: author.bookCount,
  joined: author.createdAt.toISOString()
});

// --- Services & Controller Logic ---

// GET: Listar autores
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const authors = await prisma.author.findMany({ orderBy: { createdAt: 'desc' } });
  return apiResponse(res, authors.map(AuthorResource));
});

// POST: Crear autor
router.post('/', authMiddleware, validateRequest(CreateAuthorSchema), async (req: Request, res: Response) => {
  try {
    const author = await prisma.author.create({ data: req.body });
    return apiResponse(res, AuthorResource(author), 'Author created', 201);
  } catch (e) {
    return apiResponse(res, null, 'Error creating author. Email might be taken.', 400);
  }
});

// GET: Exportar Excel
router.get('/export/excel', authMiddleware, async (req: Request, res: Response) => {
  const authors = await prisma.author.findMany({ include: { books: true } });
  
  // Aplanar datos para excel
  const data = authors.map(a => ({
    ID: a.id,
    Name: a.name,
    Email: a.email || 'N/A',
    Books_Count: a.bookCount,
    Last_Updated: a.updatedAt
  }));

  const buffer = generateExcelBuffer(data, 'Authors');
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=authors.xlsx');
  res.send(buffer);
});

export const authorRouter = router;