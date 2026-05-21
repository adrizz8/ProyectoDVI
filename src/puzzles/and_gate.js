import Phaser from 'phaser'

/**
 * Clase que representa una puerta lógica AND.
 */
export default class AndGate extends Phaser.GameObjects.Sprite {
    /**
     * Constructor de la puerta AND
     * @param {Phaser.Scene} scene Escena a la que pertenece
     * @param {number} x Coordenada x
     * @param {number} y Coordenada y
     */
    constructor(scene, x, y, player) {
        super(scene, x, y, 'and_gate');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);
        this.setDisplaySize(80, 120);

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
        this.output = this.inputA && this.inputB;
        // Aquí se podría actualizar la animación o color según el estado
        return this.output;
    }
}
