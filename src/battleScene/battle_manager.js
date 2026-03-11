import PlayerBattle from './player_battle.js';
import EnemyBattle from './enemy_battle.js';
import GameManager from '../manager.js';

/**
 * BattleManager
 * -------------
 * Orquestador del combate por turnos basado en velocidad.
 * 
 * En cada ronda, se calcula el orden de actuación según la velocidad.
 * Se recorre la lista de participantes uno a uno.
 */
export default class BattleManager {

    /**
     * @param {Object[]} playerStatsArr  Lista de stats de los jugadores
     * @param {Object}   enemyStats      Stats del enemigo
     * @param {Phaser.Scene} scene       Referencia a la escena
     */
    constructor(playerStatsArr, enemyStats, scene) {
        this._scene = scene;

        // Inicializar jugadores y enemigo
        this.players = playerStatsArr.map(s => new PlayerBattle(s));
        this.enemy = new EnemyBattle(enemyStats);

        // Turnos
        this.turnQueue = [];
        this.currentTurnIndex = -1;
        this.roundCount = 0;

        this._isBusy = false;

        // Callbacks
        this._callbacks = {
            onPlayerTurnStarted: null, // (playerIndex)
            onPlayerActionResult: null,
            onEnemyActionResult: null,
            onBattleEnd: null,
            onMessage: null,
            onTurnChanged: null // (participant)
        };
    }

    setCallbacks(callbacks) {
        this._callbacks = { ...this._callbacks, ...callbacks };
    }

    /**
     * Inicia el proceso de combate
     */
    startBattle() {
        this._nextRound();
    }

    _nextRound() {
        this.roundCount++;
        this.currentTurnIndex = -1;

        // Generar cola de turnos basada en velocidad
        // Participantes: todos los jugadores vivos + enemigo (si está vivo)
        const participants = [];
        this.players.forEach((p, i) => {
            if (!p.isDead) participants.push({ type: 'player', data: p, index: i });
        });
        if (!this.enemy.isDead) {
            participants.push({ type: 'enemy', data: this.enemy });
        }

        // Ordenar por velocidad (descendente)
        this.turnQueue = participants.sort((a, b) => b.data.speed - a.data.speed);

        this._callbacks.onMessage?.(`--- Ronda ${this.roundCount} ---`);
        this._scene.time.delayedCall(1000, () => this.nextTurn());
    }

    nextTurn() {
        if (this.enemy.isDead) {
            this._endBattle('player');
            return;
        }

        // ¿Todos los jugadores han muerto?
        if (this.players.every(p => p.isDead)) {
            this._endBattle('enemy');
            return;
        }

        this.currentTurnIndex++;

        // Si hemos terminado la cola, nueva ronda
        if (this.currentTurnIndex >= this.turnQueue.length) {
            this._nextRound();
            return;
        }

        const current = this.turnQueue[this.currentTurnIndex];
        this._callbacks.onTurnChanged?.(current);

        if (current.type === 'player') {
            this._isBusy = false;
            this._callbacks.onPlayerTurnStarted?.(current.index);
            this._callbacks.onMessage?.(`Turno de ${current.data.name}`);
        } else {
            this._isBusy = true;
            this._scene.time.delayedCall(1000, () => this._runEnemyTurn());
        }
    }

    // ── Acciones del Jugador ──────────────────────────────────────────────────

    onAttack() {
        if (this._isBusy) return;
        this._isBusy = true;

        const player = this.getActiveParticipant().data;
        const action = player.attack();
        const result = this.enemy.receiveDamage(action.damage);

        this._callbacks.onPlayerActionResult?.({
            actionName: action.actionName,
            damage: result.damageTaken,
            enemyHP: this.enemy.hp,
            enemyDead: result.isDead,
            attackerIndex: this.getActiveParticipant().index
        });

        if (result.isDead) {
            this._handleEnemyDeath();
        } else {
            this._scene.time.delayedCall(1200, () => this.nextTurn());
        }
    }

    onGuard() {
        if (this._isBusy) return;
        this._isBusy = true;

        const player = this.getActiveParticipant().data;
        player.guard();
        this._callbacks.onMessage?.(`${player.name} se defiende.`);

        this._scene.time.delayedCall(1000, () => this.nextTurn());
    }

    onSkill(skillId) {
        if (this._isBusy) return;
        this._callbacks.onMessage?.("Habilidades no implementadas aún.");
    }

    onFlee() {
        if (this._isBusy) return;
        this._isBusy = true;
        this._callbacks.onMessage?.("Intentas huir...");
        this._scene.time.delayedCall(1000, () => this._endBattle('fled'));
    }

    // ── Lógica Enemiga ────────────────────────────────────────────────────────

    _runEnemyTurn() {
        const action = this.enemy.chooseAction();
        
        // El enemigo elige a un jugador vivo al azar
        const alivePlayers = this.players.filter(p => !p.isDead);
        if (alivePlayers.length === 0) return;
        
        const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        const result = target.receiveDamage(action.damage);

        this._callbacks.onEnemyActionResult?.({
            actionName: action.actionName,
            damage: result.damageTaken,
            targetName: target.name,
            targetHP: target.hp,
            targetDead: result.isDead,
            guarded: result.guarded
        });

        this._scene.time.delayedCall(1500, () => {
            if (this.players.every(p => p.isDead)) {
                this._endBattle('enemy');
            } else {
                this.nextTurn();
            }
        });
    }

    // ── Finalización ──────────────────────────────────────────────────────────

    _handleEnemyDeath() {
        this._scene.time.delayedCall(1000, () => {
            const expAmount = this.enemy.expReward;
            this._callbacks.onMessage?.(`¡${this.enemy.name} derrotado! +${expAmount} EXP`);

            const gm = GameManager.getInstance();
            this.players.forEach(p => {
                if (!p.isDead) {
                    const leveled = gm.gainExp(p.name, expAmount);
                    if (leveled) {
                        this._callbacks.onMessage?.(`¡${p.name} subió de nivel!`);
                    }
                }
            });

            this._scene.time.delayedCall(2000, () => this._endBattle('player'));
        });
    }

    _endBattle(winner) {
        this.syncToManager();
        this._callbacks.onBattleEnd?.({ winner });
    }

    syncToManager() {
        const gm = GameManager.getInstance();
        this.players.forEach(p => {
            if (gm.playerStats[p.name]) {
                gm.playerStats[p.name].hp = p.hp;
                gm.playerStats[p.name].mp = p.mp;
            }
        });
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    getActiveParticipant() {
        return this.turnQueue[this.currentTurnIndex];
    }

    getAllPlayers() { return this.players; }
    getEnemy() { return this.enemy; }
}
