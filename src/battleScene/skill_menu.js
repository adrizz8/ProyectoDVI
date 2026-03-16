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
        const bg = this.scene.add.rectangle(0, 0, 1000, 240, 0x000000, 0.9).setStrokeStyle(4, 0xffffff);
        this.container.add(bg);

        // Title
        const title = this.scene.add.text(0, -90, 'HABILIDADES', {
            fontFamily: 'SFDistantGalaxy', fontSize: '28px', fill: '#ffffff'
        }).setOrigin(0.5);
        this.container.add(title);

        this._skillTexts = [];
        this._skillPage = 0;
        this._currentSkillsList = [];

        // Pagination buttons
        this._prevBtn = this.scene.add.text(-310, 10, '<', {
            fontFamily: 'SFDistantGalaxy', fontSize: '48px', fill: '#ffcc00'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this._prevBtn.on('pointerdown', () => this.changePage(-1));

        this._nextBtn = this.scene.add.text(310, 10, '>', {
            fontFamily: 'SFDistantGalaxy', fontSize: '48px', fill: '#ffcc00'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this._nextBtn.on('pointerdown', () => this.changePage(1));

        this.container.add([this._prevBtn, this._nextBtn]);

        // Create 6 text placeholders
        const startX = -180;
        const startY = -30;
        const spacingX = 360;
        const spacingY = 50;

        for (let i = 0; i < 6; i++) {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            const text = this.scene.add.text(x, y, '', {
                fontFamily: 'SFDistantGalaxy', fontSize: '22px', fill: '#ffffff'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            text.on('pointerover', () => text.setTint(0xffcc00));
            text.on('pointerout', () => text.clearTint());
            text.on('pointerdown', () => this.onSelect(i));

            this._skillTexts.push(text);
            this.container.add(text);
        }

        // Close button
        const closeBtn = this.scene.add.text(310, -90, 'X', {
            fontFamily: 'SFDistantGalaxy', fontSize: '28px', fill: '#ff0000'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.hide(true));
        this.container.add(closeBtn);
    }

    show(skills) {
        this._currentSkillsList = skills;
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
                this._skillTexts[i].setText(`${skillData ? skillData.name : skillId}`);
                this._skillTexts[i].setVisible(true);
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
    }

    onSelect(idx) {
        if (!this.isVisible()) return;

        const skillId = this._currentSkillsList[this._skillPage * 6 + idx];
        this.hide(false);

        if (this.onSkillSelected) {
            this.onSkillSelected(skillId);
        }
    }
}
