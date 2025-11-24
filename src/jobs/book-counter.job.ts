import { PrismaClient } from '@prisma/client';
import { eventBus, EVENTS } from '../core/event-bus';

const prisma = new PrismaClient();

export const initBookCounterJob = () => {
  console.log('[JOBS] Inicializando Job de Conteo de Libros...');

  eventBus.on(EVENTS.BOOK_CREATED, async (authorId: number) => {
    try {
      console.log(`[JOB] Actualizando contador de libros para el Autor ID: ${authorId}...`);
      
      const count = await prisma.book.count({ 
        where: { authorId } 
      });

      await prisma.author.update({
        where: { id: authorId },
        data: { bookCount: count }
      });

      console.log(`[JOB] Éxito. Autor ${authorId} tiene ahora ${count} libros.`);
    } catch (error) {
      console.error(`[JOB ERROR] Fallo al actualizar autor ${authorId}:`, error);
    }
  });
};