import app from './app';
import { config } from './config';
// Borra la importación del job de aquí

// Borra la llamada a initBookCounterJob(); de aquí

app.listen(config.server.port, () => {
  console.log(`Server running on http://localhost:${config.server.port}`);
});