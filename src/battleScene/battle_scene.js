import Phaser from 'phaser';
import BattleManager from './battle_manager.js';
import GameManager from '../manager.js';
import { HABILITIES } from './habilities.js';
import SkillMenu from './skill_menu.js';
import ActionMenu from './action_menu.js';

/**
 * BattleScene
 * -----------
 * Escena de combate por turnos basada en velocidad.
 */
export default class BattleScene extends Phaser.Scene {

    constructor() {
        super({ key: 'battle_scene' });
    }

    init(data) {
        const gm = GameManager.getInstance();
        const allNames = Object.keys(gm.playerStats);
        this._playerStats = gm.getPlayersForBattle(allNames);

        this._enemiesStats = data.enemies || [{
            name: data.enemyName ?? 'Toy',
            hp: data.enemyHP ?? 120,
            maxHp: data.enemyMaxHp ?? 120,
            damage: data.enemyDamage ?? 20,
            speed: data.enemySpeed ?? 12,
            spriteKey: data.enemySpriteKey ?? 'toy',
            expReward: data.expReward ?? 150
        },
        {
            name: data.enemyName ?? 'Toy',
            hp: data.enemyHP ?? 120,
            maxHp: data.enemyMaxHp ?? 120,
            damage: data.enemyDamage ?? 20,
            speed: data.enemySpeed ?? 12,
            spriteKey: data.enemySpriteKey ?? 'toy',
            expReward: data.expReward ?? 150
        },
        {
            name: data.enemyName ?? 'Toy',
            hp: data.enemyHP ?? 120,
            maxHp: data.enemyMaxHp ?? 120,
            damage: data.enemyDamage ?? 20,
            speed: data.enemySpeed ?? 12,
            spriteKey: data.enemySpriteKey ?? 'toy',
            expReward: data.expReward ?? 150
        }];
        this._originScene = data.originScene ?? 'level';
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this._actionState = 'IDLE';
        this._currentSkill = null;

        this.battle_manager = new BattleManager(this._playerStats, this._enemiesStats, this);
        this.battle_manager.setCallbacks({
            onPlayerTurnStarted: (idx) => this._onPlayerTurnStarted(idx),
            onPlayerActionResult: (r) => this._onPlayerActionResult(r),
            onEnemyActionResult: (r) => this._onEnemyActionResult(r),
            onBattleEnd: (r) => this._onBattleEnd(r),
            onMessage: (m) => this._setMessage(m),
            onTurnChanged: (p) => this._updateTurnIndicator(p)
        });

        this._buildBackground(W, H);
        this._buildPlayerSprites();
        this._buildEnemiesSprites();
        this._buildTurnIndicator();
        this._buildMessageBox(H);
        
        // Inicializar menú de acciones principal
        this.actionMenu = new ActionMenu(this, this.battle_manager, {
            onAttack: () => this._onAttackIntent(),
            onSkills: () => this._onSkillsIntent(),
            onCancelSkills: () => {
                if (this.skillMenu) this.skillMenu.hide();
                this._actionState = 'IDLE';
            },
            onBag: () => this.battle_manager.onBag(),
            onGuard: () => this.battle_manager.onGuard(),
            onFlee: () => this.battle_manager.onFlee()
        });

        // Inicializar menú de habilidades externo
        this.skillMenu = new SkillMenu(this, 
            (skillId) => this._onSkillSelectedExternal(skillId),
            () => this._onSkillMenuCancelExternal()
        );

        // Ocultar botones al inicio
        this.actionMenu.setVisibility(false);

        // Iniciar combate
        this.battle_manager.startBattle();
    }

    // ── UI Building ───────────────────────────────────────────────────────────

    _buildBackground(W, H) {
        this.add.image(W / 2, H / 2, 'fondoCombate').setDisplaySize(W, H).setDepth(-1);
        this.add.image(W / 2, H / 2, 'battleUI').setDisplaySize(W, H).setDepth(0);
    }

    _buildPlayerSprites() {
        this._playerSprites = [];
        this._playerHUDs = [];
        const players = this.battle_manager.getAllPlayers();

        // Mapeo de sprites específicos de batalla
        const battleKeys = ['prota_battle', 'player2_battle', 'player3_battle', 'player4_battle'];

        const startX = 293;
        const startY = 500;
        const offsetX = 210;
        const BAR_W = 189;
        const BAR_H = 10;

        players.forEach((player, index) => {
            const x = startX + (index * offsetX);
            const y = startY;

            const key = battleKeys[index];

            const sprite = this.add.sprite(x, y, key)
                .setDepth(2)
                .setInteractive({ useHandCursor: true });

            sprite.on('pointerdown', () => this._onSpriteClicked('player', index));

            const hpFill = this.add.rectangle(x - BAR_W / 2, y + 107, BAR_W, BAR_H, 0x22dd22)
                .setOrigin(0, 0.5).setDepth(5);

            const mpFill = this.add.rectangle(x - BAR_W / 2, y + 128, BAR_W, BAR_H, 0x2266ff)
                .setOrigin(0, 0.5).setDepth(5);

            this._playerSprites.push(sprite);
            this._playerHUDs.push({ hpFill, mpFill, player, barWidth: BAR_W });
        });

        this._updatePlayerHUDs();
    }

    _buildEnemiesSprites() {
        const W = this.scale.width;
        this._enemySprites = [];
        this._enemyHUDs = [];

        const enemies = this.battle_manager.getEnemies();
        const count = enemies.length;
        const spacing = 180;
        const startX = (W / 2) - (((count - 1) * spacing) / 2);

        enemies.forEach((enemy, index) => {
            const x = startX + (index * spacing);
            const y = 155;

            const sprite = this.add.image(x, y, enemy.spriteKey)
                .setScale(2.8) // el originial era 4
                .setDepth(2)
                .setInteractive({ useHandCursor: true });

            sprite.on('pointerdown', () => this._onSpriteClicked('enemy', index));

            const BAR_W = 120;
            const BAR_H = 12;
            const yInfo = y + 155;

            this.add.rectangle(x, yInfo, BAR_W, BAR_H, 0x000000)
                .setDepth(4).setAlpha(0.6);

            const hpFill = this.add.rectangle(x - BAR_W / 2, yInfo, BAR_W, BAR_H, 0x22dd22)
                .setOrigin(0, 0.5).setDepth(5);

            this._enemySprites.push(sprite);
            this._enemyHUDs.push({ hpFill, enemy, barWidth: BAR_W });
        });

        this._updateEnemiesHP();
    }

    _buildTurnIndicator() {
        this._turnGlow = this.add.rectangle(-100, -100, 208, 198, 0xffff00, 0.8)
            .setDepth(1)
            .setAlpha(0);

        this.tweens.add({
            targets: this._turnGlow,
            alpha: 0.8,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    _buildMessageBox(H) {
        this._msgText = this.add.text(180, H - 450, '', {
            fontSize: '18px', fill: '#fff', fontFamily: 'monospace',
            wordWrap: { width: 450 }, align: 'center'
        }).setOrigin(0.5, 0).setDepth(5);
    }

    // ── Acciones desde Menús ──────────────────────────────────────────────────

    _onAttackIntent() {
        if (this._actionState === 'IDLE') {
            this._actionState = 'SELECTING_TARGET_ATTACK';
            this._setMessage("Selecciona un enemigo para atacar.");
        } else {
            if (this.skillMenu) this.skillMenu.hide();
            this._actionState = 'IDLE';
            this._currentSkill = null;
            this._setMessage("Acción cancelada.");
        }
    }

    _onSkillsIntent() {
        if (this._actionState === 'IDLE') {
            const participant = this.battle_manager.getActiveParticipant();
            const player = participant.data;
            if (!player.habilidades || player.habilidades.length === 0) {
                this._setMessage("No tienes habilidades disponibles.");
                return;
            }
            this._actionState = 'SELECTING_SKILL';
            this.skillMenu.show(player.habilidades);
        } else if (this._actionState === 'SELECTING_SKILL' || this._actionState === 'SELECTING_TARGET_SKILL') {
            this.skillMenu.hide();
            this._actionState = 'IDLE';
            this._currentSkill = null;
            this._setMessage("Acción cancelada.");
        } else {
            this._actionState = 'IDLE';
            this._setMessage("Acción cancelada.");
        }
    }

    _onSkillMenuCancelExternal() {
        if (this._actionState === 'SELECTING_SKILL') {
             this._actionState = 'IDLE';
             this._setMessage("Acción cancelada.");
        }
    }

    _onSkillSelectedExternal(skillId) {
        if (this._actionState !== 'SELECTING_SKILL') return;

        this._currentSkill = skillId;
        const skill = HABILITIES[this._currentSkill];

        const participant = this.battle_manager.getActiveParticipant();

        if (skill && skill.targetType === 'self') {
            this._actionState = 'IDLE';
            this.battle_manager.onSkill(this._currentSkill, participant.type, participant.index);
            this._currentSkill = null;
        } else {
            this._actionState = 'SELECTING_TARGET_SKILL';
            this._setMessage(`Selecciona un objetivo para ${skill ? skill.name : this._currentSkill}.`);
        }
    }
    // ── Callbacks ─────────────────────────────────────────────────────────────

    _onSpriteClicked(type, index) {
        if (this._actionState === 'SELECTING_TARGET_ATTACK') {
            if (type === 'enemy') {
                const enemies = this.battle_manager.getEnemies();
                if (enemies[index].isDead) {
                    this._setMessage("¡Ese enemigo ya está derrotado!");
                    return;
                }
                this._actionState = 'IDLE';
                this.battle_manager.onAttack(index);
            } else {
                this._setMessage("¡No puedes atacar a un aliado!");
            }
        } else if (this._actionState === 'SELECTING_TARGET_SKILL') {
            const skill = HABILITIES[this._currentSkill];

            if (skill.type === 'heal' && type === 'enemy') {
                this._setMessage("¡No puedes curar a un enemigo!");
                return;
            }
            if (skill.type === 'buff' && type === 'enemy') {
                this._setMessage("¡No puedes mejorar a un enemigo!");
                return;
            }
            if (skill.type === 'damage' && type === 'player') {
                this._setMessage("¡No puedes atacar a un aliado!");
                return;
            }

            const targetList = type === 'enemy' ? this.battle_manager.getEnemies() : this.battle_manager.getAllPlayers();
            if (targetList[index].isDead) {
                this._setMessage("¡Ese objetivo ya está derrotado!");
                return;
            }
            this._actionState = 'IDLE';
            this.battle_manager.onSkill(this._currentSkill, type, index);
            this._currentSkill = null;
        }
    }

    _updateTurnIndicator(participant) {
        let targetX, targetY;

        if (participant.type === 'player') {
            const sprite = this._playerSprites[participant.index];
            targetX = sprite.x;
            targetY = sprite.y;
            this._updatePlayerHUDs();
        } else {
            const sprite = this._enemySprites[participant.index];
            targetX = -100;
            targetY = -100;
            this.actionMenu.setVisibility(false);
        }

        if (this._turnGlow) {
            this._turnGlow.setPosition(targetX, targetY);
            if (targetX !== -100) {
                this._turnGlow.setAlpha(0.6);
            } else {
                this._turnGlow.setAlpha(0);
            }
        }
    }

    _onPlayerTurnStarted(idx) {
        this.actionMenu.setVisibility(true);
    }

    _onPlayerActionResult(result) {
        this.actionMenu.setVisibility(false);

        let msg = result.message;
        if (!msg) {
            const player = this.battle_manager.getActiveParticipant().data;
            if (result.targetType === 'player') {
                msg = `¡${result.actionName} de ${player.name} sobre un aliado!\n${result.heal ? `Cura ${result.heal} HP.` : ''}`;
            } else {
                msg = `¡${result.actionName} de ${player.name}!\nCausa ${result.damage} de daño.`;
            }
        }

        if (result.isCrit) {
            msg += '\n¡GOLPE CRÍTICO!';
        }

        if (result.targetType === 'enemy' && this._enemySprites[result.targetIndex]) {
            this._shakeSprite(this._enemySprites[result.targetIndex]);
        } else if (result.targetType === 'player' && this._playerSprites[result.targetIndex]) {
            // curación: no animar o algo distinto
        }

        this._updateEnemiesHP();
        this._updatePlayerHUDs();

        this._setMessage(msg);
    }

    _onEnemyActionResult(result) {
        const players = this.battle_manager.getAllPlayers();
        const targetIdx = players.findIndex(p => p.name === result.targetName);
        if (targetIdx !== -1) {
            this._shakeSprite(this._playerSprites[targetIdx]);
        }

        this._updatePlayerHUDs();

        let msg = `${result.actionName} contra ${result.targetName}.\n¡Causa ${result.damage} de daño!`;
        if (result.isCrit) {
            msg += '\n¡GOLPE CRÍTICO!';
        }
        this._setMessage(msg);
    }

    _onBattleEnd(result) {
        const msg = result.winner === 'player' ? "¡VICTORIA!" : result.winner === 'enemy' ? "DERROTA..." : "Has huido.";
        this._setMessage(msg);
        this.time.delayedCall(2000, () => {
            this.scene.start(this._originScene);
        });
    }

    // ── Updates ───────────────────────────────────────────────────────────────

    _updatePlayerHUDs() {
        if (!this._playerHUDs) return;
        this._playerHUDs.forEach(hud => {
            const hpPct = hud.player.hpPercent;
            const mpPct = hud.player.mpPercent;

            hud.hpFill.displayWidth = hpPct * hud.barWidth;
            hud.hpFill.setFillStyle(this._hpColor(hpPct));

            hud.mpFill.displayWidth = mpPct * hud.barWidth;
        });
    }

    _updateEnemiesHP() {
        if (!this._enemyHUDs) return;
        this._enemyHUDs.forEach((hud, index) => {
            const pct = hud.enemy.hp / hud.enemy.maxHp;
            const actualPct = Math.max(0, pct);

            hud.hpFill.displayWidth = actualPct * hud.barWidth;
            hud.hpFill.setFillStyle(this._hpColor(actualPct));

            if (hud.enemy.isDead && this._enemySprites[index]) {
                this._enemySprites[index].setAlpha(0.2);
                hud.hpFill.setAlpha(0.2);
            }
        });
    }

    // ── Utils ─────────────────────────────────────────────────────────────────

    _setMessage(msg) {
        this._msgText.setText(msg);
    }

    _hpColor(pct) {
        if (pct > 0.5) return 0x22dd22;
        if (pct > 0.25) return 0xffcc00;
        return 0xee2222;
    }

    _shakeSprite(sprite) {
        if (!sprite) return;
        const ox = sprite.x;
        this.tweens.add({
            targets: sprite,
            x: ox + 10,
            duration: 50,
            yoyo: true,
            repeat: 4,
            onComplete: () => sprite.x = ox
        });
    }
}