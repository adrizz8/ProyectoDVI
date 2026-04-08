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
        this.objeto = stats.objeto || '';

        this._load_equipment();

        // Estado interno de la batalla
        this._guardActive = false;  // ¿tiene la guardia activa este turno?
    }


    _load_equipment() {
        if (this.objeto != '' && this.objeto.type === 'equipment' && this.objeto.bonusStats) {
            if (this.objeto.bonusStats.damage) {
                this.baseDamage += this.objeto.bonusStats.damage;
                this.damage += this.objeto.bonusStats.damage;
            }
            if (this.objeto.bonusStats.defense) {
                this.baseDefense += this.objeto.bonusStats.defense;
                this.defense += this.objeto.bonusStats.defense;
            }
            if (this.objeto.bonusStats.speed) {
                this.baseSpeed += this.objeto.bonusStats.speed;
                this.speed += this.objeto.bonusStats.speed;
            }
            if (this.objeto.bonusStats.luck) {
                this.luck += this.objeto.bonusStats.luck;
            }
            if (this.objeto.bonusStats.maxHp) {
                this.maxHp += this.objeto.bonusStats.maxHp;
                this.hp = Math.min(this.hp + this.objeto.bonusStats.maxHp, this.maxHp);
            }
            if (this.objeto.bonusStats.maxMp) {
                this.maxMp += this.objeto.bonusStats.maxMp;
                this.mp = Math.min(this.mp + this.objeto.bonusStats.maxMp, this.maxMp);
            }
        }

    }


    // ── Acciones del jugador en su turno ─────────────────────────────────────

    /**
     * Ataque básico. Devuelve la cantidad de daño que se va a aplicar al enemigo.
     * El BattleManager es quien aplica el daño al EnemyBattle.
     * @returns {{ damage: number, actionName: string }}
     */
    attack() {
        const potencia = 30;
        const isCrit = Math.random() < (this.luck / 100);

        // (Ataque * Potencia)
        const rawDamage = Math.floor(this.damage * potencia);
        const finalDamage = isCrit ? Math.floor(rawDamage * 1.5) : rawDamage;

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
        const mpGain = 20;
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

        // Nueva Fórmula: Resultado = (Ataque + Potencia) / Defensa
        const damageAfterDefense = Math.max(1, Math.floor(rawDamage * 0.6 / currentDefense));

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
