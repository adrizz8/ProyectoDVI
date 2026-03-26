import Phaser from 'phaser';
import GameManager from '../manager.js';

export default class MochilaScene extends Phaser.Scene {
    constructor() {
        super('MochilaScene');
        this.selectedTab = 'consumable';
        this.selectedPlayer = null;
        this.selectedItem = null;
    }

    create() {
        this.gm = GameManager.getInstance();
        this.players = Object.keys(this.gm.playerStats);
        this.selectedPlayer = this.players[0] || null;

        this.add.rectangle(608, 320, 1216, 640, 0x0a0a0f, 0.95);
        this.add.text(608, 25, 'MOCHILA', {
            fontFamily: 'Distant Galaxy', fontSize: '42px', fill: '#f5d442', fontStyle: 'bold', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5, 0);

        this.add.text(80, 70, 'Categorías:', {
            fontFamily: 'Distant Galaxy', fontSize: '22px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3
        });

        this.tabs = {
            consumable: this.add.text(80, 110, 'Consumibles', { fontFamily: 'Distant Galaxy', fontSize: '20px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setInteractive({ useHandCursor: true }),
            equipment: this.add.text(240, 110, 'Equipamiento', { fontFamily: 'Distant Galaxy', fontSize: '20px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setInteractive({ useHandCursor: true }),
            key: this.add.text(440, 110, 'Objetos clave', { fontFamily: 'Distant Galaxy', fontSize: '20px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setInteractive({ useHandCursor: true })
        };

        Object.keys(this.tabs).forEach(tab => {
            this.tabs[tab].on('pointerdown', () => {
                this.selectedTab = tab;
                this.selectedItem = null;
                this.refreshView();
            });
        });

        this.itemTextList = [];
        for (let i = 0; i < 10; i++) {
            const itemText = this.add.text(80, 170 + i * 40, '', {
                fontFamily: 'Distant Galaxy', fontSize: '18px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3
            }).setInteractive({ useHandCursor: true });
            itemText.on('pointerdown', () => this.selectItem(i));
            this.itemTextList.push(itemText);
        }

        this.add.text(80, 530, 'Selecciona personaje:', {
            fontFamily: 'Distant Galaxy', fontSize: '18px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3
        });

        this.playerButtons = [];
        this.players.forEach((name, index) => {
            const btn = this.add.text(80 + index * 180, 560, name, {
                fontFamily: 'Distant Galaxy', fontSize: '18px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3
            }).setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                this.selectedPlayer = name;
                this.updatePlayerSelection();
                this.updateStatusText(`${name} seleccionado para uso de objetos.`);
            });
            this.playerButtons.push(btn);
        });

        this.detailBox = this.add.text(660, 130, '', {
            fontFamily: 'Distant Galaxy', fontSize: '18px', fill: '#ffffff', wordWrap: { width: 460 }, stroke: '#000000', strokeThickness: 3
        });

        this.actionButton = this.add.text(660, 460, 'USAR OBJETO', {
            fontFamily: 'Distant Galaxy', fontSize: '24px', fill: '#00ff00', stroke: '#000000', strokeThickness: 3
        }).setInteractive({ useHandCursor: true });
        this.actionButton.on('pointerdown', () => this.onActionButton());

        this.statusText = this.add.text(660, 520, '', {
            fontFamily: 'Distant Galaxy', fontSize: '18px', fill: '#ffffff', wordWrap: { width: 460 }, stroke: '#000000', strokeThickness: 2
        });

        this.add.text(608, 600, 'Presiona ESPACIO o ESC para volver', {
            fontFamily: 'Distant Galaxy', fontSize: '16px', fill: '#cccccc'
        }).setOrigin(0.5, 0);

        this.input.keyboard.on('keydown-ESC', () => this.closeScene());
        this.input.keyboard.on('keydown-SPACE', () => this.closeScene());

        this.refreshView();
    }

    closeScene() {
        this.scene.start('MenuPrincipal');
    }

    refreshView() {
        this.updateTabHighlights();
        this.renderItems();
        this.updatePlayerSelection();
        this.renderSelectedItem();
    }

    updateTabHighlights() {
        Object.keys(this.tabs).forEach(tab => {
            this.tabs[tab].setStyle({ fill: tab === this.selectedTab ? '#ffcc00' : '#ffffff' });
        });
    }

    selectItem(index) {
        const items = this.gm.getItemsByType(this.selectedTab);
        const item = items[index];
        if (item) {
            this.selectedItem = item;
            this.renderSelectedItem();
            this.updateStatusText(`${item.name} seleccionado.`);
        }
    }

    renderItems() {
        const items = this.gm.getItemsByType(this.selectedTab);
        for (let i = 0; i < this.itemTextList.length; i++) {
            if (i < items.length) {
                const item = items[i];
                this.itemTextList[i].setText(`${item.name} x${item.quantity}`);
                this.itemTextList[i].setVisible(true);
            } else {
                this.itemTextList[i].setText('');
                this.itemTextList[i].setVisible(false);
            }
        }
        if (!items.length) {
            this.itemTextList[0].setText('No hay items en esta categoría.');
            this.itemTextList[0].setVisible(true);
        }
        if (!this.selectedItem || this.selectedItem.type !== this.selectedTab) {
            this.selectedItem = items[0] || null;
        }
        this.renderSelectedItem();
    }

    renderSelectedItem() {
        if (!this.selectedItem) {
            this.detailBox.setText('Selecciona un objeto para ver detalles.');
            this.actionButton.setText('USAR OBJETO');
            this.actionButton.setStyle({ fill: '#888888' });
            return;
        }

        const item = this.selectedItem;
        const details = [];
        details.push(`Nombre: ${item.name}`);
        details.push(`Cantidad: ${item.quantity}`);
        details.push(`Tipo: ${item.type}`);
        details.push(`Descripción: ${item.description || 'Sin descripción.'}`);
        if (item.heal) details.push(`Cura HP: ${item.heal}`);
        if (item.recMp) details.push(`Recupera MP: ${item.recMp}`);
        if (item.levelUp) details.push('Efecto: Sube un nivel.');
        if (item.statusRecovery) details.push('Efecto: Recupera estado anómalo.');
        if (item.buffAtt) details.push(`Buff ataque: +${item.buffAtt}`);
        if (item.buffDef) details.push(`Buff defensa: +${item.buffDef}`);
        if (item.buffSpd) details.push(`Buff velocidad: +${item.buffSpd}`);
        if (item.buffLck) details.push(`Buff suerte: +${item.buffLck}`);

        this.detailBox.setText(details.join('\n'));

        if (item.type === 'consumable') {
            const canUse = this.gm.canUseItemOutsideBattle(item);
            if (canUse) {
                this.actionButton.setText('USAR OBJETO');
                this.actionButton.setStyle({ fill: '#00ff00' });
            } else {
                this.actionButton.setText('NO USABLE FUERA DE BATALLA');
                this.actionButton.setStyle({ fill: '#ff5555' });
            }
        } else if (item.type === 'equipment') {
            this.actionButton.setText('EQUIPAMIENTO (GESTIONAR EN ESTRATEGIA)');
            this.actionButton.setStyle({ fill: '#cccccc' });
        } else if (item.type === 'key') {
            this.actionButton.setText('OBJETO CLAVE (NO USABLE)');
            this.actionButton.setStyle({ fill: '#cccccc' });
        }
    }

    updatePlayerSelection() {
        this.playerButtons.forEach(btn => {
            const isSelected = btn.text === this.selectedPlayer;
            btn.setStyle({ fill: isSelected ? '#ffff00' : '#ffffff' });
        });
    }

    onActionButton() {
        if (!this.selectedItem) {
            this.updateStatusText('Selecciona un item primero.');
            return;
        }

        if (this.selectedItem.type !== 'consumable') {
            this.updateStatusText('Solo consumibles se pueden usar en esta escena.');
            return;
        }

        if (!this.gm.canUseItemOutsideBattle(this.selectedItem)) {
            this.updateStatusText('Este consumible no puede usarse fuera de batalla.');
            return;
        }

        if (!this.selectedPlayer) {
            this.updateStatusText('Selecciona un personaje para aplicar el objeto.');
            return;
        }

        const target = this.gm.playerStats[this.selectedPlayer];
        if (!target) {
            this.updateStatusText('Personaje no encontrado.');
            return;
        }

        const item = this.selectedItem;
        const effects = [];

        if (item.heal) {
            this.gm.healPlayer(this.selectedPlayer, item.heal);
            effects.push(`HP +${item.heal}`);
        }
        if (item.recMp) {
            target.mp = Math.min(target.maxMp, target.mp + item.recMp);
            effects.push(`MP +${item.recMp}`);
        }
        if (item.statusRecovery) {
            effects.push('Estado anómalo curado');
        }
        if (item.levelUp) {
            this.gm.levelUp(this.selectedPlayer);
            effects.push('Sube un nivel');
        }

        if (!this.gm.useItem(item.id)) {
            this.updateStatusText('No se pudo consumir el objeto.');
            return;
        }

        this.updateStatusText(`Usaste ${item.name} en ${this.selectedPlayer}. ${effects.join(', ')}`);
        this.refreshView();
    }

    updateStatusText(message) {
        this.statusText.setText(message);
    }
}
