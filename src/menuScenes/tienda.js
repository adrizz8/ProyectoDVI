import GameManager from '../manager.js';
import { ITEM_TYPES } from '../item/item_types.js';

export default class TiendaUI {
    constructor(scene, onCerrar) {
        this.scene = scene;
        this.gm = GameManager.getInstance();
        this.onCerrar = onCerrar;
        this.container = this.scene.add.container(0, 0).setDepth(1000);

        // Dimensiones del panel a la derecha
        const panelW = 350;
        const panelX = 1216 - panelW; // 866

        // Fondo del panel (oscuro con borde)
        const bg = this.scene.add.rectangle(panelX, 0, panelW, 640, 0x0a0a0a, 0.95).setOrigin(0);
        // Interactivo para que no se clique a través de la caja
        bg.setInteractive();

        const border = this.scene.add.rectangle(panelX, 0, panelW, 640, 0x0a0a0a, 0).setOrigin(0).setStrokeStyle(4, 0xf0c040);
        
        this.container.add([bg, border]);

        // Título de la tienda
        const title = this.scene.add.text(panelX + panelW / 2, 40, 'TIENDA', {
            fontSize: '32px', fill: '#f5d442', fontFamily: 'Distant Galaxy', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        this.dineroText = this.scene.add.text(panelX + panelW / 2, 90, `Dinero: ${this.gm.getDinero()}€`, {
            fontSize: '22px', fill: '#ffffff', fontFamily: 'Courier', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.container.add([title, this.dineroText]);

        // Artículos a vender
        this.articulos = [
            { id: 'pocion', precio: 50 },
            { id: 'eter', precio: 100 },
            { id: 'pincho_tortilla', precio: 30 }
        ];

        let startY = 160;
        this.articulos.forEach((art, index) => {
            const itemData = ITEM_TYPES[art.id];
            if (!itemData) return;

            const boxY = startY + index * 105;
            
            // Botón/Caja envolvente
            const bgRect = this.scene.add.rectangle(panelX + panelW / 2, boxY, panelW - 40, 90, 0x222222, 1)
                .setStrokeStyle(2, 0x555555).setInteractive();

            // Nombre
            const nameTxt = this.scene.add.text(panelX + 30, boxY - 25, itemData.name, { 
                fontSize: '20px', fill: '#ffffff', fontStyle: 'bold' 
            }).setOrigin(0, 0.5);
            
            // Descripción corta
            const descTxt = this.scene.add.text(panelX + 30, boxY, itemData.description, { 
                fontSize: '12px', fill: '#aaaaaa', wordWrap: { width: panelW - 60 } 
            }).setOrigin(0, 0.5);

            // Precio
            const btnComprar = this.scene.add.text(panelX + panelW - 30, boxY + 25, `${art.precio}€`, { 
                fontSize: '18px', fill: '#f5d442', fontStyle: 'bold' 
            }).setOrigin(1, 0.5);

            this.container.add([bgRect, nameTxt, descTxt, btnComprar]);

            // Funcionalidades del botón
            bgRect.on('pointerover', () => { bgRect.setFillStyle(0x444444); bgRect.setStrokeStyle(2, 0xf5d442); btnComprar.setScale(1.1); });
            bgRect.on('pointerout', () => { bgRect.setFillStyle(0x222222); bgRect.setStrokeStyle(2, 0x555555); btnComprar.setScale(1); });
            bgRect.on('pointerdown', () => this.pedirConfirmacion(art, itemData));
        });

        // Feedback Text (Oculto al inicio)
        this.feedbackText = this.scene.add.text(panelX + panelW / 2, startY + this.articulos.length * 105, '', {
            fontSize: '18px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        this.container.add([this.feedbackText]);

        // Botón salir
        const btnSalir = this.scene.add.text(panelX + panelW / 2, 580, 'SALIR', {
            fontSize: '26px', fill: '#ffffff', fontFamily: 'Distant Galaxy', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setInteractive();

        btnSalir.on('pointerover', () => btnSalir.setStyle({ fill: '#ff4444' }));
        btnSalir.on('pointerout', () => btnSalir.setStyle({ fill: '#ffffff' }));
        btnSalir.on('pointerdown', () => {
            this.cerrar();
        });

        this.container.add([btnSalir]);

        // Tecla escape o espacio para salir
        this.spaceListener = () => { if(this.container.active) this.cerrar(); };
        this.escListener = () => { if(this.container.active) this.cerrar(); };
        
        this.scene.input.keyboard.on('keydown-SPACE', this.spaceListener);
        this.scene.input.keyboard.on('keydown-ESC', this.escListener);
    }

    pedirConfirmacion(art, itemData) {
        if (this.confirmContainer) {
            this.confirmContainer.destroy();
        }

        this.confirmContainer = this.scene.add.container(0, 0).setDepth(2000);

        // Bloqueador de clics (cubre toda la pantalla semi-transparente)
        const blocker = this.scene.add.rectangle(0, 0, 1216, 640, 0x000000, 0.5).setOrigin(0).setInteractive();

        // Panel del popup (centrado en la tienda 866 + 350/2 = 1041)
        const popupBg = this.scene.add.rectangle(1041, 320, 320, 200, 0x111122, 1).setStrokeStyle(4, 0xf5d442).setInteractive();

        const text1 = this.scene.add.text(1041, 260, '¿Quieres comprar', { fontSize: '20px', fill: '#ffffff', fontFamily: 'Distant Galaxy' }).setOrigin(0.5);
        const text2 = this.scene.add.text(1041, 290, itemData.name + '?', { fontSize: '22px', fill: '#f5d442', fontStyle: 'bold', fontFamily: 'Distant Galaxy' }).setOrigin(0.5);

        // Botón SÍ
        const bgSi = this.scene.add.rectangle(971, 360, 110, 45, 0x226622, 1).setStrokeStyle(2, 0x44ff44).setInteractive();
        const textSi = this.scene.add.text(971, 360, 'SÍ', { fontSize: '22px', fill: '#ffffff', fontStyle: 'bold', fontFamily: 'Distant Galaxy' }).setOrigin(0.5);

        // Botón NO
        const bgNo = this.scene.add.rectangle(1111, 360, 110, 45, 0x882222, 1).setStrokeStyle(2, 0xff4444).setInteractive();
        const textNo = this.scene.add.text(1111, 360, 'NO', { fontSize: '22px', fill: '#ffffff', fontStyle: 'bold', fontFamily: 'Distant Galaxy' }).setOrigin(0.5);

        bgSi.on('pointerover', () => bgSi.setFillStyle(0x338833));
        bgSi.on('pointerout', () => bgSi.setFillStyle(0x226622));
        bgSi.on('pointerdown', () => {
            this.confirmContainer.destroy();
            this.confirmContainer = null;
            this.procesarCompra(art, itemData);
        });

        bgNo.on('pointerover', () => bgNo.setFillStyle(0xaa3333));
        bgNo.on('pointerout', () => bgNo.setFillStyle(0x882222));
        bgNo.on('pointerdown', () => {
            this.confirmContainer.destroy();
            this.confirmContainer = null;
        });

        this.confirmContainer.add([blocker, popupBg, text1, text2, bgSi, textSi, bgNo, textNo]);
    }

    procesarCompra(art, itemData) {
        if (this.gm.gastarDinero(art.precio)) {
            this.gm.addItem(itemData, 1);
            this.dineroText.setText(`Dinero: ${this.gm.getDinero()}€`);
            
            this.showFeedback(`¡Compraste ${itemData.name}!`, '#44ff44');
        } else {
            this.showFeedback('No hay dinero suficiente.', '#ff4444');
        }
    }

    showFeedback(message, color) {
        this.feedbackText.setText(message);
        this.feedbackText.setStyle({ fill: color });
        this.feedbackText.setAlpha(1);

        // Eliminamos tweens anteriores si hay
        if (this.feedbackTween) this.feedbackTween.stop();

        this.feedbackTween = this.scene.tweens.add({
            targets: this.feedbackText,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            delay: 500
        });
    }

    cerrar() {
        // Si hay una ventana de confirmación abierta, la tecla escape/salir solo la cierra a ella
        if (this.confirmContainer) {
            this.confirmContainer.destroy();
            this.confirmContainer = null;
            return;
        }

        this.scene.input.keyboard.off('keydown-SPACE', this.spaceListener);
        this.scene.input.keyboard.off('keydown-ESC', this.escListener);
        this.container.destroy();
        if (this.onCerrar) this.onCerrar();
    }
}
