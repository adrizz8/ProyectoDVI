import { HABILITIES } from './habilities.js';

/**
 * PlayerBattle
 * ------------
 * Representa al jugador dentro de un combate.
 * Se crea al iniciar la batalla con una copia de las stats del GameManager
 * (así el combate no modifica directamente los datos globales hasta que termine).
 *
 * Responsabilidades:
 *  - Guardar las stats del jugador para esta batalla (HP actual, daño, etc.)
 *  - Exponer las acciones que puede hacer el jugador en su turno
 *  - Decidir si el jugador muere (hp <= 0)
 */
export default class PlayerBattle {

    /**
     * @param {Object} stats  Copia de los stats del jugador
     * @param {string} stats.name
     * @param {number} stats.hp
     * @param {number} stats.maxHp
     * @param {number} stats.mp
     * @param {number} stats.maxMp
     * @param {number} stats.damage
     * @param {number} stats.speed   Usado por BattleManager para calcular el orden de turnos
     */


    constructor(stats) {
        this.name = stats.name;
        this.hp = stats.hp;
        this.maxHp = stats.maxHp;
        this.mp = stats.mp;
        this.maxMp = stats.maxMp;
        this.baseDamage = stats.damage;
        this.damage = stats.damage;
        this.baseSpeed = stats.speed;
        this.speed = stats.speed;
        this.baseDefense = stats.defense || 10;
        this.defense = stats.defense || 10;
        this.level = stats.level;
        this.luck = stats.luck || 1;
        this.exp = stats.exp;
        this.expNext = stats.expNext;
        this.habilidades = stats.habilidades || [];

        // Estado interno de la batalla
        this._guardActive = false;  // ¿tiene la guardia activa este turno?
    }

    // ── Acciones del jugador en su turno ─────────────────────────────────────

    /**
     * Ataque básico. Devuelve la cantidad de daño que se va a aplicar al enemigo.
     * El BattleManager es quien aplica el daño al EnemyBattle.
     * @returns {{ damage: number, actionName: string }}
     */
    attack() {
        const isCrit = Math.random() < (this.luck / 50);
        const finalDamage = isCrit ? Math.floor(this.damage * 1.5) : this.damage;

        return {
            actionName: 'Ataque',
            damage: finalDamage,
            isCrit: isCrit
        };
    }

    /**
     * El jugador se pone en guardia.
     * El siguiente ataque enemigo hará la mitad de daño.
     * @returns {{ actionName: string }}
     */
    guard() {
        this._guardActive = true;
        const mpGain = 10;
        this.mp = Math.min(this.maxMp, this.mp + mpGain);
        return { actionName: 'Guardia', mpGained: mpGain };
    }

    /**
     * Usa un objeto del inventario. La lógica de qué hace el objeto
     * se resolverá en BattleManager (que tiene acceso al GameManager).
     * @param {string} itemId
     * @returns {{ actionName: string, itemId: string }}
     */
    useItem(itemId) {
        return { actionName: 'Objeto', itemId };
    }

    /**
     * Usa una habilidad específica.
     * @param {string} skillName Nombre de la habilidad (clave en HABILITIES)
     * @param {EnemyBattle} target El enemigo al que se ataca
     * @returns {Object} Resultado de la habilidad
     */
    useSkill(skillName, target) {
        const hability = HABILITIES[skillName];
        if (!hability) {
            return { success: false, message: "Habilidad no encontrada" };
        }
        return hability.execute(this, target);
    }

    // ── Recibir daño ─────────────────────────────────────────────────────────

    receiveDamage(rawDamage) {
        const guarded = this._guardActive;
        const currentDefense = Math.max(1, this.defense); // Prevent division by zero
        
        // Fórmula pedida: Daño = (Poder * DañoBase) / Defensa
        // Aquí ajustamos multiplicando por 10 para que cuando Defensa=10 el daño sea equivalente a antes
        const damageAfterDefense = Math.max(1, Math.floor((rawDamage * 10) / currentDefense));
        
        let damageTaken = guarded ? Math.floor(damageAfterDefense / 2) : damageAfterDefense;
        damageTaken = Math.max(1, damageTaken); // Al menos 1 de daño garantizado

        this.hp = Math.max(0, this.hp - damageTaken);

        // La guardia se consume tras bloquear un golpe
        if (guarded) this._guardActive = false;

        return {
            damageTaken,
            guarded,
            isDead: this.hp <= 0,
        };
    }

    // ── Consultas de estado ───────────────────────────────────────────────────

    get isDead() { return this.hp <= 0; }
    get hpPercent() { return this.hp / this.maxHp; }
    get mpPercent() { return this.mp / this.maxMp; }
    get isGuarding() { return this._guardActive; }
}
