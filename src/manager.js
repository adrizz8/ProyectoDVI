/**
 * GameManager
 * -----------
 * Singleton que guarda todos los datos persistentes del juego:
 *   - Stats base del jugador (se van mejorando a lo largo de la partida)
 *   - Mochila / inventario
 *   - Cualquier otro flag global que necesiten varias escenas
 *
 * USO:
 *   import GameManager from '../manager.js';
 *   const gm = GameManager.getInstance();
 *   gm.playerStats.hp = 80;
 */
import { ITEM_TYPES } from './item/item_types.js';

export default class GameManager {

    /** @type {GameManager} */
    static _instance = null;

    static getInstance() {
        if (!GameManager._instance) {
            GameManager._instance = new GameManager();
        }
        return GameManager._instance;
    }

    constructor() {
        if (GameManager._instance) {
            throw new Error('Usa GameManager.getInstance()');
        }

        // ── Stats base del jugador ────────────────────────────────────────────
        // Estos son los valores "reales" que persisten entre batallas.
        // Al entrar en combate se copian a PlayerBattle.
        this.playerStats = {
            'Jugador1': {
                displayName: 'J1',
                hp: 20,
                maxHp: 20,
                mp: 10,
                maxMp: 10,
                damage: 10,
                speed: 10,
                defense: 10,
                luck: 10,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: [
                    'Pregunta a ChatGPT'
                ],
                objeto: ''
            },
            'Jugador2': {

                displayName: 'Fernando',
                hp: 30,
                maxHp: 30,
                mp: 10,
                maxMp: 10,
                damage: 17,
                speed: 6,
                defense: 17,
                luck: 8,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: ['Sentarse Atrás'],
                objeto: ''
            },
            'Jugador3': {
                displayName: 'Angela',
                hp: 25,
                maxHp: 25,
                mp: 25,
                maxMp: 25,
                damage: 20,
                speed: 25,
                defense: 8,
                luck: 15,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: ['Asentir sin entender', 'Correo Vacío', 'Código Fácil'],
                objeto: ''
            },
            'Jugador4': {
                displayName: 'Victor',
                hp: 15,
                maxHp: 15,
                mp: 15,
                maxMp: 15,
                damage: 25,
                speed: 20,
                defense: 10,
                luck: 8,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: ['Preguntar duda', 'Funciona en mi PC'],
                objeto: ''
            },
        };

        this.ActualPlayers = [];
        this.ActualPlayers.push('Jugador1');

        // ── Mochila / Inventario ──────────────────────────────────────────────
        // Cada objeto: { id: string, name: string, quantity: number, type: 'consumable', heal?: number, recMp?: number, buffAtt?: number, buffDef?: number, buffSpd?: number }
        this.backpack = [
            { id: 'pincho_tortilla', name: 'Pincho de Tortilla', quantity: 5, type: 'consumable', heal: 50, description: 'Recupera 50 HP (Energía vital de la cafetería).' },
            { id: 'monster', name: 'Monster', quantity: 3, type: 'consumable', recMp: 20, description: 'Restaura 20 MP (Concentración extrema).' },
            { id: 'menu_dia', name: 'Menú del Día', quantity: 1, type: 'consumable', heal: 100, recMp: 50, description: 'Restaura 100 HP y 50 MP (El banquete del estudiante).' },
            { id: 'tinto_verano', name: 'Tinto de Verano', quantity: 2, type: 'consumable', buffAtt: 15, description: 'Aumenta el ataque en 15 (Efecto euforia).' },
            { id: 'palmera_chocolate', name: 'Palmera de Chocolate', quantity: 2, type: 'consumable', buffDef: 10, description: 'Aumenta la defensa en 10 (Capa de grasa protectora).' },
            { id: 'cafe', name: 'Café', quantity: 2, type: 'consumable', buffSpd: 10, description: 'Aumenta la velocidad en 10 (Cafeína directa).' },
            { id: 'amuleto_delegacion', name: 'Amuleto de Delegación', quantity: 2, type: 'consumable', buffLck: 5, description: 'Aumenta la suerte en 5 (El carisma del delegado).' },
            { id: 'cigarro', name: 'Cigarro', quantity: 2, type: 'consumable', statusRecovery: true, description: 'Elimina estado anómalo (Reduce el estrés).' },
            { id: 'convalidacion_directa', name: 'Convalidación Directa', quantity: 1, type: 'consumable', levelUp: true, description: 'Suma un nivel al personaje (Saltarse una asignatura).' },
            { id: 'teclado_mecanico', name: 'Teclado Mecánico', quantity: 1, type: 'equipment', description: 'Arma periférica +5 daño (Switches Blue para más ruido).' },
            { id: 'sudadera_facu', name: 'Sudadera de la Facu', quantity: 1, type: 'equipment', description: 'Prenda reglamentaria que ofrece +5 defensa.' },
            { id: 'llave_lab', name: 'Llave del Lab 1.4', quantity: 1, type: 'key', description: 'Abre la puerta del laboratorio de sistemas.' }
        ];

        // ── Posición del jugador ──────────────────────────────────────────────
        // Se guarda al salir de una escena o entrar en combate para recuperarla al volver.
        this.playerPosition = null;


        this.niveles = new Map();

        this.defeatedNPCs = new Set();

        this.justdefeated = null;
        this.dinero = 0;

        this.TextNum = 25;

        this.TextMode = 'Medio';

        this.TextIndex = 1;

        // ── Datos de Progresión ───────────────────────────────────────────────
        // Define el crecimiento por nivel y las habilidades que se aprenden.
        this.progression = {
            'Jugador1': {
                hp: 3, mp: 2, damage: 2, speed: 2, defense: 2, luck: 0,
                skills: { 2: 'Prácticas Wuolah', 4: 'Entrega Última Hora', 7: 'Correo Vacio' }
            },
            'Jugador2': {
                hp: 2, mp: 1, damage: 1, speed: 1, defense: 1, luck: 0,
                skills: { 2: 'Preguntar Duda' }
            },
            'Jugador3': {
                hp: 1, mp: 1, damage: 1, speed: 1, defense: 1, luck: 0,
                skills: {}
            },
            'Jugador4': {
                hp: 1, mp: 1, damage: 1, speed: 1, defense: 1, luck: 0,
                skills: {}
            }
        };

    }

    // ── Helpers de posición ───────────────────────────────────────────────────

    /**
     * Guarda la posición y dirección actual del jugador.
     * @param {number} x
     * @param {number} y
     * @param {string} direction 'up', 'down', 'left', 'right'
     */
    setPlayerPosition(x, y, direction = 'down') {
        this.playerPosition = { x, y, direction };
    }

    /**
     * Recupera la última posición y dirección guardada del jugador.
     * @returns {{x: number, y: number, direction: string} | null}
     */
    getPlayerPosition() {
        return this.playerPosition;
    }

    /**
     * Limpia la posición guardada (usar tras recuperarla).
     */
    clearPlayerPosition() {
        this.playerPosition = null;
    }

    // ── Helpers de Dinero ─────────────────────────────────────────────────────

    getDinero() {
        return this.dinero;
    }

    addDinero(amount) {
        this.dinero += amount;
    }

    gastarDinero(amount) {
        if (this.dinero >= amount) {
            this.dinero -= amount;
            return true;
        }
        return false;
    }

    // ── Helpers de mochila ────────────────────────────────────────────────────

    /**
     * Añade una cantidad de un objeto al inventario.
     * @param {{ id: string, name: string, type: string }} itemDef
     * @param {number} quantity
     */
    addItem(itemDef, quantity = 1) {
        const existing = this.backpack.find(i => i.id === itemDef.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.backpack.push({ ...itemDef, quantity });
        }
    }

    /**
     * Añade una habilidad a la lista del jugador si no la tiene.
     * @param {string} playerName 
     * @param {string} skillName 
     */
    addSkill(playerName, skillName) {
        const p = this.playerStats[playerName];
        if (p && !p.habilidades.includes(skillName)) {
            p.habilidades.push(skillName);
            return true;
        }
        return false;
    }

    /**
     * Usa/consume un objeto del inventario.
     * @param {string} itemId
     * @returns {boolean} true si se pudo usar
     */
    useItem(itemId) {
        const item = this.backpack.find(i => i.id === itemId);
        if (!item || item.quantity <= 0) return false;
        if (item.type !== 'consumable') return false;
        item.quantity--;
        if (item.quantity === 0) {
            this.backpack = this.backpack.filter(i => i.id !== itemId);
        }
        return true;
    }

    getItemsByType(type) {
        return this.backpack.filter(i => i.type === type);
    }

    getNumItems() {
        return this.backpack.length;
    }

    canUseItemOutsideBattle(item) {
        if (!item || item.type !== 'consumable') return false;
        return Boolean(item.heal || item.recMp || item.statusRecovery);
    }

    canUseItemInBattle(item) {
        if (!item || item.type !== 'consumable') return false;
        return Boolean(item.heal || item.recMp || item.statusRecovery || item.buffAtt || item.buffDef || item.buffSpd || item.buffLck || item.levelUp);
    }

    // ── Helpers de stats ──────────────────────────────────────────────────────

    /** Aplica el daño recibido en combate al HP real del jugador */
    applyDamageToPlayer(playerName, damage) {
        const p = this.playerStats[playerName];
        if (p) {
            p.hp = Math.max(0, p.hp - damage);
        }
    }

    /** Cura al jugador (no supera maxHp) */
    healPlayer(playerName, amount) {
        const p = this.playerStats[playerName];
        if (p) {
            p.hp = Math.min(p.maxHp, p.hp + amount);
        }
    }

    healMP(playerName, amount) {
        const p = this.playerStats[playerName];
        if (p) {
            p.mp = Math.min(p.maxMp, p.mp + amount);
        }
    }

    /** Sube la experiencia de un jugador */
    gainExp(playerName, amount) {
        const p = this.playerStats[playerName];
        if (!p) return false;

        p.exp += amount;
        let leveledLogs = [];

        while (p.exp >= p.expNext) {
            const log = this.levelUp(playerName);
            leveledLogs.push(log);
        }

        return leveledLogs.length > 0 ? leveledLogs : false;
    }

    /** Sube de nivel: aumenta las stats base según su tabla de progresión */
    levelUp(playerName) {
        const p = this.playerStats[playerName];
        const grow = this.progression[playerName];
        if (!p || !grow) return null;

        p.level++;
        p.exp -= p.expNext;

        // Mejora de stats según progresión
        p.maxHp += grow.hp;
        p.hp = p.maxHp;
        p.maxMp += grow.mp;
        p.mp = p.maxMp;
        p.damage += grow.damage;
        p.speed += grow.speed;
        p.defense += grow.defense;
        p.luck += grow.luck;

        let learnedSkill = null;
        if (grow.skills && grow.skills[p.level]) {
            const skillName = grow.skills[p.level];
            if (!p.habilidades.includes(skillName)) {
                p.habilidades.push(skillName);
                learnedSkill = skillName;
            }
        }

        console.log(`¡${playerName} ha subido al nivel ${p.level}!`);
        return { level: p.level, learnedSkill };
    }

    /** Obtiene el array de stats para iniciar combates (convirtiendo el dict a lista si es necesario) */
    getPlayersForBattle(namesArray) {
        return namesArray.map(name => {
            const stats = { ...this.playerStats[name] };
            // Si el objeto es un string (ID), lo resolvemos al objeto real
            if (typeof stats.objeto === 'string' && ITEM_TYPES[stats.objeto]) {
                stats.objeto = ITEM_TYPES[stats.objeto];
            }
            return {
                name: name,
                ...stats
            };
        });
    }


    addNivel(nombre) {
        if (!this.niveles.has(nombre)) {
            this.niveles.set(nombre, false);
        }
    }
    CompleteNivel(nombre) {
        this.niveles.set(nombre, true);
    }

    estadoNivel(nombre) {
        return this.niveles.get(nombre);
    }

    markDefeated(npcId) {
        this.defeatedNPCs.add(npcId);
    }

    isDefeated(npcId) {
        return this.defeatedNPCs.has(npcId);
    }

    setJustDefeated(npcId) {
        this.justdefeated = npcId;
    }

    isJustDefeated(npcId) {
        return this.justdefeated == npcId;
    }
    AddCompañero(name) {

        if (!this.ActualPlayers.includes(name)) {
            this.ActualPlayers.push(name);
        }

    }
}
