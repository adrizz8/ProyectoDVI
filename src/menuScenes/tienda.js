import GameManager from '../manager.js';
import { ITEM_TYPES } from '../item/item_types.js';

export default class TiendaUI {
    constructor(scene, onCerrar) {
        this.scene = scene;
        this.gm = GameManager.getInstance();
        this.onCerrar = onCerrar;

        // Congelamos al jugador al abrir la tienda
        if (this.scene.player && this.scene.player.freeze) {
            this.scene.player.freeze();
            this.scene._shopOpen = true; // Marcamos que la tienda está abierta
        }

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
        const title = this.scene.add.text(panelX + panelW / 2, 35, 'TIENDA', {
            fontSize: '28px', fill: '#f5d442', fontFamily: 'Orbitron', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);

        this.dineroText = this.scene.add.text(panelX + panelW / 2, 75, `${this.gm.getDinero()}€`, {
            fontSize: '24px', fill: '#44ff44', fontFamily: 'Courier', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.container.add([title, this.dineroText]);

        // Artículos a vender
        this.articulos = [
            { id: 'pincho_tortilla_viejo', precio: 25 },
            { id: 'cafe', precio: 50 },
            { id: 'monster', precio: 60 },
            { id: 'pincho_tortilla', precio: 80 },
            { id: 'tinto_verano', precio: 100 },
            { id: 'palmera_chocolate', precio: 100 },
            { id: 'cerveza', precio: 140 },
            { id: 'menu_dia', precio: 400 }
        ];

        let startY = 115;
        let itemHeight = 58;
        let spacing = 62;

        this.articulos.forEach((art, index) => {
            const itemData = ITEM_TYPES[art.id];
            if (!itemData) return;

            const boxY = startY + index * spacing;

            // Botón/Caja envolvente
            const bgRect = this.scene.add.rectangle(panelX + panelW / 2, boxY, panelW - 30, itemHeight, 0x1a1a1a, 1)
                .setStrokeStyle(1, 0x444444).setInteractive();

            // Nombre
            const nameTxt = this.scene.add.text(panelX + 25, boxY - 12, itemData.name, {
                fontSize: '16px', fill: '#f5d442', fontStyle: 'bold', fontFamily: 'Outfit'
            }).setOrigin(0, 0.5);

            // Descripción corta (más pequeña y truncada si es necesario)
            const descTxt = this.scene.add.text(panelX + 25, boxY + 10, itemData.description, {
                fontSize: '11px', fill: '#bbbbbb', fontFamily: 'Outfit', wordWrap: { width: panelW - 100 }
            }).setOrigin(0, 0.5);

            // Precio
            const btnComprar = this.scene.add.text(panelX + panelW - 25, boxY, `${art.precio}€`, {
                fontSize: '18px', fill: '#ffffff', fontStyle: 'bold', fontFamily: 'Orbitron'
            }).setOrigin(1, 0.5);

            this.container.add([bgRect, nameTxt, descTxt, btnComprar]);

            // Funcionalidades del botón
            bgRect.on('pointerover', () => {
                bgRect.setFillStyle(0x333333);
                bgRect.setStrokeStyle(1, 0xf5d442);
                nameTxt.setStyle({ fill: '#ffffff' });
                btnComprar.setStyle({ fill: '#f5d442' });
            });
            bgRect.on('pointerout', () => {
                bgRect.setFillStyle(0x1a1a1a);
                bgRect.setStrokeStyle(1, 0x444444);
                nameTxt.setStyle({ fill: '#f5d442' });
                btnComprar.setStyle({ fill: '#ffffff' });
            });
            bgRect.on('pointerdown', () => this.pedirConfirmacion(art, itemData));
        });

        // Feedback Text (Oculto al inicio)
        this.feedbackText = this.scene.add.text(panelX + panelW / 2, 570, '', {
            fontSize: '16px', fill: '#ffffff', fontStyle: 'bold', fontFamily: 'Outfit'
        }).setOrigin(0.5).setAlpha(0);

        this.container.add([this.feedbackText]);

        // Botón salir
        const btnSalir = this.scene.add.text(panelX + panelW / 2, 610, 'CERRAR', {
            fontSize: '20px', fill: '#aaaaaa', fontFamily: 'Orbitron'
        }).setOrigin(0.5).setInteractive();

        btnSalir.on('pointerover', () => btnSalir.setStyle({ fill: '#ff4444' }));
        btnSalir.on('pointerout', () => btnSalir.setStyle({ fill: '#aaaaaa' }));
        btnSalir.on('pointerdown', () => {
            this.cerrar();
        });

        this.container.add([btnSalir]);

        // Tecla escape, espacio o CLICK DERECHO para salir
        this.spaceListener = () => { if (this.container.active) this.cerrar(); };
        this.escListener = () => { if (this.container.active) this.cerrar(); };
        this.rightClickListener = (pointer) => { if (pointer.rightButtonDown() && this.container.active) this.cerrar(); };

        this.scene.input.keyboard.on('keydown-SPACE', this.spaceListener);
        this.scene.input.keyboard.on('keydown-ESC', this.escListener);
        this.scene.input.on('pointerdown', this.rightClickListener);
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
        this.scene.input.off('pointerdown', this.rightClickListener);
        this.container.destroy();
        this.scene._shopOpen = false; // Marcamos que la tienda se ha cerrado
        if (this.onCerrar) this.onCerrar();
    }
}
