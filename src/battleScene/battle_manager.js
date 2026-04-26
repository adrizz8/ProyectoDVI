import PlayerBattle from './player_battle.js';
import EnemyBattle from './enemy_battle.js';
import GameManager from '../manager.js';
import { HABILITIES } from './habilities.js';

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
     * @param {Object[]} enemiesStatsArr Lista de stats de los enemigos
     * @param {Phaser.Scene} scene       Referencia a la escena
     */
    constructor(playerStatsArr, enemiesStatsArr, scene, npcid, nivel, Tutorial) {
        this._scene = scene;

        // Inicializar jugadores y enemigos
        this.players = playerStatsArr.map(s => new PlayerBattle(s));
        this.enemies = enemiesStatsArr.map(s => new EnemyBattle(s));

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
            onTurnChanged: null, // (participant)
            onReadyForNextTurn: null // (nextTurnFn) → la escena llama a nextTurnFn() cuando el jugador confirme
        };

        this.npcid = npcid;
        this.nivel = nivel;
        this.Tutorial = Tutorial;
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
        // Participantes: todos los jugadores vivos + enemigos vivos
        const participants = [];
        this.players.forEach((p, i) => {
            if (!p.isDead) participants.push({ type: 'player', data: p, index: i });
        });
        this.enemies.forEach((e, i) => {
            if (!e.isDead) participants.push({ type: 'enemy', data: e, index: i });
        });

        // Ordenar por velocidad (descendente)
        this.turnQueue = participants.sort((a, b) => b.data.speed - a.data.speed);

        this._callbacks.onMessage?.(`--- Ronda ${this.roundCount} ---`);
        // Notificar a la escena: cuando el jugador confirme el mensaje de ronda, avanzar
        this._callbacks.onReadyForNextTurn?.(() => this.nextTurn());



    }

    nextTurn() {
        if (this.enemies.every(e => e.isDead)) {
            this._endBattle('player');
            return;
        }

        // Si el Jugador1 muere, se pierde la partida
        if (this._isPlayer1Dead()) {
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

        // Si el participante actual murió debido a contadores o daño previo, saltar turno
        if (current.data.isDead) {
            this.nextTurn();
            return;
        }

        this._callbacks.onTurnChanged?.(current);

        if (current.type === 'player') {
            this._isBusy = false;
            this._callbacks.onPlayerTurnStarted?.(current.index);
            this._callbacks.onMessage?.(`Turno de ${current.data.name}`);

            if (this.Tutorial) {
                if (this.roundCount == 1) {
                    this._callbacks.onReadyForNextTurn?.(() => this._scene.tutoAttack());

                }
                else if (this.roundCount == 2) {
                    this._callbacks.onReadyForNextTurn?.(() => this._scene.tutoHabilidad());
                }
                else if (this.roundCount == 3) {
                    this._callbacks.onReadyForNextTurn?.(() => this._scene.tutoGuardia());
                }
                else if (this.roundCount == 4) {
                    this._callbacks.onReadyForNextTurn?.(() => {
                        this._callbacks.onMessage?.("En la mochila podras usar consumibles que te ayudaran durante los combates, Mucha suerte!!!!");
                        this._callbacks.onReadyForNextTurn?.(() => this._scene.tutoReset());
                    });
                }
            }

        } else {
            this._isBusy = true;
            // Pequeño delay para que las animaciones del glow sean visibles antes del turno enemigo
            this._scene.time.delayedCall(600, () => this._runEnemyTurn());
        }
    }

    // ── Acciones del Jugador ──────────────────────────────────────────────────

    onAttack(targetIndex) {
        if (this._isBusy) return;
        this._isBusy = true;

        const targetEnemy = this.enemies[targetIndex];
        const player = this.getActiveParticipant().data;
        const action = player.attack();
        const result = targetEnemy.receiveDamage(action.damage);

        this._callbacks.onPlayerActionResult?.({
            actionName: action.actionName,
            damage: result.damageTaken,
            enemyHP: targetEnemy.hp,
            enemyDead: result.isDead,
            attackerIndex: this.getActiveParticipant().index,
            targetIndex: targetIndex,
            targetType: 'enemy',
            isCrit: action.isCrit
        });

        if (this.enemies.every(e => e.isDead)) {
            this._handleAllEnemiesDeath();
        } else if (result.isDead) {
            this._callbacks.onMessage?.(`¡${targetEnemy.name} fue derrotado!`);
            this._callbacks.onReadyForNextTurn?.(() => this.nextTurn());
        } else {
            this._callbacks.onReadyForNextTurn?.(() => this.nextTurn());
        }
    }

    onGuard() {
        if (this._isBusy) return;
        this._isBusy = true;

        const participant = this.getActiveParticipant();
        const player = participant.data;
        const guardResult = player.guard();

        this._callbacks.onPlayerActionResult?.({
            actionName: 'Guardia',
            attackerIndex: participant.index,
            targetIndex: participant.index,
            targetType: 'player',
            mpGained: guardResult.mpGained,
            message: `${player.name} se pone en posición de defensa.`
        });

        this._callbacks.onReadyForNextTurn?.(() => this.nextTurn());
    }

    onSkill(skillName, targetType, targetIndex) {
        if (this._isBusy) return;

        const player = this.getActiveParticipant().data;

        let target;
        if (targetType === 'player') target = this.players[targetIndex];
        else target = this.enemies[targetIndex];

        const result = player.useSkill(skillName, target);

        if (!result.success) {
            this._callbacks.onMessage?.(result.message);
            return;
        }

        this._isBusy = true;

        // Si la habilidad hizo daño
        let enemyResult = { isDead: false, damageTaken: 0 };
        if (result.damage) {
            enemyResult = target.receiveDamage(result.damage);
        }

        if (result.heal) {
            target.hp = Math.min(target.maxHp, target.hp + result.heal);
        }

        this._callbacks.onPlayerActionResult?.({
            actionName: result.actionName,
            damage: enemyResult.damageTaken,
            heal: result.heal,
            nerf: result.nerf || null,
            buff: result.buff || null,
            enemyHP: targetType === 'enemy' ? target.hp : null,
            enemyDead: enemyResult.isDead,
            attackerIndex: this.getActiveParticipant().index,
            message: result.message,
            targetIndex: targetIndex,
            targetType: targetType,
            isCrit: result.isCrit
        });

        if (this.enemies.every(e => e.isDead)) {
            this._handleAllEnemiesDeath();
        } else if (enemyResult.isDead) {
            this._callbacks.onMessage?.(`¡${target.name} fue derrotado!`);
            this._callbacks.onReadyForNextTurn?.(() => this.nextTurn());
        } else {
            this._callbacks.onReadyForNextTurn?.(() => this.nextTurn());
        }
    }

    onItem(item, targetType, targetIndex) {
        if (this._isBusy) return;
        this._isBusy = true;

        let target;
        if (targetType === 'player') target = this.players[targetIndex];
        else target = this.enemies[targetIndex];

        const gm = GameManager.getInstance();
        if (!gm.useItem(item.id)) {
            this._callbacks.onMessage?.("No se pudo usar el objeto.");
            this._isBusy = false;
            return;
        }

        const participant = this.getActiveParticipant().data;

        let resultMessage = `${participant.name} usó ${item.name} en ${target.name}.`;

        if (item.heal) {
            target.hp = Math.min(target.maxHp, target.hp + item.heal);
            resultMessage += `\nRecupera ${item.heal} HP.`;
        }
        if (item.recMp) {
            target.mp = Math.min(target.maxMp, target.mp + item.recMp);
            resultMessage += `\nRecupera ${item.recMp} MP.`;
        }
        if (item.buffAtt) {
            target.damage += item.buffAtt;
            resultMessage += `\nAtaque +${item.buffAtt}.`;
        }
        if (item.buffDef) {
            target.defense += item.buffDef;
            resultMessage += `\nDefensa +${item.buffDef}.`;
        }
        if (item.buffSpd) {
            target.speed += item.buffSpd;
            resultMessage += `\nVelocidad +${item.buffSpd}.`;
        }
        if (item.buffLck) {
            target.luck += item.buffLck;
            resultMessage += `\nSuerte +${item.buffLck}.`;
        }

        this._callbacks.onPlayerActionResult?.({
            actionName: "Objeto",
            damage: 0,
            heal: item.heal || 0,
            enemyHP: targetType === 'enemy' ? target.hp : null,
            enemyDead: targetType === 'enemy' ? target.isDead : false,
            attackerIndex: this.getActiveParticipant().index,
            message: resultMessage,
            targetIndex: targetIndex,
            targetType: targetType,
            isCrit: false,
            usedItem: item
        });

        this._callbacks.onReadyForNextTurn?.(() => this.nextTurn());
    }

    onFlee() {
        if (this._isBusy) return;
        this._isBusy = true;
        this._callbacks.onMessage?.("Intentas huir...");
        this._scene.time.delayedCall(1000, () => this._endBattle('fled'));
    }

    // ── Lógica Enemiga ────────────────────────────────────────────────────────

    _runEnemyTurn() {
        const currentEnemyData = this.getActiveParticipant();
        const currentEnemy = currentEnemyData.data;
        const action = currentEnemy.chooseAction();

        // El enemigo elige a un jugador vivo al azar
        const alivePlayers = this.players.filter(p => !p.isDead);
        if (alivePlayers.length === 0) return;

        const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        const targetIdx = this.players.indexOf(target);

        if (action.type === 'skill') {
            const skill = HABILITIES[action.skillName];
            let finalTargetIndex = targetIdx;
            let finalTargetType = 'player';
            let finalTarget = target;

            // Lógica especial de selección de objetivo para habilidades de curación
            if (skill && skill.type === 'heal') {
                const enemies = this.getEnemies();
                const needsHeal = enemies.filter(e => !e.isDead && e.hp < e.maxHp * 0.8);

                if (needsHeal.length > 0) {
                    // Seleccionar al aliado con menor HP porcentual
                    const worstAlley = needsHeal.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
                    finalTarget = worstAlley;
                    finalTargetIndex = enemies.indexOf(worstAlley);
                    finalTargetType = 'enemy';
                } else {
                    // Si nadie necesita curación pero se eligió cura, fallback a ataque básico
                    this._runEnemyBasicAttack(currentEnemyData, currentEnemy, target, targetIdx);
                    return;
                }
            } else {
                const isSelf = skill && skill.targetType === 'self';
                finalTargetIndex = isSelf ? currentEnemyData.index : targetIdx;
                finalTargetType = isSelf ? 'enemy' : 'player';
                finalTarget = isSelf ? currentEnemy : target;
            }

            // Ejecutar habilidad del enemigo
            const result = currentEnemy.useSkill(action.skillName, finalTarget);

            if (!result.success) {
                // Fallback de seguridad (aunque chooseAction ya valida MP)
                this._runEnemyBasicAttack(currentEnemyData, currentEnemy, target, targetIdx);
            } else {
                let damageTaken = 0;
                if (result.damage) {
                    const dmgResult = finalTarget.receiveDamage(result.damage);
                    damageTaken = dmgResult.damageTaken;
                }

                if (result.heal) {
                    finalTarget.hp = Math.min(finalTarget.maxHp, finalTarget.hp + result.heal);
                }

                this._callbacks.onEnemyActionResult?.({
                    actionName: result.actionName,
                    damage: damageTaken,
                    targetName: finalTarget.name,
                    targetIndex: finalTargetIndex,
                    targetType: finalTargetType,
                    targetHP: finalTarget.hp,
                    targetDead: finalTarget.isDead,
                    attackerIndex: currentEnemyData.index,
                    isCrit: result.isCrit || false,
                    nerf: result.nerf || null,
                    buff: result.buff || null,
                    heal: result.heal || 0,
                    message: result.message
                });

                this._callbacks.onReadyForNextTurn?.(() => this._checkPostTurn());
            }
        } else if (action.type === 'guard') {
            this._runEnemyGuard(currentEnemyData, currentEnemy);
        } else {
            // Ataque básico (action.type === 'attack')
            // El daño ya viene calculado desde EnemyBattle.chooseAction()
            const result = target.receiveDamage(action.damage);

            this._callbacks.onEnemyActionResult?.({
                actionName: action.actionName,
                damage: result.damageTaken,
                targetName: target.name,
                targetIndex: targetIdx,
                targetHP: target.hp,
                targetDead: result.isDead,
                guarded: result.guarded,
                attackerIndex: currentEnemyData.index,
                isCrit: action.isCrit,
                nerf: null,
                buff: null
            });

            this._callbacks.onReadyForNextTurn?.(() => this._checkPostTurn());
        }
    }

    _runEnemyBasicAttack(currentEnemyData, currentEnemy, target, targetIdx) {
        // Método de fallback si falla una habilidad por MP inesperadamente
        const isCrit = Math.random() < (currentEnemy.luck / 100);
        const rawDamage = Math.floor(currentEnemy.damage * 30);
        const finalDamage = isCrit ? Math.floor(rawDamage * 1.5) : rawDamage;
        const result = target.receiveDamage(finalDamage);

        this._callbacks.onEnemyActionResult?.({
            actionName: `${currentEnemy.name} ataca`,
            damage: result.damageTaken,
            targetName: target.name,
            targetIndex: targetIdx,
            targetHP: target.hp,
            targetDead: result.isDead,
            guarded: result.guarded,
            attackerIndex: currentEnemyData.index,
            isCrit: isCrit,
            nerf: null,
            buff: null
        });

        this._callbacks.onReadyForNextTurn?.(() => this._checkPostTurn());
    }

    _checkPostTurn() {
        if (this._isPlayer1Dead()) {
            this._endBattle('enemy');
        } else {
            this.nextTurn();
        }
    }

    _runEnemyGuard(currentEnemyData, currentEnemy) {
        const guardResult = currentEnemy.guard();

        this._callbacks.onEnemyActionResult?.({
            actionName: 'Guardia',
            damage: 0,
            targetName: currentEnemy.name,
            targetIndex: null,
            targetHP: currentEnemy.hp,
            targetDead: false,
            attackerIndex: currentEnemyData.index,
            isCrit: false,
            nerf: null,
            buff: null,
            isGuard: true,
            guardEnemyIndex: currentEnemyData.index,
            message: `${currentEnemy.name} se prepara para el siguiente ataque.`
        });

        this._callbacks.onReadyForNextTurn?.(() => {
            if (this._isPlayer1Dead()) {
                this._endBattle('enemy');
            } else {
                this.nextTurn();
            }
        });
    }

    // ── Finalización ──────────────────────────────────────────────────────────

    _handleAllEnemiesDeath() {
        this._scene.time.delayedCall(1000, () => {
            const totalExp = this.enemies.reduce((acc, e) => acc + (e.expReward || 0), 0);
            const totalMoney = this.enemies.reduce((acc, e) => acc + (e.moneyReward || 0), 0);

            let winMessage = `¡Victoria! +${totalExp} EXP`;
            if (totalMoney > 0) winMessage += ` y +${totalMoney}€`;
            this._callbacks.onMessage?.(winMessage);

            const gm = GameManager.getInstance();
            if (totalMoney >= 0) gm.addDinero(totalMoney);
            this.players.forEach(p => {
                if (!p.isDead) {
                    const leveledLogs = gm.gainExp(p.name, totalExp);
                    if (leveledLogs) {
                        leveledLogs.forEach(log => {
                            this._callbacks.onMessage?.(`¡${p.name} subió al nivel ${log.level}!`);
                            if (log.learnedSkill) {
                                this._callbacks.onMessage?.(`¡${p.name} aprendió ${log.learnedSkill}!`);
                            }
                        });
                    }
                }
            });

            this._scene.time.delayedCall(2000, () => this._endBattle('player'));
        });
    }

    _endBattle(winner) {

        this.syncToManager(winner);
        this._callbacks.onBattleEnd?.({ winner });
    }

    syncToManager(winner) {
        const gm = GameManager.getInstance();
        this.players.forEach(p => {
            if (gm.playerStats[p.name]) {
                gm.playerStats[p.name].hp = p.hp;
                gm.playerStats[p.name].mp = p.mp;
            }
        });

        if (winner == 'player') {
            gm.markDefeated(this.npcid);
            gm.setJustDefeated(this.npcid);
            if (this.nivel != null) {
                gm.CompleteNivel(this.nivel);
            }
        }
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    getActiveParticipant() {
        return this.turnQueue[this.currentTurnIndex];
    }

    getAllPlayers() { return this.players; }
    getEnemies() { return this.enemies; }

    _isPlayer1Dead() {
        const p1 = this.players.find(p => p.name === 'Jugador1');
        return p1 ? p1.isDead : false;
    }
}
