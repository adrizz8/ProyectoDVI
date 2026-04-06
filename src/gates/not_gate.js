import Phaser from 'phaser'

/**
 * Clase que representa una puerta lógica NOT.
 */
export default class NotGate extends Phaser.GameObjects.Sprite {
    /**
     * Constructor de la puerta NOT
     * @param {Phaser.Scene} scene Escena a la que pertenece
     * @param {number} x Coordenada x
     * @param {number} y Coordenada y
     */
    constructor(scene, x, y) {
        super(scene, x, y, 'not_gate');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);

        this.signalIn = false;
        this.output = true;
    }

    /**
     * Actualiza el estado de la salida basado en la entrada
     */
    updateLogic() {
        this.output = !this.signalIn;
        return this.output;
    }
}
