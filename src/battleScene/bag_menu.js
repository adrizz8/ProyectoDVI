export default class BagMenu {
    constructor(scene, onItemSelected, onCancel) {
        this.scene = scene;
        this.onItemSelected = onItemSelected;
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
        const title = this.scene.add.text(0, -90, 'MOCHILA', {
            fontFamily: 'SFDistantGalaxy', fontSize: '28px', fill: '#ffffff'
        }).setOrigin(0.5);
        this.container.add(title);

        this._itemTexts = [];
        this._itemPage = 0;
        this._currentItemsList = [];

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

            this._itemTexts.push(text);
            this.container.add(text);
        }

        // Close button
        const closeBtn = this.scene.add.text(310, -90, 'X', {
            fontFamily: 'SFDistantGalaxy', fontSize: '28px', fill: '#ff0000'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.hide(true));
        this.container.add(closeBtn);
    }

    show(items) {
        this._currentItemsList = items.filter(item => item.type === 'consumable' && item.quantity > 0);
        this._itemPage = 0;
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
        if (!this._currentItemsList || this._currentItemsList.length <= 6) return;
        const maxPage = Math.ceil(this._currentItemsList.length / 6) - 1;
        this._itemPage += dir;
        if (this._itemPage < 0) this._itemPage = maxPage;
        if (this._itemPage > maxPage) this._itemPage = 0;
        this.updateMenu();
    }

    updateMenu() {
        const startIdx = this._itemPage * 6;
        for (let i = 0; i < 6; i++) {
            const itemIdx = startIdx + i;
            if (itemIdx < this._currentItemsList.length) {
                const item = this._currentItemsList[itemIdx];
                this._itemTexts[i].setText(`${item.name} x${item.quantity}`);
                this._itemTexts[i].setVisible(true);
            } else {
                this._itemTexts[i].setVisible(false);
            }
        }

        if (this._currentItemsList.length > 6) {
            this._prevBtn.setVisible(true);
            this._nextBtn.setVisible(true);
        } else {
            this._prevBtn.setVisible(false);
            this._nextBtn.setVisible(false);
        }
    }

    onSelect(idx) {
        if (!this.isVisible()) return;

        const item = this._currentItemsList[this._itemPage * 6 + idx];
        if (!item) return;

        this.hide(false);

        if (this.onItemSelected) {
            this.onItemSelected(item);
        }
    }
}
