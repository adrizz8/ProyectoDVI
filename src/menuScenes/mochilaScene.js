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
        this.players =  this.gm.ActualPlayers;
        this.selectedPlayer = null;
        this.playerSelectionContainer=null;

        this.add.rectangle(608, 320, 1216, 640, 0x0a0a0f, 0.95);
        this.add.text(608, 25, 'MOCHILA', {
            fontFamily: 'Orbitron', fontSize: '48px', fill: '#f1c40f', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 4, stroke: true, fill: true }
        }).setOrigin(0.5, 0);

        this.add.text(80, 70, 'Categorías:', {
            fontFamily: 'Pixelify Sans', fontSize: '22px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3
        });

        this.tabs = {
            consumable: this.add.text(80, 110, 'SUMINISTROS', { fontFamily: 'Orbitron', fontSize: '20px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setInteractive({ useHandCursor: true }),
            equipment: this.add.text(260, 110, 'MATERIAL', { fontFamily: 'Orbitron', fontSize: '20px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setInteractive({ useHandCursor: true }),
            key: this.add.text(420, 110, 'TRÁMITES', { fontFamily: 'Orbitron', fontSize: '20px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setInteractive({ useHandCursor: true })
        };

        Object.keys(this.tabs).forEach(tab => {
            this.tabs[tab].on('pointerdown', () => {
                this.selectedTab = tab;
                this.selectedItem = null;
                this.refreshView();
                this.resetPlayer();
            });
        });


        this.itemsContainer = this.add.container(80, 150);
        this.itemTextList = [];

        for (let i = 0; i < 50; i++) { 
            const itemText = this.add.text(0, 20 + i * 40, '', {
                fontFamily: 'Outfit',
                fontSize: '18px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }).setInteractive({ useHandCursor: true });

            itemText.on('pointerdown', () => this.selectItem(i));

            this.itemsContainer.add(itemText);
            this.itemTextList.push(itemText);      
        }
        const maskShape = this.add.rectangle(80, 150, 500, 380, 0x000000)
            .setOrigin(0)
            .setAlpha(0);  

        const mask = maskShape.createGeometryMask();
        this.itemsContainer.setMask(mask);

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
             this.itemsContainer.y -= deltaY * 0.5;

            const contentHeight =20+ this.itemTextList.length * 40;
            const viewHeight = 380 ;

            const maxY = 150;
            const minY = 150 + Math.min(0, viewHeight - contentHeight);

            this.itemsContainer.y = Phaser.Math.Clamp(this.itemsContainer.y, minY, maxY);
        });


        this.playerSelectionContainer = this.add.container(0, 0);

        const title = this.add.text(80, 530, 'Selecciona personaje:', {
            fontFamily: 'Pixelify Sans', fontSize: '18px', fill: '#ffffff',
            stroke: '#000000', strokeThickness: 3 });
        this.playerSelectionContainer.add(title);

        this.playerButtons = [];

        this.players.forEach((name, index) => {
            const btn = this.add.text(80 + index * 180, 560, name, {
                fontFamily: 'Pixelify Sans', fontSize: '18px', fill: '#ffffff',
                stroke: '#000000', strokeThickness: 3 })
                .setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                this.selectedPlayer = name;
                this.updatePlayerSelection();
                this.updateStatusText(`${name} seleccionado para uso de objetos.`);
            });

            this.playerButtons.push(btn);
            this.playerSelectionContainer.add(btn);
        });

        this.resetPlayer();

        this.detailBox = this.add.text(660, 130, '', {
            fontFamily: 'Pixelify Sans', fontSize: '18px', fill: '#ffffff', wordWrap: { width: 460 }, stroke: '#000000', strokeThickness: 3
        });

        this.actionButton = this.add.text(660, 460, 'USAR OBJETO', {
            fontFamily: 'Pixelify Sans', fontSize: '24px', fill: '#00ff00', stroke: '#000000', strokeThickness: 3
        }).setInteractive({ useHandCursor: true });
        this.actionButton.on('pointerdown', () => this.onActionButton());

        this.statusText = this.add.text(660, 520, '', {
            fontFamily: 'Pixelify Sans', fontSize: '18px', fill: '#ffffff', wordWrap: { width: 460 }, stroke: '#000000', strokeThickness: 2
        });

        this.add.text(608, 600, 'Presiona ESPACIO o ESC para volver', {
            fontFamily: 'Pixelify Sans', fontSize: '16px', fill: '#cccccc'
        }).setOrigin(0.5, 0);

        this.input.keyboard.on('keydown-ESC', () => this.closeScene());
        this.input.keyboard.on('keydown-SPACE', () => this.closeScene());
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) this.closeScene();
        });

        this.refreshView();
    }

    closeScene() {
        this.scene.start('MenuPrincipal');
        this.scene.bringToTop('MenuPrincipal');
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
            this.renderItems();
            this.updateStatusText(`${item.name} seleccionado.`);
        }
    }

    renderItems() {
        const items = this.gm.getItemsByType(this.selectedTab);
        for (let i = 0; i < this.itemTextList.length; i++) {
            if (i < items.length) {
                const item = items[i];

                if(this.selectedItem &&item===this.selectedItem){
                    this.itemTextList[i].setText(`${item.name} x${item.quantity}`);
                    this.itemTextList[i].setColor('#ffff00');
                    this.itemTextList[i].setVisible(true);
                    this.renderSelectedItem();
                }else{
                    this.itemTextList[i].setText(`${item.name} x${item.quantity}`);
                    this.itemTextList[i].setColor('#cccccc');
                    this.itemTextList[i].setVisible(true);
                }
            } else {
                this.itemTextList[i].setText('');
                this.itemTextList[i].setVisible(false);
            }
        }
        if (!items.length) {
            this.itemTextList[0].setText('No hay items en esta categoría.');
            this.itemTextList[0].setVisible(true);
        }

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
        details.push(`>> ${item.name.toUpperCase()} <<`);
        details.push(`---------------------------`);
        details.push(`Descripción: ${item.description || 'Sin descripción.'}`);
        details.push(`Cantidad: ${item.quantity}`);
        if (item.heal) details.push(`Restaura Energía: +${item.heal} HP`);
        if (item.recMp) details.push(`Restaura Concentración: +${item.recMp} MP`);
        if (item.levelUp) details.push('Efecto: Sube un nivel académico.');
        if (item.statusRecovery) details.push('Efecto: Elimina estados de estrés.');
        if (item.buffAtt) details.push(`Potencia: +${item.buffAtt}`);
        if (item.buffDef) details.push(`Defensa: +${item.buffDef}`);
        if (item.buffSpd) details.push(`Agilidad: +${item.buffSpd}`);
        if (item.buffLck) details.push(`Suerte: +${item.buffLck}`);

        this.detailBox.setText(details.join('\n\n'));

        if (item.type === 'consumable') {
            const canUse = this.gm.canUseItemOutsideBattle(item);
            if (canUse) {
                this.actionButton.setText('USAR OBJETO');
                this.actionButton.setStyle({ fill: '#00ff00' });
                this.playerSelectionContainer.setVisible(true);
            } else {
                this.actionButton.setText('NO USABLE FUERA DE BATALLA');
                this.actionButton.setStyle({ fill: '#ff5555' });
                this.resetPlayer();

            }
        } else if (item.type === 'equipment') {
            this.actionButton.setText('EQUIPAMIENTO (GESTIONAR EN ESTRATEGIA)');
            this.actionButton.setStyle({ fill: '#cccccc' });
            this.resetPlayer();
        } else if (item.type === 'key') {
            this.actionButton.setText('OBJETO CLAVE (NO USABLE)');
            this.actionButton.setStyle({ fill: '#cccccc' });
            this.resetPlayer();
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

    resetPlayer(){
        this.playerSelectionContainer.setVisible(false);
        this.selectedPlayer = null;
        this.updatePlayerSelection();
    }


}
