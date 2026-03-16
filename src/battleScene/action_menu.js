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
        const BTN_Y = H - 272;

        const btnDefs = [
            {
                key: 'boton_luchar', x: 155, action: () => {
                    if (this.callbacks.onAttack) this.callbacks.onAttack();
                }
            },
            {
                key: 'boton_habilidades', x: 330, action: () => {
                    if (this.callbacks.onSkills) this.callbacks.onSkills();
                }
            },
            { key: 'boton_mochila', x: 593, action: () => {
                if (this.callbacks.onCancelSkills) this.callbacks.onCancelSkills();
                if (this.callbacks.onBag) this.callbacks.onBag();
            }},
            { key: 'boton_guardia', x: 780, action: () => {
                if (this.callbacks.onCancelSkills) this.callbacks.onCancelSkills();
                if (this.callbacks.onGuard) this.callbacks.onGuard();
            }},
            { key: 'boton_huir', x: 968, action: () => {
                if (this.callbacks.onCancelSkills) this.callbacks.onCancelSkills();
                if (this.callbacks.onFlee) this.callbacks.onFlee();
            }},
        ];

        btnDefs.forEach(({ key, x, action }) => {
            const btn = this.scene.add.image(x, BTN_Y, key)
                .setOrigin(0, 0.5)
                .setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => {
                btn.setScale(1.05);
                btn.setTint(0xffffff);
            });

            btn.on('pointerout', () => {
                btn.setScale(1.0);
                btn.clearTint();
            });

            btn.on('pointerdown', () => {
                btn.setScale(0.95);
                action();
            });

            btn.on('pointerup', () => {
                btn.setScale(1.05);
            });

            this.container.add(btn);
        });
    }

    setVisibility(visible) {
        this.container.setAlpha(visible ? 1 : 0.4);
        this.container.iterate(child => {
            if (child.input) child.input.enabled = visible;
        });
    }
}
