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
                hp: 160,
                maxHp: 160,
                mp: 60,
                maxMp: 60,
                damage: 28,
                speed: 16,
                defense: 35,
                luck: 10,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: ['Ataque UP', 'Golpe Triple', 'Cura', 'Defensa UP', 'Velocidad UP', 'Ataque Potente', 'Fuego', 'Ataque NERF', 'Golpe Debilitador', 'Golpe Vigorizante'],
                objeto: 'espada_basica'
            },
            'Jugador2': {

                displayName: 'Fernando',
                hp: 160,
                maxHp: 160,
                mp: 40,
                maxMp: 40,
                damage: 38,
                speed: 6,
                defense: 14,
                luck: 2,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: ['Ataque Potente', 'Defensa UP'],
                objeto: ''
            },
            'Jugador3': {
                displayName: 'Angela',
                hp: 100,
                maxHp: 100,
                mp: 30,
                maxMp: 30,
                damage: 15,
                speed: 12,
                defense: 25,
                luck: 4,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: ['Cura', 'Ataque NERF', 'Defensa UP'],
                objeto: ''
            },
            'Jugador4': {
                displayName: 'Victor',
                hp: 100,
                maxHp: 100,
                mp: 70,
                maxMp: 70,
                damage: 30,
                speed: 26,
                defense: 10,
                luck: 8,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: ['Golpe Triple', 'Velocidad UP', 'Fuego'],
                objeto: ''
            },
        };

        this.ActualPlayers = [];
        this.ActualPlayers.push('Jugador1');

        // ── Mochila / Inventario ──────────────────────────────────────────────
        // Cada objeto: { id: string, name: string, quantity: number, type: 'consumable', heal?: number, recMp?: number, buffAtt?: number, buffDef?: number, buffSpd?: number }
        this.backpack = [
            { id: 'pocion', name: 'Poción', quantity: 5, type: 'consumable', heal: 50, description: 'Cura 50 HP.' },
            { id: 'eter', name: 'Éter', quantity: 3, type: 'consumable', recMp: 20, description: 'Restaura 20 MP.' },
            { id: 'elixir', name: 'Elixir', quantity: 1, type: 'consumable', heal: 100, recMp: 50, description: 'Restaura 100 HP y 50 MP.' },
            { id: 'pocion_fuerza', name: 'Poción de Fuerza', quantity: 2, type: 'consumable', buffAtt: 15, description: 'Aumenta el ataque en 15 (solo batalla).' },
            { id: 'pocion_defensa', name: 'Poción de Defensa', quantity: 2, type: 'consumable', buffDef: 10, description: 'Aumenta la defensa en 10 (solo batalla).' },
            { id: 'pocion_rapidez', name: 'Poción de Rapidez', quantity: 2, type: 'consumable', buffSpd: 10, description: 'Aumenta la velocidad en 10 (solo batalla).' },
            { id: 'pocion_suerte', name: 'Poción de Suerte', quantity: 2, type: 'consumable', buffLck: 5, description: 'Aumenta la suerte en 5 (solo batalla).' },
            { id: 'pocion_resistencia', name: 'Poción Restauradora', quantity: 2, type: 'consumable', statusRecovery: true, description: 'Elimina estado anómalo.' },
            { id: 'pocion_nivel', name: 'Poción de Nivel', quantity: 1, type: 'consumable', levelUp: true, description: 'Suma un nivel al personaje.' },
            { id: 'espada_basica', name: 'Espada de Bronce', quantity: 1, type: 'equipment', description: 'Arma cuerpo a cuerpo +5 daño.' },
            { id: 'armadura_lejana', name: 'Coraza ligera', quantity: 1, type: 'equipment', description: 'Armadura que ofrece +5 defensa.' },
            { id: 'llave_caverna', name: 'Llave de la Caverna', quantity: 1, type: 'key', description: 'Abre la puerta de la caverna del Norte.' }
        ];

        // ── Posición del jugador ──────────────────────────────────────────────
        // Se guarda al salir de una escena o entrar en combate para recuperarla al volver.
        this.playerPosition = null;


        this.niveles = new Map();

        this.defeatedNPCs = new Set();

        this.justdefeated = null;
        this.dinero = 0;

        this.TextNum=25;

        this.TextMode='Medio';

        this.TextIndex=1;

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

    /** Sube la experiencia de un jugador */
    gainExp(playerName, amount) {
        const p = this.playerStats[playerName];
        if (!p) return false;

        p.exp += amount;
        let leveledUp = false;

        while (p.exp >= p.expNext) {
            this.levelUp(playerName);
            leveledUp = true;
        }

        return leveledUp;
    }

    /** Sube de nivel: aumenta las stats base */
    levelUp(playerName) {
        const p = this.playerStats[playerName];
        if (!p) return;

        p.level++;
        p.exp -= p.expNext;
        p.expNext = Math.floor(p.expNext * 1.5);

        // Mejora de stats (ejemplo)
        p.maxHp += 20;
        p.hp = p.maxHp;
        p.maxMp += 10;
        p.mp = p.maxMp;
        p.damage += 5;
        p.speed += 2;

        console.log(`¡${playerName} ha subido al nivel ${p.level}!`);
    }

    /** Obtiene el array de stats para iniciar combates (convirtiendo el dict a lista si es necesario) */
    getPlayersForBattle(namesArray) {
        return namesArray.map(name => {
            return {
                name: name,
                ...this.playerStats[name]
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
