import Phaser from 'phaser';
import GameManager from '../core/manager.js';
import { ITEM_TYPES } from './item_types.js';

/**
 * Clase que representa un objeto tirado en el suelo que se puede recoger.
 */
export default class Item extends Phaser.GameObjects.Sprite {
    /**
     * @param {Phaser.Scene} scene Escena a la que pertenece
     * @param {Player} player Referencia al jugador para detectar interacción
     * @param {number} x Coordenada X
     * @param {number} y Coordenada Y
     * @param {string} itemId ID del tipo de objeto (de ITEM_TYPES)
     * @param {number} quantity Cantidad a recoger
     */
    constructor(scene, player, x, y, itemId, quantity = 1) {
        const typeData = ITEM_TYPES[itemId];

        // Todos los objetos en el mapa usan la misma textura de mochila
        super(scene, x, y, 'base');

        this.scene = scene;
        this.player = player;
        this.itemId = itemId;
        this.quantity = quantity;
        this.itemData = typeData;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true); // Estático
        this.scene.physics.add.collider(this, this.player);

    }

    preUpdate(t, dt) {
        super.preUpdate(t, dt);
        if (this.player && this.visible) {
            this.player.isinteractuable(this);
        }
    }

    /**
     * Al interactuar, el objeto se añade al inventario y se muestra un mensaje.
     */
    interact() {
        if (!this.itemData) return;

        // Añadir al inventario a través del manager
        GameManager.getInstance().addItem(this.itemData, this.quantity);

        // Mostrar mensaje en la UI de diálogos
        const message = `¡Has obtenido ${this.quantity > 1 ? this.quantity + ' ' : ''}${this.itemData.name}!`;
        if (this.scene.showDialogue) {
            this.scene.showDialogue(message);
        }

        // El objeto desaparece del suelo
        this.destroy();
    }
}
