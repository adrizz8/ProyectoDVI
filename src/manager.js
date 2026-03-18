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
                hp: 100,
                maxHp: 100,
                mp: 50,
                maxMp: 50,
                damage: 25,
                speed: 15,     // para decidir quién ataca primero
                defense: 10,
                luck: 25,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: ['Ataque UP', 'Golpe Triple', 'Cura', 'Defensa UP', 'Velocidad UP', 'Ataque Potente', 'Fuego', 'Ataque NERF', 'Golpe Debilitador', 'Golpe Vigorizante']
            },
            'Jugador2': {
                hp: 100,
                maxHp: 100,
                mp: 50,
                maxMp: 50,
                damage: 25,
                speed: 12,     // para decidir quién ataca primero
                defense: 10,
                luck: 1,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: ['Defensa UP', 'Cura']
            },
            'Jugador3': {
                hp: 100,
                maxHp: 100,
                mp: 50,
                maxMp: 50,
                damage: 25,
                speed: 10,     // para decidir quién ataca primero
                defense: 10,
                luck: 1,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: ['Velocidad UP', 'Ataque Potente']
            },
            'Jugador4': {
                hp: 100,
                maxHp: 100,
                mp: 50,
                maxMp: 50,
                damage: 25,
                speed: 6,     // para decidir quién ataca primero
                defense: 10,
                luck: 1,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: ['Fuego']
            },
        };

        // ── Mochila / Inventario ──────────────────────────────────────────────
        // Cada objeto: { id: string, name: string, quantity: number, type: 'consumable', heal?: number, recMp?: number, buffAtt?: number, buffDef?: number, buffSpd?: number }
        this.backpack = [
            { id: 'pocion', name: 'Poción', quantity: 5, type: 'consumable', heal: 50, description: 'Cura 50 HP.' },
            { id: 'eter', name: 'Éter', quantity: 3, type: 'consumable', recMp: 20, description: 'Restaura 20 MP.' },
            { id: 'elixir', name: 'Elixir', quantity: 1, type: 'consumable', heal: 100, recMp: 50, description: 'Restaura 100 HP y 50 MP.' },
            { id: 'pocion_fuerza', name: 'Poción de Fuerza', quantity: 2, type: 'consumable', buffAtt: 15, description: 'Aumenta el ataque en 15.' },
            { id: 'pocion_defensa', name: 'Poción de Defensa', quantity: 2, type: 'consumable', buffDef: 10, description: 'Aumenta la defensa en 10.' },
            { id: 'pocion_rapidez', name: 'Poción de Rapidez', quantity: 2, type: 'consumable', buffSpd: 10, description: 'Aumenta la velocidad en 10.' },
            { id: 'pocion_suerte', name: 'Poción de Suerte', quantity: 2, type: 'consumable', buffLck: 5, description: 'Aumenta la suerte en 5.' }
        ];

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
        item.quantity--;
        if (item.quantity === 0) {
            this.backpack = this.backpack.filter(i => i.id !== itemId);
        }
        return true;
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

        // Mejora de stats (ejemplo simple)
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
}