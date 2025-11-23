import EventEmitter from 'events';

class EventBus extends EventEmitter {}
export const eventBus = new EventBus();

// Definición de nombres de eventos para evitar errores de tipeo
export const EVENTS = {
  BOOK_CREATED: 'BOOK_CREATED'
};