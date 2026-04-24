export default class ActionMenu {
    constructor(scene, battleManager, callbacks) {
        this.scene = scene;
        this.battle_manager = battleManager;
        this.callbacks = callbacks;
        this._buildButtons();
    }

    _buildButtons() {
        const H = this.scene.scale.height;
        this.container = this.scene.add.container(0, 0).setDepth(10);
        this.buttons = {};
        const BTN_Y = H - 272; 

        this.tutorialArrow = this.scene.add.text(0, 0, '⬇', {
            fontSize: '42px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 5
        })
        .setOrigin(0.5)
        .setDepth(30)
        .setVisible(false);

        this.container.add(this.tutorialArrow);


        const btnDefs = [
            {
                id:0,
                key: 'boton_luchar', x: 155, action: () => {
                    if (this.callbacks.onAttack) this.callbacks.onAttack();
                }
            },
            {
                id:1,
                key: 'boton_habilidades', x: 330, action: () => {
                    if (this.callbacks.onSkills) this.callbacks.onSkills();
                }
            },
            { 
                id:2,
                key: 'boton_mochila', x: 593, action: () => {
                if (this.callbacks.onBag) this.callbacks.onBag();
            }},
            { 
                id:3,
                key: 'boton_guardia', x: 780, action: () => {
                if (this.callbacks.onGuard) this.callbacks.onGuard();
            }},
            { 
                id:4,
                key: 'boton_huir', x: 968, action: () => {
                if (this.callbacks.onFlee) this.callbacks.onFlee();
            }},
        ];

        btnDefs.forEach(({ id, key, x, action }) => {

            const btn = this.scene.add.image(x, BTN_Y, key)
                .setOrigin(0, 0.5)
                .setInteractive({ useHandCursor: true });

            btn.enabled = true;

            btn.on('pointerover', () => {
                if (!btn.enabled) return;
                btn.setScale(1.05);
                btn.setTint(0xffffff);
            });

            btn.on('pointerout', () => {
                if (!btn.enabled) return;
                btn.setScale(1.0);
                btn.clearTint();
            });

            btn.on('pointerdown', () => {
                if (!btn.enabled) return;
                btn.setScale(0.95);
                action();
            });

            btn.on('pointerup', () => {
                if (!btn.enabled) return;
                btn.setScale(1.05);
            });

            this.buttons[id] = btn;
            this.container.add(btn);
        });
    }

    setVisibility(visible) {
        this.container.setAlpha(visible ? 1 : 0.4);
        this.container.iterate(child => {
            if (child.input) child.input.enabled = visible;
        });
    }

    setButtonEnabled(id, enabled) {
        const btn = this.buttons[id];
        if (!btn) return;

        btn.enabled = enabled;

        if (enabled) {
            btn.setAlpha(1);
            btn.setInteractive({ useHandCursor: true });
        } else {
            btn.setAlpha(0.4);
            btn.disableInteractive();
            btn.setScale(1);
            btn.clearTint();
        }
    }


    showTutorialArrow(buttonId) {
        const btn = this.buttons[buttonId];
        if (!btn) return;

        this.tutorialArrow
            .setPosition(btn.x + btn.displayWidth / 2, btn.y - 65)
            .setVisible(true);

        if (!this.arrowTween) {
            this.arrowTween = this.scene.tweens.add({
                targets: this.tutorialArrow,
                y: this.tutorialArrow.y - 10,
                duration: 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    hideTutorialArrow() {
        this.tutorialArrow.setVisible(false);

        if (this.arrowTween) {
            this.arrowTween.stop();
            this.arrowTween = null;
        }
    }

}
