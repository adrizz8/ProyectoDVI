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
        this.damage = stats.damage;
        this.speed = stats.speed;
        this.level = stats.level;
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
        return {
            actionName: 'Ataque',
            damage: this.damage,
        };
    }

    /**
     * El jugador se pone en guardia.
     * El siguiente ataque enemigo hará la mitad de daño.
     * @returns {{ actionName: string }}
     */
    guard() {
        this._guardActive = true;
        return { actionName: 'Guardia' };
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

    // ── Recibir daño ─────────────────────────────────────────────────────────

    /**
     * El jugador recibe daño. Si la guardia está activa, lo reduce a la mitad.
     * @param {number} rawDamage  Daño base que llega
     * @returns {{ damageTaken: number, guarded: boolean, isDead: boolean }}
     */
    receiveDamage(rawDamage) {
        const guarded = this._guardActive;
        const damageTaken = guarded ? Math.floor(rawDamage / 2) : rawDamage;

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
