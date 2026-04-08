/**
 * EventManager
 * ------------
 * Singleton que gestiona el estado global de eventos del juego mediante variables booleanas.
 * Todas las variables están definidas desde el inicio para un acceso directo.
 * 
 * USO:
 *   import EventManager from './eventManager.js';
 *   const em = EventManager.getInstance();
 *   
 *   // Acceso directo:
 *   em.puzleIzquierdaCompletado = true;
 *   if (em.puzleIzquierdaCompletado) { ... }
 */
export default class EventManager {

    /** @type {EventManager} */
    static _instance = null;

    /**
     * Obtiene la instancia única del EventManager.
     */
    static getInstance() {
        if (!EventManager._instance) {
            EventManager._instance = new EventManager();
        }
        return EventManager._instance;
    }

    constructor() {
        if (EventManager._instance) {
            throw new Error('Usa EventManager.getInstance()');
        }

        // --- ESTADOS DE EVENTOS (Variables true/false habituales) ---
        // Puzles y Mazmorras
        this.puzleIzquierdaCompletado = false;
        this.puzleDerechaCompletado = false;
    }
}
