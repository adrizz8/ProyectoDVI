import Phaser from "phaser";
import BattleManager from "./battle_manager.js";

//Hay que replantear esto y dividirlo en varias clases para luego poder escalarlo y que usarlo sea más sencillo. 

export default class BattleScene extends Phaser.Scene {

    constructor() {
        super({ key: 'battle_scene' });
    }


    init(data) {
        this._playerStats = {
            name: data.playerName ?? 'Jugador',
            hp: data.playerHP ?? 100,
            maxHp: data.playerMaxHp ?? 100,
            damage: data.playerDamage ?? 25,
        };
        this._enemyStats = {
            name: data.enemyName ?? 'Toy',
            hp: data.enemyHP ?? 80,
            maxHp: data.enemyMaxHp ?? 80,
            damage: data.enemyDamage ?? 15,
        };
        this._originScene = data.originScene ?? 'level';
    }


    create() {
        const W = this.scale.width;   // 1000
        const H = this.scale.height;  // 500

        this.manager = new BattleManager(this._playerStats, this._enemyStats);
        this._busy = false;

        // ── 1. Fondo de la zona de combate (detrás de todo) ─────────────────
        this.add.image(W / 2, H / 2, 'fondoCombate').setDisplaySize(W, H).setDepth(-1);

        // ── 2. UI inferior: imagen battleuiejemplo.png ────────────────────────
        const UI_BAND_H = 200;   // altura de la banda UI en el canvas
        const UI_TOP_Y = H - UI_BAND_H;   // y=300 en canvas 500px

        this.add.image(W / 2, H / 2, 'battleUI').setDisplaySize(W, H).setDepth(1);


        // ── 4. Sprite del enemigo encima de la plataforma morada ──────────
        // La plataforma morada del battleuiejemplo está aprox. en x=760, y=255 del canvas.
        // Colocamos el sprite justo encima de ella.
        this._enemySprite = this.add.image(830, 155, 'toy')
            .setScale(4)
            .setDepth(2);

        // ── 5. Info del enemigo (esquina superior izquierda) ──────────────────
        this._enemyNameText = this.add.text(30, 20,
            this.manager.getEnemyName(), {
            fontSize: '22px', fill: '#fff',
            fontFamily: 'monospace', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 4,
        }).setDepth(4);

        this._enemyHPText = this.add.text(30, 48,
            `HP: ${this.manager.getEnemyHP()} / ${this.manager.getEnemyMaxHP()}`, {
            fontSize: '16px', fill: '#aaffaa',
            fontFamily: 'monospace',
            stroke: '#000', strokeThickness: 3,
        }).setDepth(4);

        // ── 6. Barras HP/MP del jugador ───────────────────────────────────────
        // En la imagen las barras están en la parte baja del portrait.
        // Canvas: x≈90–270, HP_Y≈UI_TOP_Y+155, MP_Y≈UI_TOP_Y+170
        const BAR_X = 90;
        const BAR_MAX_W = 180;
        const HP_BAR_Y = UI_TOP_Y + 158;
        const MP_BAR_Y = UI_TOP_Y + 174;
        const BAR_H = 10;

        this._playerHPBar = this.add.rectangle(BAR_X, HP_BAR_Y, BAR_MAX_W, BAR_H, 0x22dd22)
            .setOrigin(0, 0.5).setDepth(5);
        this._playerMPBar = this.add.rectangle(BAR_X, MP_BAR_Y, BAR_MAX_W, BAR_H, 0x2266ff)
            .setOrigin(0, 0.5).setDepth(5);

        this._playerHPText = this.add.text(BAR_X, HP_BAR_Y - 14,
            `${this.manager.getPlayerHP()} / ${this.manager.getPlayerMaxHP()}`, {
            fontSize: '11px', fill: '#ffffff', fontFamily: 'monospace',
            stroke: '#000', strokeThickness: 2,
        }).setDepth(6);

        this._BAR_MAX_W = BAR_MAX_W;

        // ── 7. Cuadro de mensajes de batalla ─────────────────────────────────
        // Situado dentro de la franja UI, a la derecha del portrait del jugador.
        const MSG_X = 50;
        const MSG_Y = UI_TOP_Y - 100;
        const MSG_W = 400;

        this._msgText = this.add.text(MSG_X + 10, MSG_Y + 10, '', {
            fontSize: '15px',
            fill: '#ffffff',
            fontFamily: 'monospace',
            wordWrap: { width: MSG_W - 20, useAdvancedWrap: true },
            stroke: '#000',
            strokeThickness: 2,
            lineSpacing: 4,
        }).setDepth(5);

        // Mensaje de bienvenida
        this._setMessage(`¡Empieza el combate!\n${this.manager.getEnemyName()} quiere pelear.`);


        // ── 8. Zonas de clic invisibles sobre los botones del asset ───────────
        // Los botones están en la franja superior de la UI (Y≈UI_TOP_Y+6 a UI_TOP_Y+28)
        // Coordenadas X aproximadas de cada botón en canvas (1000px ancho):
        const BTN_Y = UI_TOP_Y + 4;
        const BTN_H = 26;

        const btnDefs = [
            { x1: 93, x2: 218, action: () => this._onLuchar() },
            { x1: 233, x2: 430, action: () => this._onHabilidades() },
            { x1: 452, x2: 622, action: () => this._onMochila() },
            { x1: 637, x2: 793, action: () => this._onGuardia() },
            { x1: 808, x2: 895, action: () => this._onHuir() },
        ];

        this._hitZones = [];
        btnDefs.forEach(({ x1, x2, action }) => {
            const cx = (x1 + x2) / 2;
            const bw = x2 - x1;

            const zone = this.add.zone(cx, BTN_Y, bw, BTN_H)
                .setOrigin(0.5, 0)
                .setDepth(9)
                .setInteractive({ useHandCursor: true });

            const highlight = this.add.rectangle(cx, BTN_Y + BTN_H / 2, bw, BTN_H, 0xffff00, 0)
                .setDepth(8);

            zone.on('pointerover', () => { if (!this._busy) highlight.setFillStyle(0xffff00, 0.3); });
            zone.on('pointerout', () => highlight.setFillStyle(0xffff00, 0));
            zone.on('pointerdown', () => { if (!this._busy) action(); });

            this._hitZones.push({ zone, highlight });
        });
    }


    //LÓGICA Y ACCIONES DEL COMBATE 
    //Se moverá a otra clase
    _onLuchar() {
        this._busy = true;
        this._shakeSprite(this._enemySprite);

        const result = this.manager.playerAttack();
        this._updateEnemyHP();
        this._setMessage(
            `${this.manager.getPlayerName()} ataca a ${this.manager.getEnemyName()}\n` +
            `¡Causa ${result.damage} puntos de daño!`
        );

        if (result.enemyDead) {
            this.time.delayedCall(900, () => {
                this._setMessage(`¡${this.manager.getEnemyName()} ha sido derrotado!\n¡Victoria!`);
                this.time.delayedCall(2200, () => this._endBattle());
            });
        } else {
            this.time.delayedCall(900, () => this._enemyTurn());
        }
    }

    _onHabilidades() {
    }

    _onMochila() {
    }

    _onGuardia() {
        this._busy = true;
        this.manager.activateGuard();
        this._setMessage(
            `${this.manager.getPlayerName()} se pone en guardia.\n` +
            `El próximo ataque hará la mitad de daño.`
        );
        this.time.delayedCall(900, () => this._enemyTurn());
    }

    _onHuir() {
        this._busy = true;
        this._setMessage(`${this.manager.getPlayerName()} intenta huir...`);
        this.time.delayedCall(1200, () => this._endBattle());
    }


    _enemyTurn() {
        this._shakeSprite(this._enemySprite);

        const result = this.manager.enemyAttack();
        this._updatePlayerHP();

        let msg = `${this.manager.getEnemyName()} ataca a ${this.manager.getPlayerName()}\n`;
        if (result.guarded) {
            msg += `¡Guardia activa! Solo ${result.damage} puntos de daño.`;
        } else {
            msg += `¡Causa ${result.damage} puntos de daño!`;
        }
        this._setMessage(msg);

        if (result.playerDead) {
            this.time.delayedCall(900, () => {
                this._setMessage(`¡${this.manager.getPlayerName()} ha sido derrotado!\nFin del combate.`);
                this.time.delayedCall(2200, () => this._endBattle());
            });
        } else {
            this.time.delayedCall(900, () => {
                this._busy = false;
            });
        }
    }


    _endBattle() {
        this.scene.start(this._originScene);
    }


    _updatePlayerHP() {
        const pct = this.manager.getPlayerHPPercent();
        const newW = Math.max(1, pct * this._BAR_MAX_W);
        this._playerHPBar.setDisplaySize(newW, 9);
        this._playerHPBar.setFillStyle(this._hpColor(pct));
        this._playerHPText.setText(
            `${this.manager.getPlayerHP()} / ${this.manager.getPlayerMaxHP()}`
        );
    }

    _updateEnemyHP() {
        this._enemyHPText.setText(
            `HP: ${this.manager.getEnemyHP()} / ${this.manager.getEnemyMaxHP()}`
        );
    }

    _hpColor(pct) {
        if (pct > 0.5) return 0x22dd22;
        if (pct > 0.25) return 0xffcc00;
        return 0xee2222;
    }


    _setMessage(msg) {
        if (this._msgText) this._msgText.setText(msg);
    }

    _shakeSprite(sprite) {
        if (!sprite) return;
        const origX = sprite.x;
        this.tweens.add({
            targets: sprite,
            x: origX + 8,
            duration: 60,
            yoyo: true,
            repeat: 3,
            onComplete: () => sprite.setX(origX),
        });
    }
}