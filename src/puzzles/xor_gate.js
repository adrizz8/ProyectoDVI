import Phaser from 'phaser'

/**
 * Clase que representa una puerta lógica XOR.
 */
export default class XorGate extends Phaser.GameObjects.Sprite {
    /**
     * Constructor de la puerta XOR
     * @param {Phaser.Scene} scene Escena a la que pertenece
     * @param {number} x Coordenada x
     * @param {number} y Coordenada y
     */
    constructor(scene, x, y, player) {
        super(scene, x, y, 'xor_gate');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);

        if (player) {
            this.scene.physics.add.collider(this, player);
        }

        this.inputA = false;
        this.inputB = false;
        this.output = false;
    }

    /**
     * Actualiza el estado de la salida basado en las entradas
     */
    updateLogic() {
        this.output = (this.inputA || this.inputB) && !(this.inputA && this.inputB);
        return this.output;
    }
}
