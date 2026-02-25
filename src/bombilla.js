import Phaser from 'phaser'

/**
 * Clase que representa una bombilla (salida final del circuito).
 * Cambia su brillo en función de la señal de entrada.
 */
export default class Bombilla extends Phaser.GameObjects.Sprite {
    /**
     * Constructor de la Bombilla
     * @param {Phaser.Scene} scene Escena a la que pertenece
     * @param {number} x Coordenada x
     * @param {number} y Coordenada y
     */
    constructor(scene, x, y) {
        super(scene, x, y, 'bombilla');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);

        this.input = false; // Señal de entrada
        this.setTint(0x444444); // Gris oscuro inicial (apagada)
        this.setDisplaySize(64, 64);
        this.normalDisplaySize = 64;
    }

    /**
     * Actualiza el estado visual de la bombilla según la entrada
     */
    updateLogic() {
        if (this.input) {
            this.setTint(0xfffb00); // Amarillo brillante (encendida)
        } else {
            this.setTint(0x444444); // Gris oscuro
        }
    }
}
