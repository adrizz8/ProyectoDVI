import { HABILITIES } from './habilities.js';

export default class SkillMenu {
    constructor(scene, onSkillSelected, onCancel) {
        this.scene = scene;
        this.onSkillSelected = onSkillSelected;
        this.onCancel = onCancel;

        this._buildMenu();
    }

    _buildMenu() {
        const W = this.scene.scale.width;
        const H = this.scene.scale.height + 390;

        this.container = this.scene.add.container(W / 2, H / 2).setDepth(20).setVisible(false);

        // Background
        const bg = this.scene.add.rectangle(0, 0, 1000, 400, 0x000000, 0.9).setStrokeStyle(4, 0xffffff);
        this.container.add(bg);

        // Title
        const title = this.scene.add.text(0, -170, 'TÉCNICAS', {
            fontFamily: 'SFDistantGalaxy', fontSize: '32px', fill: '#ffffff'
        }).setOrigin(0.5);
        this.container.add(title);

        this._skillTexts = [];
        this._skillPage = 0;
        this._currentSkillsList = [];

        // Pagination buttons
        this._prevBtn = this.scene.add.text(-470, 10, '<', {
            fontFamily: 'SFDistantGalaxy', fontSize: '48px', fill: '#ffcc00'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this._prevBtn.on('pointerdown', () => this.changePage(-1));

        this._nextBtn = this.scene.add.text(470, 10, '>', {
            fontFamily: 'SFDistantGalaxy', fontSize: '48px', fill: '#ffcc00'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this._nextBtn.on('pointerdown', () => this.changePage(1));

        this.container.add([this._prevBtn, this._nextBtn]);

        // Description text area
        this._descText = this.scene.add.text(0, 140, 'Pasa el ratón sobre una técnica para ver su descripción.', {
            fontFamily: 'Orbitron', fontSize: '18px', fill: '#00d2ff', align: 'center', wordWrap: { width: 900 }
        }).setOrigin(0.5);
        this.container.add(this._descText);

        // Create 6 text placeholders
        const startX = -250;
        const startY = -80;
        const spacingX = 500;
        const spacingY = 60;

        for (let i = 0; i < 6; i++) {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            const text = this.scene.add.text(x, y, '', {
                fontFamily: 'SFDistantGalaxy', fontSize: '20px', fill: '#ffffff'
            }).setOrigin(0.5).setPadding(20).setInteractive({ useHandCursor: true });

            text.on('pointerover', () => {
                text.setTint(0xffcc00);
                this.updateDescription(i);
            });
            text.on('pointerout', () => {
                text.clearTint();
                this._descText.setText('Pasa el ratón sobre una técnica para ver su descripción.');
            });
            text.on('pointerdown', () => this.onSelect(i));

            this._skillTexts.push(text);
            this.container.add(text);
        }

        // Close button
        const closeBtn = this.scene.add.text(460, -170, 'X', {
            fontFamily: 'SFDistantGalaxy', fontSize: '28px', fill: '#ff0000'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.hide(true));
        this.container.add(closeBtn);
    }

    show(skills, playerMp) {
        this._currentSkillsList = skills;
        this._playerMp = playerMp;
        this._skillPage = 0;
        this.updateMenu();
        this.container.setVisible(true);
    }

    hide(isCancel = false) {
        this.container.setVisible(false);
        if (isCancel && this.onCancel) {
            this.onCancel();
        }
    }

    isVisible() {
        return this.container.visible;
    }

    changePage(dir) {
        if (!this._currentSkillsList || this._currentSkillsList.length <= 6) return;
        const maxPage = Math.ceil(this._currentSkillsList.length / 6) - 1;
        this._skillPage += dir;
        if (this._skillPage < 0) this._skillPage = maxPage;
        if (this._skillPage > maxPage) this._skillPage = 0;
        this.updateMenu();
    }

    updateMenu() {
        const startIdx = this._skillPage * 6;
        for (let i = 0; i < 6; i++) {
            const skillIdx = startIdx + i;
            if (skillIdx < this._currentSkillsList.length) {
                const skillId = this._currentSkillsList[skillIdx];
                const skillData = HABILITIES[skillId];

                const cost = skillData ? skillData.cost : 0;
                const canUse = this._playerMp >= cost;

                this._skillTexts[i].setText(`${skillData ? skillData.name : skillId} (${cost}MP)`);
                this._skillTexts[i].setVisible(true);

                if (canUse) {
                    this._skillTexts[i].setFill('#ffffff');
                    this._skillTexts[i].setAlpha(1);
                } else {
                    this._skillTexts[i].setFill('#888888');
                    this._skillTexts[i].setAlpha(0.6);
                }
            } else {
                this._skillTexts[i].setVisible(false);
            }
        }

        if (this._currentSkillsList.length > 6) {
            this._prevBtn.setVisible(true);
            this._nextBtn.setVisible(true);
        } else {
            this._prevBtn.setVisible(false);
            this._nextBtn.setVisible(false);
        }
        
        this._descText.setText('Pasa el ratón sobre una técnica para ver su descripción.');
    }

    updateDescription(idx) {
        const skillIdx = this._skillPage * 6 + idx;
        if (skillIdx < this._currentSkillsList.length) {
            const skillId = this._currentSkillsList[skillIdx];
            const skillData = HABILITIES[skillId];
            if (skillData) {
                this._descText.setText(skillData.description);
            }
        }
    }

    onSelect(idx) {
        if (!this.isVisible()) return;

        const skillId = this._currentSkillsList[this._skillPage * 6 + idx];
        const skillData = HABILITIES[skillId];
        const cost = skillData ? skillData.cost : 0;

        if (this._playerMp < cost) {
            // No suficiente MP, no hacer nada o mostrar feedback
            return;
        }

        this.hide(false);

        if (this.onSkillSelected) {
            this.onSkillSelected(skillId);
        }
    }
}
