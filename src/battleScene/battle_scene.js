import Phaser from "phaser";
import BattleManager from "./battle_manager.js";

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

        // ── 1. Fondo de la zona de combate ────────────────────────────────────
        // La imagen fondo.png llena solo la zona superior (área de batalla)
        //this.add.image(W / 2, H / 2, 'fondo').setDisplaySize(W, H).setDepth(0);

        // ── 2. UI inferior: imagen battleuiejemplo.png ────────────────────────
        // La imagen mide 1000×700 nativos. La queremos mostrando solo su franja
        // inferior (la parte de UI) ajustada al fondo del canvas.
        // Estrategia simple: escalarla para que encaje en ancho (W) y alinearla
        // al fondo. Como el canvas es 500px y la imagen es 700px, la imagen queda
        // por encima: el centro Y = H - (700/2) * escala → con escala = W/1000 = 1,
        // centro = 500 - 350 = 150 → la zona de UI (y≈430 en imagen) cae a
        // 150 + (430-350) = 230 en canvas. Eso es correcto, coincide con lo que vemos.
        //
        // Para simplificar y evitar cálculos errados, usamos setDisplaySize para
        // forzar que la imagen ocupe exactamente la banda inferior de 200px.
        const UI_BAND_H = 200;   // altura de la banda UI en el canvas
        const UI_TOP_Y = H - UI_BAND_H;   // y=300 en canvas 500px

        this.add.image(W / 2, H / 2, 'battleUI').setDisplaySize(W, H).setDepth(0);


        // ── 4. Sprite del enemigo (zona superior derecha, área de batalla) ────
        this._enemySprite = this.add.image(760, 160, 'toy')
            .setScale(4)
            .setDepth(3);

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
    _onLuchar() {
        this._busy = true;
        this._shakeSprite(this._enemySprite);

        const result = this.manager.playerAttack();
        this._updateEnemyHP();

        if (result.enemyDead) {
            this.time.delayedCall(900, () => {
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
        this.time.delayedCall(900, () => this._enemyTurn());
    }

    _onHuir() {
        this._busy = true;
        this.time.delayedCall(1200, () => this._endBattle());
    }


    _enemyTurn() {
        this._setMessage = () => { }; // sin mensajes
        this._shakeSprite(this._enemySprite);

        const result = this.manager.enemyAttack();
        this._updatePlayerHP();

        if (result.playerDead) {
            this.time.delayedCall(900, () => {
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


    _setMessage(_msg) { /* mensajes eliminados */ }

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