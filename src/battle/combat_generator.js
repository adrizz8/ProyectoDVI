import { HABILITIES } from './habilities.js';
import { ITEM_TYPES } from '../items/item_types.js';

/**
 * CombatGenerator
 * ---------------
 * Clase encargada de generar encuentros aleatorios con estadísticas balanceadas.
 */
export default class CombatGenerator {

    /**
     * Genera un grupo de enemigos aleatorios basados en el estado del jugador.
     * @param {GameManager} gm 
     * @returns {Object[]} Lista de estadísticas de enemigos.
     */
    static generateEncounter(gm) {
        const cantidad = this._getCantidadEnemigos();
        const level = this._getScalingLevel(gm);

        const enemies = [];
        for (let i = 0; i < cantidad; i++) {
            enemies.push(this._generateEnemy(level, cantidad));
        }
        return enemies;
    }

    /**
     * Calcula la cantidad de enemigos (1 a 4) con pesos probabilísticos.
     */
    static _getCantidadEnemigos() {
        const n = Math.random();
        if (n < 0.40) return 1;
        if (n < 0.70) return 2;
        if (n < 0.90) return 3;
        return 4;
    }

    /**
     * Obtiene el nivel del jugador principal (P1) para el escalado.
     */
    static _getScalingLevel(gm) {
        return gm.playerStats['Jugador1']?.level || 1;
    }

    /**
     * Genera un enemigo individual con estadísticas escaladas.
     */
    static _generateEnemy(levelPlayer, groupSize) {
        // Calcular nivel del enemigo basado en el del jugador (mínimo nivel 1)
        const levelEnemy = Math.max(1, Math.floor(3 + (levelPlayer - 3) * 1.5));

        // ── 4 Prototipos de Base (Arquetipos) ────────────────────────────────
        const prototypes = [
            { type: 'Random1', hp: 25, mp: 5, damage: 13, speed: 14, defense: 17, luck: 5 },
            { type: 'Random2', hp: 32, mp: 10, damage: 11, speed: 6, defense: 19, luck: 4 },
            { type: 'Random3', hp: 28, mp: 7, damage: 9, speed: 12, defense: 22, luck: 6 },
            { type: 'Random4', hp: 33, mp: 18, damage: 10, speed: 26, defense: 14, luck: 8 }
        ];

        const base = prototypes[Math.floor(Math.random() * prototypes.length)];
        const groupVariation = 1 + Math.log(groupSize) / Math.log(3);


        const maxHp = Math.max(1, base.hp + (levelEnemy - 1));
        const maxMp = Math.max(1, base.mp + (levelPlayer - 1));
        const damage = Math.max(1, (base.damage + (levelEnemy - 1)) / groupVariation);
        const speed = Math.max(1, base.speed + (levelEnemy - 1));
        const defense = Math.max(1, (base.defense + (levelEnemy - 1)) / groupVariation);

        const nombres = ['Sergio', 'Samuel', 'Carlos', 'Fernando', 'Santiago', 'Gaspar', 'Marcos', 'Daniel', 'Pedro', 'Pablo'];
        const nombreAzar = nombres[Math.floor(Math.random() * nombres.length)];

        const sprites = ['estudianteconplaca'];
        const spriteAzar = sprites[0];

        return {
            name: nombreAzar,
            spriteKey: spriteAzar,
            maxHp: maxHp,
            hp: maxHp,
            maxMp: maxMp,
            mp: maxMp,
            damage: damage,
            baseDamage: damage,
            speed: speed,
            baseSpeed: speed,
            defense: defense,
            baseDefense: defense,
            luck: base.luck,
            // Recompensas escaladas (Total combate entre 25 y 40)
            expReward: Math.floor(40 / groupSize),
            moneyReward: Math.floor((50 + Math.random() * 32) / groupSize),
            habilidades: this._getRandomSkills(2),
            objeto: this._getRandomItem(0.15) // 15% de probabilidad de soltar equipo
        };
    }

    /**
     * Selecciona habilidades aleatorias del catálogo.
     */
    static _getRandomSkills(num) {
        // Filtramos para que NO puedan coger habilidades de daño a todos (exclusivas del boss)
        const keys = Object.keys(HABILITIES).filter(key => HABILITIES[key].type !== 'all-damage');
        const shuffled = keys.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    }

    /**
     * Selecciona un objeto de equipo aleatorio.
     */
    static _getRandomItem(prob) {
        if (Math.random() > prob) return '';
        const equipments = Object.values(ITEM_TYPES).filter(i => i.type === 'equipment');
        if (equipments.length === 0) return '';
        const item = equipments[Math.floor(Math.random() * equipments.length)];
        return { ...item };
    }
}
