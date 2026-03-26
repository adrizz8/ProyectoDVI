import Phaser from 'phaser';

/**
 * Clase que representa un NPC básico en el juego.
 */
export default class NPC extends Phaser.GameObjects.Sprite {
    /**
     * @param {Phaser.Scene} scene Escena a la que pertenece el NPC
     * @param {number} x Coordenada X
     * @param {number} y Coordenada Y
     * @param {string} texture Clave de la textura a utilizar
     */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true); // Estático por defecto
    }

    /**
     * Método para que el NPC diga algo (opcional)
     * @param {string} message Mensaje a mostrar
     */
    say(message) {
        if (this.scene.showDialogue) {
            this.scene.showDialogue(message);
        }
    }
}
