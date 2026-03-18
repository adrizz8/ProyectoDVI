import { HABILITIES } from './habilities.js';

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
        this.mp = stats.mp ?? 30;
        this.maxMp = stats.maxMp ?? 30;
        this.habilidades = stats.habilidades || [];

        this._guardActive = false;
    }

    /**
     * @returns {{ type: 'attack'|'special'|'skip', damage?: number, actionName: string }}
     */
    chooseAction() {
        if (this.habilidades.length > 0) {
            const randomIdx = Math.floor(Math.random() * this.habilidades.length);
            const randomSkillName = this.habilidades[randomIdx];
            const skill = HABILITIES[randomSkillName];

            if (skill) {
                if (this.mp < skill.cost) {
                    if (Math.random() < 0.75) {
                        return { type: 'guard', actionName: 'Guardia' };
                    }
                } else {
                    if (Math.random() < 0.70) {
                        return { type: 'skill', skillName: randomSkillName, actionName: skill.name };
                    }
                }
            }
        }

        const usableSkills = this.habilidades.filter(name => {
            const skill = HABILITIES[name];
            return skill && this.mp >= skill.cost;
        });

        if (usableSkills.length > 0 && Math.random() < 0.60) {
            const skillName = usableSkills[Math.floor(Math.random() * usableSkills.length)];
            const skill = HABILITIES[skillName];
            return {
                type: 'skill',
                skillName,
                actionName: skill.name
            };
        }

        const isCrit = Math.random() < (this.luck / 50);
        const finalDamage = isCrit ? Math.floor(this.damage * 1.5) : this.damage;

        return {
            type: 'attack',
            actionName: `${this.name} ataca`,
            damage: finalDamage,
            isCrit: isCrit
        };
    }

    /**
     * El enemigo se pone en guardia: mitiga el siguiente golpe y recupera MP.
     */
    guard() {
        this._guardActive = true;
        const mpGain = 10;
        this.mp = Math.min(this.maxMp, this.mp + mpGain);
        return { actionName: 'Guardia', mpGained: mpGain };
    }

    /**
     * Usa una habilidad sobre un objetivo.
     * @param {string} skillName
     * @param {PlayerBattle|EnemyBattle} target
     */
    useSkill(skillName, target) {
        const hability = HABILITIES[skillName];
        if (!hability) return { success: false, message: 'Habilidad no encontrada' };
        return hability.execute(this, target);
    }

    // ── Recibir daño ─────────────────────────────────────────────────────────

    receiveDamage(damage) {
        const guarded = this._guardActive;
        const currentDefense = Math.max(1, this.defense);

        let damageTaken = Math.floor((damage * 10) / currentDefense);
        damageTaken = Math.max(1, damageTaken);

        // La guardia reduce el daño a la mitad
        if (guarded) {
            damageTaken = Math.floor(damageTaken / 2);
            this._guardActive = false;
        }

        this.hp = Math.max(0, this.hp - damageTaken);
        return {
            damageTaken,
            guarded,
            isDead: this.hp <= 0,
        };
    }

    // ── Consultas de estado ───────────────────────────────────────────────────

    get isDead() { return this.hp <= 0; }
    get hpPercent() { return this.hp / this.maxHp; }
}
