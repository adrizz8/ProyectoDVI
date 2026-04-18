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
        this.spriteKey = stats.spriteKey ?? 'toybatalla';
        this.expReward = stats.expReward ?? 50;
        this.moneyReward = stats.moneyReward ?? Math.floor(20 + Math.random() * 20);
        this.mp = stats.mp ?? 30;
        this.maxMp = stats.maxMp ?? 30;
        this.habilidades = stats.habilidades || [];
        this.objeto = stats.objeto || '';

        this._load_equipment();

        this._guardActive = false;
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

    /**
     * @returns {{ type: 'attack'|'skill'|'guard', damage?: number, actionName: string, skillName?: string, isCrit?: boolean }}
     */
    chooseAction() {
        // 1. Filtrar habilidades que realmente puede usar (tiene MP)
        const usableSkills = this.habilidades.filter(name => {
            const skill = HABILITIES[name];
            return skill && this.mp >= skill.cost;
        });

        // 2. Probabilidad de usar habilidad (60%)
        if (usableSkills.length > 0 && Math.random() < 0.60) {
            const skillName = usableSkills[Math.floor(Math.random() * usableSkills.length)];
            const skill = HABILITIES[skillName];
            return {
                type: 'skill',
                skillName,
                actionName: skill.name
            };
        }

        // 3. Si no usa habilidad y tiene poco MP, probabilidad de Guardia (40%)
        if (this.mp < 15 && Math.random() < 0.70) {
            return { type: 'guard', actionName: 'Guardia' };
        }
        if (this.mp < this.maxMp * 0.8 && Math.random() < 0.20) {
            return { type: 'guard', actionName: 'Guardia' };
        }

        // 4. Por defecto: Ataque Básico (Calculando daño y crítico aquí)
        const potencia = 30;
        const isCrit = Math.random() < (this.luck / 100);
        const rawDamage = Math.floor(this.damage * potencia);
        const finalDamage = isCrit ? Math.floor(rawDamage * 1.5) : rawDamage;

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

        // Nueva Fórmula: Resultado = (Ataque + Potencia) / Defensa
        let damageTaken = Math.floor(damage / currentDefense);
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
