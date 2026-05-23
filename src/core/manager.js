/**
 * GameManager
 * -----------
 * Singleton que guarda todos los datos persistentes del juego:
 *   - Stats base del jugador (se van mejorando a lo largo de la partida)
 *   - Mochila / inventario
 *   - Cualquier otro flag global que necesiten varias escenas
 *
 * USO:
 *   import GameManager from './manager.js';
 *   const gm = GameManager.getInstance();
 *   gm.playerStats.hp = 80;
 */
import { ITEM_TYPES } from '../items/item_types.js';

export default class GameManager {

    /** @type {GameManager} */
    static _instance = null;

    static getInstance() {
        if (!GameManager._instance) {
            GameManager._instance = new GameManager();
        }
        return GameManager._instance;
    }

    static reset() {
        GameManager._instance = null;
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
                hp: 22,
                maxHp: 22,
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
                damage: 15,
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
                hp: 27,
                maxHp: 27,
                mp: 14,
                maxMp: 14,
                damage: 13,
                speed: 25,
                defense: 12,
                luck: 15,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: ['Asentir sin entender', 'Ir a la Academia'],
                objeto: ''
            },
            'Jugador4': {
                displayName: 'Victor',
                hp: 20,
                maxHp: 20,
                mp: 12,
                maxMp: 12,
                damage: 16,
                speed: 20,
                defense: 16,
                luck: 8,
                level: 1,
                exp: 0,
                expNext: 100,
                habilidades: ['Ir a la Academia', 'Entrega Última Hora'],
                objeto: ''
            },
        };

        this.ActualPlayers = [];
        this.ActualPlayers.push('Jugador1');

        // ── Mochila / Inventario ──────────────────────────────────────────────
        // Cada objeto: { id: string, name: string, quantity: number, type: 'consumable', heal?: number, recMp?: number, buffAtt?: number, buffDef?: number, buffSpd?: number }
        this.backpack = [
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
                hp: 4, mp: 2, damage: 2, speed: 2, defense: 2, luck: 0,
                skills: { 2: 'Prácticas Wuolah' }
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

        this.puzzleButtonStates = {};
        this.persistentFlags = new Set();

    }

    // ── Flags persistentes ─────────────────────────────────────────────────────

    markFlag(flagName) {
        this.persistentFlags.add(flagName);
    }

    hasFlag(flagName) {
        return this.persistentFlags.has(flagName);
    }

    clearFlag(flagName) {
        this.persistentFlags.delete(flagName);
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

    /**
     * Formatea una cantidad de dinero (entero) a un string con formato "0,00€"
     * @param {number} amount 
     * @returns {string}
     */
    formatDinero(amount) {
        // Dividimos por 100 para tratar los enteros como céntimos
        return (amount / 100).toFixed(2).replace('.', ',') + '€';
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

    /** Cura a todo el equipo (HP y MP al máximo) */
    healAllTeam() {
        this.ActualPlayers.forEach(playerName => {
            const p = this.playerStats[playerName];
            if (p) {
                p.hp = p.maxHp;
                p.mp = p.maxMp;
            }
        });
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

    /**
     * Cambia el nombre de Jugador1 por el nombre personalizado del usuario.
     * @param {string} newName - El nuevo nombre del jugador
     */
    setPlayerName(newName) {
        if (!newName || newName.trim() === '') {
            return; // Si no hay nombre, mantener Jugador1
        }

        // Si el nombre ya existe en playerStats, no cambiar
        if (newName !== 'Jugador1' && this.playerStats[newName]) {
            return;
        }

        // Transferir los datos de Jugador1 al nuevo nombre
        if (this.playerStats['Jugador1']) {
            this.playerStats[newName] = this.playerStats['Jugador1'];
            delete this.playerStats['Jugador1'];
        }

        // Actualizar displayName para que muestre el nombre ingresado
        if (this.playerStats[newName]) {
            this.playerStats[newName].displayName = newName;
        }

        // Actualizar la progresión
        if (this.progression['Jugador1']) {
            this.progression[newName] = this.progression['Jugador1'];
            delete this.progression['Jugador1'];
        }

        // Actualizar ActualPlayers
        const index = this.ActualPlayers.indexOf('Jugador1');
        if (index !== -1) {
            this.ActualPlayers[index] = newName;
        }
    }

    // ── Persistence for Puzzles ──────────────────────────────────────────────

    setButtonState(sceneKey, buttonName, state) {
        if (!this.puzzleButtonStates[sceneKey]) {
            this.puzzleButtonStates[sceneKey] = {};
        }
        this.puzzleButtonStates[sceneKey][buttonName] = state;
    }

    getButtonState(sceneKey, buttonName) {
        if (this.puzzleButtonStates[sceneKey] && this.puzzleButtonStates[sceneKey].hasOwnProperty(buttonName)) {
            return this.puzzleButtonStates[sceneKey][buttonName];
        }
        return false; // Default state
    }
}
