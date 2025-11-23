import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { validateRequest, authMiddleware } from '../../middlewares'; // Asegúrate de importar authMiddleware
import { apiResponse, generateToken } from '../../core/utils';

const prisma = new PrismaClient();
const router = Router();

const LoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
});

const RegisterSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6)
  })
});

router.post('/register', validateRequest(RegisterSchema), async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });
    // @ts-ignore
    const { password: _, ...userWithoutPassword } = user;
    return apiResponse(res, userWithoutPassword, 'User registered', 201);
  } catch (error) {
    return apiResponse(res, null, 'Email already exists', 400);
  }
});

router.post('/login', validateRequest(LoginSchema), async (req, res) => {
  const { email, password } = req.body;
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return apiResponse(res, null, 'Invalid credentials', 401);
  }

  const token = generateToken({ id: user.id, email: user.email });
  
  return apiResponse(res, { token, user: { id: user.id, name: user.name } }, 'Login successful');
});

// --- NUEVO ENDPOINT: LOGOUT ---
router.post('/logout', authMiddleware, (req, res) => {
  // En una implementación JWT básica, el servidor no necesita hacer nada
  // porque no hay sesión de base de datos.
  // El cliente es el responsable de borrar el token.
  
  // (Opcional: Aquí podrías agregar el token a una "Blacklist" en Redis/DB para invalidarlo)
  
  return apiResponse(res, null, 'Logout successful.');
});

export const authRouter = router;