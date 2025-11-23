import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API Integration Tests', () => {
  let token = '';

  beforeAll(async () => {
    // --- 2. INICIALIZAR EL JOB AQUÍ ---
    // Esto es vital porque Jest no corre server.ts

    // Limpiar DB
    await prisma.book.deleteMany();
    await prisma.author.deleteMany();
    await prisma.user.deleteMany();

    // Crear usuario para test
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123'
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@test.com',
      password: 'password123'
    });
    token = res.body.data.token;
  });

  it('should create an author via authenticated route', async () => {
    const res = await request(app)
      .post('/api/authors')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Gabriel Garcia Marquez', email: 'gabo@macondo.com' });

    expect(res.status).toBe(201);
  });

  it('should fail creating author without token', async () => {
    const res = await request(app)
      .post('/api/authors')
      .send({ name: 'Ghost Writer' });
    
    expect(res.status).toBe(401);
  });

  it('should create a book and trigger the Job to update author count', async () => {
    // 1. Crear Autor
    const authorRes = await request(app)
      .post('/api/authors')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'JK Rowling' });
    
    const authorId = authorRes.body.data.id;

    // 2. Crear Libro
    await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Harry Potter', authorId });

    // 3. Esperar al Job (Damos un poco más de tiempo por seguridad: 1s)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Verificar
    const updatedAuthor = await prisma.author.findUnique({ where: { id: authorId } });
    
    // Debug: Si falla, esto nos dirá cuánto tiene realmente
    if (updatedAuthor?.bookCount !== 1) {
       console.log("DEBUG TEST:", updatedAuthor);
    }

    expect(updatedAuthor?.bookCount).toBe(1);
  });
});