import Phaser from 'phaser';
import BattleManager from './battle_manager.js';
import GameManager from '../manager.js';

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

        this._enemyStats = {
            name: data.enemyName ?? 'Toy',
            hp: data.enemyHP ?? 120,
            maxHp: data.enemyMaxHp ?? 120,
            damage: data.enemyDamage ?? 20,
            speed: data.enemySpeed ?? 12,
            spriteKey: data.enemySpriteKey ?? 'toy',
            expReward: data.expReward ?? 150
        };
        this._originScene = data.originScene ?? 'level';
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.battle_manager = new BattleManager(this._playerStats, this._enemyStats, this);
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
        this._buildEnemySprite();
        this._buildEnemyInfo();
        this._buildPlayerBars(H); // Estas barras ahora representarán al jugador ACTIVO
        this._buildMessageBox(H);
        this._buildButtons(H);

        // Ocultar botones al inicio
        this._setButtonsVisibility(false);

        // Iniciar combate
        this.battle_manager.startBattle();
    }

    // ── UI Building ───────────────────────────────────────────────────────────

    _buildBackground(W, H) {
        this.add.image(W / 2, H / 2, 'fondoCombate').setDisplaySize(W, H).setDepth(-1);
        this.add.image(W / 2, H / 2, 'battleUI').setDisplaySize(W, H).setDepth(1);
    }

    _buildPlayerSprites() {
        this._playerSprites = [];
        this._playerLabels = [];
        const players = this.battle_manager.getAllPlayers();
        const tints = [0xffffff, 0xffcccc, 0xccffcc, 0xccccff];

        const startX = 180;
        const startY = 160;
        const offsetX = -40;
        const offsetY = 70;

        players.forEach((player, index) => {
            const x = startX + (index * offsetX);
            const y = startY + (index * offsetY);

            const sprite = this.add.sprite(x, y, 'player')
                .setScale(4)
                .setDepth(2)
                .setTint(tints[index % tints.length]);

            // Texto con nombre sobre el jugador
            const label = this.add.text(x, y - 60, player.name, {
                fontSize: '14px', fill: '#fff', fontFamily: 'monospace',
                stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(3);

            this._playerSprites.push(sprite);
            this._playerLabels.push(label);
        });
    }

    _buildEnemySprite() {
        this._enemySprite = this.add.image(830, 155, this.battle_manager.getEnemy().spriteKey)
            .setScale(4)
            .setDepth(2);
    }

    _buildEnemyInfo() {
        this._enemyNameText = this.add.text(30, 20, this.battle_manager.getEnemy().name, {
            fontSize: '26px', fill: '#fff', fontFamily: 'monospace', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 5
        }).setDepth(4);

        this._enemyHPText = this.add.text(30, 55, '', {
            fontSize: '18px', fill: '#aaffaa', fontFamily: 'monospace',
            stroke: '#000', strokeThickness: 3
        }).setDepth(4);
        this._updateEnemyHP();
    }

    _buildPlayerBars(H) {
        const BAR_X = 90;
        const HP_BAR_Y = H - 42;
        const MP_BAR_Y = H - 26;
        this._BAR_MAX_W = 180;

        // Nombre del jugador activo en el panel inferior
        this._activePlayerNameText = this.add.text(BAR_X, H - 75, '', {
            fontSize: '18px', fill: '#fff', fontFamily: 'monospace', fontStyle: 'bold'
        }).setDepth(6);

        this._playerHPBar = this.add.rectangle(BAR_X, HP_BAR_Y, this._BAR_MAX_W, 10, 0x22dd22)
            .setOrigin(0, -1).setDepth(5);
        this._playerMPBar = this.add.rectangle(BAR_X, MP_BAR_Y, this._BAR_MAX_W, 10, 0x2266ff)
            .setOrigin(0, -1).setDepth(5);

        this._playerHPText = this.add.text(BAR_X, HP_BAR_Y - 15, '', {
            fontSize: '12px', fill: '#fff', fontFamily: 'monospace'
        }).setDepth(6);

        // ── Barras de la Party (Derecha) ──
        this._partyBarGroup = [];
        const PARTY_X = BAR_X + this._BAR_MAX_W + 36;
        const MINI_BAR_W = 100;
        const players = this.battle_manager.getAllPlayers();

        players.forEach((player, i) => {
            const py = (H - 85) + (i * 22);
            
            // Nombre pequeñito
            this.add.text(PARTY_X, py, player.name.substring(0, 8), {
                fontSize: '11px', fill: '#ccc', fontFamily: 'monospace'
            }).setDepth(6);

            // Fondo barra
            this.add.rectangle(PARTY_X, py + 13, MINI_BAR_W, 6, 0x000000)
                .setOrigin(0, 0).setDepth(5).setAlpha(0.5);
            
            // Barra progreso
            const bar = this.add.rectangle(PARTY_X, py + 13, MINI_BAR_W, 6, 0x22dd22)
                .setOrigin(0, 0).setDepth(6);

            this._partyBarGroup.push({ bar, player, maxW: MINI_BAR_W });
        });
        
        this._updatePartyBars();
    }

    _buildMessageBox(H) {
        this._msgText = this.add.text(480, H - 140, '', {
            fontSize: '18px', fill: '#fff', fontFamily: 'monospace',
            wordWrap: { width: 450 }, align: 'center'
        }).setOrigin(0.5, 0).setDepth(5);
    }

    _buildButtons(H) {
        this._btnContainer = this.add.container(0, 0).setDepth(10);
        const BTN_Y = H - 196;
        const BTN_H = 26;

        const btnDefs = [
            { x1: 93, x2: 218, action: () => this.battle_manager.onAttack() },
            { x1: 233, x2: 430, action: () => this.battle_manager.onSkill() },
            { x1: 452, x2: 622, action: () => { } }, // Bag (not implemented)
            { x1: 637, x2: 793, action: () => this.battle_manager.onGuard() },
            { x1: 808, x2: 895, action: () => this.battle_manager.onFlee() },
        ];

        btnDefs.forEach(({ x1, x2, action }) => {
            const cx = (x1 + x2) / 2;
            const bw = x2 - x1;

            const zone = this.add.zone(cx, BTN_Y, bw, BTN_H)
                .setOrigin(0.5, 0)
                .setInteractive({ useHandCursor: true });

            const highlight = this.add.rectangle(cx, BTN_Y + BTN_H / 2, bw, BTN_H, 0xffff00, 0);

            zone.on('pointerover', () => highlight.setFillStyle(0xffff00, 0.3));
            zone.on('pointerout', () => highlight.setFillStyle(0xffff00, 0));
            zone.on('pointerdown', () => action());

            this._btnContainer.add([zone, highlight]);
        });
    }

    _setButtonsVisibility(visible) {
        this._btnContainer.setAlpha(visible ? 1 : 0.3);
        this._btnContainer.iterate(child => {
            if (child.type === 'Zone') child.input.enabled = visible;
        });
    }

    // ── Callbacks ─────────────────────────────────────────────────────────────

    _updateTurnIndicator(participant) {
        // Resetear todos los labels
        this._playerLabels.forEach(l => l.setColor('#ffffff').setFontStyle('normal'));
        this._enemyNameText.setColor('#ffffff');

        if (participant.type === 'player') {
            const label = this._playerLabels[participant.index];
            label.setColor('#ffff00').setFontStyle('bold');
            this._updateActivePlayerUI(participant.data);
        } else {
            this._enemyNameText.setColor('#ffff00');
            // Al ser turno enemigo, los botones deben estar desactivados
            this._setButtonsVisibility(false);
        }
    }

    _onPlayerTurnStarted(idx) {
        this._setButtonsVisibility(true);
    }

    _onPlayerActionResult(result) {
        this._setButtonsVisibility(false);
        this._shakeSprite(this._enemySprite);
        this._updateEnemyHP();
        this._setMessage(`¡${result.actionName} de ${this.battle_manager.turnQueue[this.battle_manager.currentTurnIndex].data.name}!\nCausa ${result.damage} de daño.`);
    }

    _onEnemyActionResult(result) {
        const players = this.battle_manager.getAllPlayers();
        const targetIdx = players.findIndex(p => p.name === result.targetName);
        if (targetIdx !== -1) {
            this._shakeSprite(this._playerSprites[targetIdx]);
        }

        this._updatePartyBars();
        
        // Si el que ha recibido el daño es el que tiene el turno ahora, actualizamos la barra grande
        const current = this.battle_manager.getActiveParticipant();
        if (current && current.type === 'player' && current.data.name === result.targetName) {
            this._updateActivePlayerUI(current.data);
        }

        this._setMessage(`${result.actionName} contra ${result.targetName}.\n¡Causa ${result.damage} de daño!`);
    }

    _onBattleEnd(result) {
        const msg = result.winner === 'player' ? "¡VICTORIA!" : result.winner === 'enemy' ? "DERROTA..." : "Has huido.";
        this._setMessage(msg);
        this.time.delayedCall(2000, () => {
            this.scene.start(this._originScene);
        });
    }

    // ── Updates ───────────────────────────────────────────────────────────────

    _updateActivePlayerUI(player) {
        if (!player || player.hp === undefined) return;
        this._activePlayerNameText.setText(player.name);
        const pct = player.hpPercent;
        this._playerHPBar.displayWidth = pct * this._BAR_MAX_W;
        this._playerHPBar.setFillStyle(this._hpColor(pct));
        this._playerHPText.setText(`HP: ${player.hp} / ${player.maxHp}`);
    }

    _updatePartyBars() {
        this._partyBarGroup.forEach(item => {
            const pct = item.player.hpPercent;
            item.bar.displayWidth = pct * item.maxW;
            item.bar.setFillStyle(this._hpColor(pct));
        });
    }

    _updateEnemyHP() {
        const enemy = this.battle_manager.getEnemy();
        this._enemyHPText.setText(`HP: ${enemy.hp} / ${enemy.maxHp}`);
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