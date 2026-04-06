import Phaser from 'phaser'

/**
 * Clase que representa una puerta lógica OR.
 */
export default class OrGate extends Phaser.GameObjects.Sprite {
    /**
     * Constructor de la puerta OR
     * @param {Phaser.Scene} scene Escena a la que pertenece
     * @param {number} x Coordenada x
     * @param {number} y Coordenada y
     */
    constructor(scene, x, y) {
        super(scene, x, y, 'or_gate');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);
        this.inputA = false;
        this.inputB = false;
        this.output = false;
    }

    /**
     * Actualiza el estado de la salida basado en las entradas
     */
    updateLogic() {
        this.output = this.inputA || this.inputB;
        return this.output;
    }
}
