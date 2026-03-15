/**
 * Hability (Habilidad)
 * --------------------
 * Representa una habilidad especial que los personajes pueden usar en combate.
 * Cada habilidad consume MP y tiene un efecto específico sobre un objetivo.
 */
export default class Hability {
    /**
     * @param {string} id           Identificador único
     * @param {string} name         Nombre legible
     * @param {string} description  Descripción de lo que hace
     * @param {number} cost         Coste de MP
     * @param {string} type         'damage', 'heal', 'buff', etc.
     * @param {string} targetType   'selectable' o 'self'
     * @param {function} effectFn   Función que ejecuta el efecto: (source, target) => results
     */
    constructor({ id, name, description, cost, type, targetType, effectFn }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.cost = cost;
        this.type = type;
        this.targetType = targetType || 'selectable';
        this.effectFn = effectFn;
    }

    /**
     * Intenta ejecutar la habilidad.
     * @param {PlayerBattle|EnemyBattle} source  Quién usa la habilidad
     * @param {PlayerBattle|EnemyBattle} target  A quién va dirigida
     * @returns {Object} Resultado de la acción (damage, heal, message, etc.)
     */
    execute(source, target) {
        // Comprobar si hay suficiente MP
        if (source.mp < this.cost) {
            return {
                success: false,
                message: `${source.name} no tiene suficiente MP para usar ${this.name}.`,
                reason: 'NO_MP'
            };
        }

        // Consumir el coste
        source.mp -= this.cost;

        // Ejecutar el efecto
        const result = this.effectFn(source, target);

        // Si es una habilidad de daño, comprobamos si hay crítico
        if (this.type === 'damage' && result.damage) {
            const isCrit = Math.random() < (source.luck / 50);
            if (isCrit) {
                result.damage = Math.floor(result.damage * 1.5);
                result.isCrit = true;
            }
        }

        return {
            success: true,
            actionName: this.name,
            ...result
        };
    }
}

/**
 * Diccionario de habilidades disponibles en el juego.
 * Centralizar aquí las habilidades facilita la gestión y el balance.
 */
export const HABILITIES = {
    'Ataque Potente': new Hability({
        id: 'power_attack',
        name: 'Ataque Potente',
        description: 'Inflige un 150% del daño base del usuario.',
        cost: 10,
        type: 'damage',
        effectFn: (source, target) => {
            const damage = Math.floor(source.damage * 1.5);
            return {
                damage,
                message: `${source.name} usa un Ataque Potente sobre ${target.name}!`
            };
        }
    }),

    'Cura': new Hability({
        id: 'heal',
        name: 'Cura',
        description: 'Restaura 50 puntos de salud al aliado seleccionado.',
        cost: 15,
        type: 'heal',
        effectFn: (source, target) => {
            const healAmount = 50;
            // La lógica de curación la aplicaría el BattleManager o el propio target
            return {
                heal: healAmount,
                message: `${source.name} lanza Cura sobre ${target.name}!`
            };
        }
    }),

    'Fuego': new Hability({
        id: 'fireball',
        name: 'Fuego',
        description: 'Lanza una bola de fuego que ignora parte de la defensa.',
        cost: 20,
        type: 'damage',
        effectFn: (source, target) => {
            const damage = Math.floor(source.damage * 1.2 + 10);
            return {
                damage,
                message: `${source.name} lanza una Bola de Fuego a ${target.name}!`
            };
        }
    }),

    'Golpe Triple': new Hability({
        id: 'triple_strike',
        name: 'Golpe Triple',
        description: 'Ataca tres veces con daño reducido por golpe.',
        cost: 25,
        type: 'damage',
        effectFn: (source, target) => {
            const damage = Math.floor(source.damage * 0.6) * 3;
            return {
                damage,
                message: `${source.name} asesta un Golpe Triple a ${target.name}!`
            };
        }
    }),

    'Ataque UP': new Hability({
        id: 'attack_up',
        name: 'Ataque UP',
        description: 'Sube tu propio ataque un 50% de tu ataque base para este combate.',
        cost: 15,
        type: 'buff',
        targetType: 'self',
        effectFn: (source, target) => {
            const buffAmount = Math.floor(source.baseDamage * 0.5);
            source.damage += buffAmount;
            return {
                message: `${source.name} sube su propio ataque en ${buffAmount} puntos!`
            };
        }
    }),

    'Defensa UP': new Hability({
        id: 'defense_up',
        name: 'Defensa UP',
        description: 'Sube tu propia defensa un 50% de tu defensa base para este combate.',
        cost: 15,
        type: 'buff',
        targetType: 'self',
        effectFn: (source, target) => {
            const buffAmount = Math.floor(source.baseDefense * 0.5);
            source.defense += buffAmount;
            return {
                message: `${source.name} sube su propia defensa en ${buffAmount} puntos!`
            };
        }
    }),

    'Velocidad UP': new Hability({
        id: 'speed_up',
        name: 'Velocidad UP',
        description: 'Sube tu propia velocidad un 50% de tu velocidad base para este combate.',
        cost: 15,
        type: 'buff',
        targetType: 'self',
        effectFn: (source, target) => {
            const buffAmount = Math.floor(source.baseSpeed * 0.5);
            source.speed += buffAmount;
            return {
                message: `${source.name} sube su propia velocidad en ${buffAmount} puntos!`
            };
        }
    })
};
