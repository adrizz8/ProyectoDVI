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
        // Consumir el coste y comprobar MP (solo si no es de daño múltiple, que se gestiona externamente para cobrar solo una vez)
        if (this.type !== 'all-damage') {
            if (source.mp < this.cost) {
                return {
                    success: false,
                    message: `${source.displayName || source.name} no tiene suficiente MP para usar ${this.name}.`,
                    reason: 'NO_MP'
                };
            }
            source.mp -= this.cost;
        }

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
    'Entrega Última Hora': new Hability({
        id: 'power_attack',
        name: 'Entrega Última Hora',
        description: 'Inflige un ataque físico de gran potencia (crítico si hay suerte).',
        cost: 3,
        type: 'damage',
        effectFn: (source, target) => {
            const potencia = 50;
            const damage = Math.floor(source.damage * potencia);
            return {
                damage,
                message: `${source.displayName || source.name} entrega la práctica en el último segundo. ¡${target.displayName || target.name} recibe un impacto crítico!`
            };
        }
    }),

    'Asentir sin entender': new Hability({
        id: 'heal',
        name: 'Asentir sin entender',
        description: 'Restaura el 25% de la vida fingiendo que todo va bien.',
        cost: 5,
        type: 'heal',
        effectFn: (source, target) => {
            const healAmount = Math.floor(source.maxHp * 0.25);
            return {
                heal: healAmount,
                message: `${source.displayName || source.name} asiente con seguridad sin haber entendido nada. ¡Recupera confianza y vida!`
            };
        }
    }),

    'Funciona en mi PC': new Hability({
        id: 'fireball',
        name: 'Funciona en mi PC',
        description: 'Lanza una excusa que hace daño ignorando parte de la defensa.',
        cost: 4,
        type: 'damage',
        effectFn: (source, target) => {
            const potencia = 60;
            const damage = Math.floor(source.damage * potencia) + 10;
            return {
                damage,
                message: `${source.displayName || source.name} exclama "¡En mi PC funciona!". La lógica de ${target.displayName || target.name} colapsa ante la excusa.`
            };
        }
    }),

    'Pregunta a ChatGPT': new Hability({
        id: 'triple_strike',
        name: 'Pregunta a ChatGPT',
        description: 'Lanza tres preguntas que resuelven rápido el problema y hacen un daño moderado.',
        cost: 2,
        type: 'damage',
        effectFn: (source, target) => {
            const potencia = 40;
            const damage = Math.floor(source.damage * potencia);
            return {
                damage,
                message: `${source.displayName || source.name} consulta rápidamente a la IA. ¡Lanza una ráfaga de respuestas contra ${target.displayName || target.name}!`
            };
        }
    }),

    'Prácticas Wuolah': new Hability({
        id: 'attack_up',
        name: 'Prácticas Wuolah',
        description: 'Sube tu propio ataque en 2 puntos gracias a unos buenos apuntes.',
        cost: 3,
        type: 'buff',
        targetType: 'self',
        effectFn: (source, target) => {
            const buffAmount = 2;
            source.damage += buffAmount;
            return {
                buff: { stat: 'damage', amount: buffAmount },
                message: `${source.displayName || source.name} descarga los mejores apuntes de Wuolah. ¡Su capacidad ofensiva aumenta!`
            };
        }
    }),

    'Sentarse Atrás': new Hability({
        id: 'defense_up',
        name: 'Sentarse Atrás',
        description: 'Sube tu propia defensa en 2 puntos evitando que te vean.',
        cost: 3,
        type: 'buff',
        targetType: 'self',
        effectFn: (source, target) => {
            const buffAmount = 2;
            source.defense += buffAmount;
            return {
                buff: { stat: 'defense', amount: buffAmount },
                message: `${source.displayName || source.name} se camufla en la última fila. ¡Su defensa mejora al pasar desapercibido!`
            };
        }
    }),

    'Código Fácil': new Hability({
        id: 'speed_up',
        name: 'Código Fácil',
        description: 'Sube tu propia velocidad en 2 puntos simplificando el trabajo.',
        cost: 2,
        type: 'buff',
        targetType: 'self',
        effectFn: (source, target) => {
            const buffAmount = 2;
            source.speed += buffAmount;
            return {
                buff: { stat: 'speed', amount: buffAmount },
                message: `${source.displayName || source.name} aplica principios de Clean Code. ¡Su velocidad de ejecución aumenta!`
            };
        }
    }),

    'Correo Vacío': new Hability({
        id: 'attack_nerf',
        name: 'Correo Vacío',
        description: 'Baja el ataque del enemigo en 2 puntos por el error cometido.',
        cost: 2,
        type: 'nerf',
        targetType: 'selectable',
        effectFn: (source, target) => {
            const nerfAmount = 2;
            target.damage = Math.max(1, target.damage - nerfAmount);
            return {
                nerf: { stat: 'damage', amount: nerfAmount },
                message: `${source.displayName || source.name} envía un correo sin adjuntar el archivo. ${target.displayName || target.name} pierde el tiempo buscándolo y se debilita.`
            };
        }
    }),

    // ── Habilidades Híbridas (daño + efecto secundario) ────────────────────────

    'Preguntar Duda': new Hability({
        id: 'weakening_strike',
        name: 'Preguntar Duda',
        description: 'Ataca al enemigo y reduce su ataque en 1 punto al distraerlo.',
        cost: 4,
        type: 'damage+nerf',
        targetType: 'selectable',
        effectFn: (source, target) => {
            const potencia = 30;
            const damage = Math.floor(source.damage * potencia);
            const nerfAmount = 1;
            target.damage = Math.max(1, Math.floor(target.damage - nerfAmount));
            return {
                damage,
                nerf: { stat: 'damage', amount: nerfAmount },
                message: `${source.displayName || source.name} levanta la mano para preguntar una duda existencial. ${target.displayName || target.name} se confunde y pierde fuerza.`
            };
        }
    }),

    'Ir a la Academia': new Hability({
        id: 'invigorating_strike',
        name: 'Ir a la Academia',
        description: 'Ataca al objetivo y sube tu propio ataque en 1 punto por lo aprendido.',
        cost: 4,
        type: 'damage+buff',
        targetType: 'selectable',
        effectFn: (source, target) => {
            const potencia = 30;
            const damage = Math.floor(source.damage * potencia);
            const buffAmount = 1;
            source.damage += buffAmount;
            return {
                damage,
                buff: { stat: 'damage', amount: buffAmount },
                message: `${source.displayName || source.name} ha ido a clases de refuerzo. ¡Golpea con sabiduría y mejora su propio ataque!`
            };
        }
    }),

    '¡A pelar cables!': new Hability({
        id: 'electric_shock',
        name: '¡A pelar cables!',
        description: 'Manda a todos los usuarios a pelar cables (Ataque múltiple)',
        cost: 3,
        type: 'all-damage',
        effectFn: (source, target) => {
            const potencia = 20;
            const damage = Math.floor(source.damage * potencia);
            return {
                damage,
                message: `${source.displayName || source.name} obliga a todos a pelar cables. ¡${target.displayName || target.name} recibe una descarga!`
            };
        }
    }),
};
