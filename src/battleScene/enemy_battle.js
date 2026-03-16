/**
 * EnemyBattle
 * -----------
 * Representa a un enemigo dentro de un combate.
 *
 * Responsabilidades:
 *  - Guardar las stats del enemigo para esta batalla
 *  - Exponer la lógica de IA: qué acción realiza en su turno
 *  - Decidir si el enemigo muere (hp <= 0)
 *
 * Para añadir un enemigo nuevo, basta con pasarle un objeto de stats diferente
 * y sobreescribir (o extender) el método chooseAction().
 */
export default class EnemyBattle {

    /**
     * @param {Object} stats
     * @param {string} stats.name
     * @param {number} stats.hp
     * @param {number} stats.maxHp
     * @param {number} stats.damage
     * @param {number} stats.speed     Usado por BattleManager para el orden de turnos
     * @param {string} [stats.spriteKey] Clave del asset en Phaser para mostrar el sprite
     */
    constructor(stats) {
        this.name = stats.name ?? 'Enemigo';
        this.hp = stats.hp ?? 80;
        this.maxHp = stats.maxHp ?? 80;
        this.baseDamage = stats.damage ?? 15;
        this.damage = stats.damage ?? 15;
        this.baseDefense = stats.defense ?? 10;
        this.defense = stats.defense ?? 10;
        this.luck = stats.luck ?? 1;
        this.baseSpeed = stats.speed ?? 5;
        this.speed = stats.speed ?? 5;
        this.spriteKey = stats.spriteKey ?? 'toy';
        this.expReward = stats.expReward ?? 50;
    }

    // ── IA: acción del enemigo en su turno ────────────────────────────────────

    /**
     * El enemigo decide qué hacer en su turno.
     * Por ahora siempre ataca, pero aquí es donde se puede añadir
     * lógica de IA: habilidades especiales, patrones de ataque, etc.
     *
     * @returns {{ type: 'attack'|'special'|'skip', damage?: number, actionName: string }}
     */
    chooseAction() {
        // TODO: añadir lógica de IA más compleja (habilidades especiales, etc.)
        const isCrit = Math.random() < (this.luck / 50);
        const finalDamage = isCrit ? Math.floor(this.damage * 1.5) : this.damage;

        return {
            type: 'attack',
            actionName: `${this.name} ataca`,
            damage: finalDamage,
            isCrit: isCrit
        };
    }

    // ── Recibir daño ─────────────────────────────────────────────────────────

    receiveDamage(damage) {
        const currentDefense = Math.max(1, this.defense); // Prevent division by zero
        
        // Fórmula pedida: Daño = (Poder * DañoBase) / Defensa
        // Se multiplica por 10 porque 10 es la defensa neutral por defecto
        let damageTaken = Math.floor((damage * 10) / currentDefense);
        damageTaken = Math.max(1, damageTaken); // Al menos 1 de daño garantizado

        this.hp = Math.max(0, this.hp - damageTaken);
        return {
            damageTaken: damageTaken,
            isDead: this.hp <= 0,
        };
    }

    // ── Consultas de estado ───────────────────────────────────────────────────

    get isDead() { return this.hp <= 0; }
    get hpPercent() { return this.hp / this.maxHp; }
}
