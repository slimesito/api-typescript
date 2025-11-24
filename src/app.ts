import express from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.module';
import { authorRouter } from './modules/authors/authors.module';
import { bookRouter } from './modules/books/books.module';
import { initBookCounterJob } from './jobs/book-counter.job';

const app = express();

app.use(cors());
app.use(express.json());

// 2. SE INICIALIZA EL JOB
initBookCounterJob();

app.use('/api/auth', authRouter);
app.use('/api/authors', authorRouter);
app.use('/api/books', bookRouter);

app.get('/', (req, res) => {
  res.json({ status: 'API Online 🚀' });
});

export default app;