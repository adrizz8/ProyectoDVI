/**
 * BattleManager: gestiona la lógica de combate por turnos.
 */
export default class BattleManager {

    /**
     * @param {Object} playerStats  { hp, maxHp, damage, name }
     * @param {Object} enemyStats   { hp, maxHp, damage, name }
     */
    constructor(playerStats, enemyStats) {
        this.player = {
            name: playerStats.name ?? 'Jugador',
            hp: playerStats.hp ?? 100,
            maxHp: playerStats.maxHp ?? 100,
            damage: playerStats.damage ?? 25,
        };

        this.enemy = {
            name: enemyStats.name ?? 'Enemigo',
            hp: enemyStats.hp ?? 80,
            maxHp: enemyStats.maxHp ?? 80,
            damage: enemyStats.damage ?? 15,
        };

        // Modificador de guardia para el siguiente ataque recibido por el jugador
        this._guardActive = false;
    }


    /**
     * El jugador ataca al enemigo.
     * @returns {{ damage: number, enemyHP: number, enemyDead: boolean }}
     */
    playerAttack() {
        const dmg = this.player.damage;
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        return {
            damage: dmg,
            enemyHP: this.enemy.hp,
            enemyDead: this.enemy.hp <= 0,
        };
    }

    /**
     * El enemigo ataca al jugador (el daño se reduce a la mitad si la guardia está activa).
     * @returns {{ damage: number, playerHP: number, playerDead: boolean, guarded: boolean }}
     */
    enemyAttack() {
        const guarded = this._guardActive;
        let dmg = this.enemy.damage;
        if (guarded) {
            dmg = Math.floor(dmg / 2);
            this._guardActive = false;
        }
        this.player.hp = Math.max(0, this.player.hp - dmg);
        return {
            damage: dmg,
            playerHP: this.player.hp,
            playerDead: this.player.hp <= 0,
            guarded,
        };
    }

    /**
     * Activa la guardia: el próximo ataque enemigo hará la mitad de daño.
     */
    activateGuard() {
        this._guardActive = true;
    }

    // ─── Consultas de estado ─────────────────────────────────────────────────

    isPlayerDead() { return this.player.hp <= 0; }
    isEnemyDead() { return this.enemy.hp <= 0; }

    getPlayerHP() { return this.player.hp; }
    getEnemyHP() { return this.enemy.hp; }

    /** @returns {number} 0‒1 */
    getPlayerHPPercent() { return this.player.hp / this.player.maxHp; }
    /** @returns {number} 0‒1 */
    getEnemyHPPercent() { return this.enemy.hp / this.enemy.maxHp; }

    getPlayerName() { return this.player.name; }
    getEnemyName() { return this.enemy.name; }

    getPlayerMaxHP() { return this.player.maxHp; }
    getEnemyMaxHP() { return this.enemy.maxHp; }
}
