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
        name: 'Entrega Última Hora',
        description: 'Inflige un ataque físico de gran potencia (crítico si hay suerte).',
        cost: 10,
        type: 'damage',
        effectFn: (source, target) => {
            const potencia = 50;
            const damage = Math.floor(source.damage * potencia);
            return {
                damage,
                message: `${source.name} usa un Ataque Potente sobre ${target.name}!`
            };
        }
    }),

    'Cura': new Hability({
        id: 'heal',
        name: 'Asentir sin entender',
        description: 'Restaura 50 puntos de salud fingiendo que todo va bien.',
        cost: 15,
        type: 'heal',
        effectFn: (source, target) => {
            const healAmount = 50;
            return {
                heal: healAmount,
                message: `${source.name} lanza Cura sobre ${target.name}!`
            };
        }
    }),

    'Fuego': new Hability({
        id: 'fireball',
        name: 'Funciona en mi PC',
        description: 'Lanza una excusa que hace daño ignorando parte de la defensa.',
        cost: 20,
        type: 'damage',
        effectFn: (source, target) => {
            const potencia = 50;
            const damage = Math.floor(source.damage * potencia) + 10;
            return {
                damage,
                message: `${source.name} lanza una Bola de Fuego a ${target.name}!`
            };
        }
    }),

    'Golpe Triple': new Hability({
        id: 'triple_strike',
        name: 'Pregunta a ChatGPT',
        description: 'Tres respuestas rápidas que asestan tres golpes.',
        cost: 15,
        type: 'damage',
        effectFn: (source, target) => {
            const potencia = 15; // Tres golpes de 6 de potencia cada uno
            const damage = Math.floor(source.damage * potencia) * 3;
            return {
                damage,
                message: `${source.name} asesta un Golpe Triple a ${target.name}!`
            };
        }
    }),

    'Ataque UP': new Hability({
        id: 'attack_up',
        name: 'Prácticas Wuolah',
        description: 'Sube tu propio ataque un 25% gracias a unos buenos apuntes.',
        cost: 15,
        type: 'buff',
        targetType: 'self',
        effectFn: (source, target) => {
            const buffAmount = Math.floor(source.baseDamage * 0.25);
            source.damage += buffAmount;
            return {
                buff: { stat: 'damage', amount: buffAmount },
                message: `${source.name} sube su propio ataque en ${buffAmount} puntos!`
            };
        }
    }),

    'Defensa UP': new Hability({
        id: 'defense_up',
        name: 'Sentarse Atrás',
        description: 'Sube tu propia defensa un 25% evitando que te vean.',
        cost: 15,
        type: 'buff',
        targetType: 'self',
        effectFn: (source, target) => {
            const buffAmount = Math.floor(source.baseDefense * 0.25);
            source.defense += buffAmount;
            return {
                buff: { stat: 'defense', amount: buffAmount },
                message: `${source.name} sube su propia defensa en ${buffAmount} puntos!`
            };
        }
    }),

    'Velocidad UP': new Hability({
        id: 'speed_up',
        name: 'Código Fácil',
        description: 'Sube tu propia velocidad un 25% simplificando el trabajo.',
        cost: 15,
        type: 'buff',
        targetType: 'self',
        effectFn: (source, target) => {
            const buffAmount = Math.floor(source.baseSpeed * 0.25);
            source.speed += buffAmount;
            return {
                buff: { stat: 'speed', amount: buffAmount },
                message: `${source.name} sube su propia velocidad en ${buffAmount} puntos!`
            };
        }
    }),

    'Ataque NERF': new Hability({
        id: 'attack_nerf',
        name: 'Correo Vacío',
        description: 'Baja el ataque del enemigo un 25% por el error cometido.',
        cost: 15,
        type: 'nerf',
        targetType: 'selectable',
        effectFn: (source, target) => {
            const nerfAmount = Math.floor(target.baseDamage * 0.25);
            target.damage = Math.max(1, target.damage - nerfAmount);
            return {
                nerf: { stat: 'damage', amount: nerfAmount },
                message: `${source.name} debilita el ataque de ${target.name} en ${nerfAmount} puntos!`
            };
        }
    }),

    // ── Habilidades Híbridas (daño + efecto secundario) ────────────────────────

    'Golpe Debilitador': new Hability({
        id: 'weakening_strike',
        name: 'Preguntar Duda',
        description: 'Ataca al enemigo y reduce su ataque un 15% al distraerlo.',
        cost: 20,
        type: 'damage+nerf',
        targetType: 'selectable',
        effectFn: (source, target) => {
            const potencia = 30;
            const damage = Math.floor(source.damage * potencia);
            const nerfAmount = Math.floor(target.baseDamage * 0.15);
            target.damage = Math.max(1, target.damage - nerfAmount);
            return {
                damage,
                nerf: { stat: 'damage', amount: nerfAmount },
                message: `${source.name} asesta un Golpe Debilitador a ${target.name}!\n¡Su ataque baja ${nerfAmount} puntos!`
            };
        }
    }),

    'Golpe Vigorizante': new Hability({
        id: 'invigorating_strike',
        name: 'Ir a la Academia',
        description: 'Ataca al objetivo y sube tu propio ataque un 15% por lo aprendido.',
        cost: 20,
        type: 'damage+buff',
        targetType: 'selectable',
        effectFn: (source, target) => {
            const potencia = 30;
            const damage = Math.floor(source.damage * potencia);
            const buffAmount = Math.floor(source.baseDamage * 0.15);
            source.damage += buffAmount;
            return {
                damage,
                buff: { stat: 'damage', amount: buffAmount },
                message: `${source.name} asesta un Golpe Vigorizante a ${target.name}!\n¡Su propio ataque sube ${buffAmount} puntos!`
            };
        }
    }),
};
