import Phaser from 'phaser';
import GameManager from '../manager.js';
import { ITEM_TYPES } from '../item/item_types.js';

/**
 * Clase que representa un NPC básico en el juego.
 */
export default class NPC extends Phaser.GameObjects.Sprite {
    /**
     * @param {Phaser.Scene} scene Escena a la que pertenece el NPC
     * @param {Player} player Jugador para detectar interacción
     * @param {number} x Coordenada X
     * @param {number} y Coordenada Y
     * @param {string} texture Clave de la textura a utilizar
     * @param {string} message Mensaje que dirá al interactuar
     * @param {Function} onFinish Acción a realizar al cerrar el diálogo
     * @param {string} itemId ID del ítem que da el NPC (opcional)
     * @param {string} name Nombre del NPC (opcional)
     */
    constructor(scene, player, x, y, texture,frame=0, message = null, onFinish = null, itemId = null, name = '') {
        super(scene, x, y, texture);

        this.setFrame(frame); 
        this.player = player;
        this.message = message;
        this.onFinish = onFinish;
        this.itemId = itemId;
        this.name = name; // Guardamos el nombre
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this); // Estático por defecto
        this.body.setImmovable(true);
        this.body.moves = false;

        // Ajustamos la hitbox (por ejemplo, al 60% de ancho y 50% de alto, centrado en los pies)
        this.body.setSize(this.width * 0.6, this.height * 0.4);
        this.body.setOffset(this.width * 0.2, this.height * 0.6);

        if (this.player) {
            this.collider = this.scene.physics.add.collider(this, this.player);
        }
    }

    /**
     * Lógica de actualización para detectar interactuabilidad
     */
    preUpdate(t, dt) {
        super.preUpdate(t, dt);
        if (this.player) {
            this.player.isinteractuable(this);
        }
    }

    /**
     * Reacción al interactuar
     */
    interact() {
        if (this.message != null) {
            this.say(this.message, () => {
                // Si el NPC nos tiene que dar un objeto, se procesa aquí
                this.receiveItem();
                if (this.onFinish) this.onFinish();
            });
        }
    }

    /**
     * Procesa la entrega del objeto si el NPC tiene un itemId asignado
     */
    receiveItem() {
        if (!this.itemId || !ITEM_TYPES[this.itemId]) return;

        const itemData = ITEM_TYPES[this.itemId];

        // Añadir el objeto a la mochila
        GameManager.getInstance().addItem(itemData, 1);

        // Mostrar mensaje de obtención
        const message = `¡Has recibido: ${itemData.name}!`;

        // Pequeño retardo para que la UI se resetee si acaba de cerrarse la anterior
        this.scene.time.delayedCall(300, () => {
            this.say(message);
        });

        // Limpiamos el itemId para que no te lo de infinitas veces
        this.itemId = null;
    }

    /**
     * Método para que el NPC diga algo
     * @param {string} message Mensaje a mostrar
     * @param {Function} onFinish Callback al terminar el mensaje
     */
    say(message, onFinish = null) {
        if (this.scene.showDialogue) {
            this.scene.showDialogue(message, this.name, onFinish);
        }
    }
}
