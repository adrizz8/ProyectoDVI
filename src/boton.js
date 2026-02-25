import Phaser from 'phaser'

/**
 * Clase que representa un botón lógico interactivo.
 * Actúa como fuente de señal (input) para el circuito.
 */
export default class Boton extends Phaser.GameObjects.Sprite {
    /**
     * Constructor del Botón
     * @param {Phaser.Scene} scene Escena a la que pertenece
     * @param {Player} player Referencia al jugador
     * @param {number} x Coordenada x
     * @param {number} y Coordenada y
     */
    constructor(scene, player, x, y) {
        super(scene, x, y, 'boton');
        this.player = player;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);

        this.output = false; // Estado inicial apagado
        this.setTint(0x888888); // Gris para apagado
        this.setDisplaySize(48, 48);
        this.normalDisplaySize = 48;
    }

    /**
     * Lógica de actualización para detectar si el jugador está cerca y pulsa la tecla de interacción
     */
    preUpdate(t, dt) {
        super.preUpdate(t, dt);

        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.x, this.y);
        const threshold = 60;

        if (distance < threshold) {
            this.setDisplaySize(this.normalDisplaySize * 1.2, this.normalDisplaySize * 1.2);

            if (Phaser.Input.Keyboard.JustDown(this.player.interactKey)) {
                this.toggle();
            }
        } else {
            this.setDisplaySize(this.normalDisplaySize, this.normalDisplaySize);
        }
    }

    /**
     * Cambia el estado del botón y actualiza su color
     */
    toggle() {
        this.output = !this.output;

        if (this.output) {
            this.setTint(0x00ff00); // Verde brillante para encendido
        } else {
            this.setTint(0x888888); // Gris para apagado
        }
    }

    /**
     * Método para que coincida con la interfaz de las gates si fuera necesario,
     * aunque en el botón el estado cambia por interacción, no por lógica de entrada.
     */
    updateLogic() {
        return this.output;
    }
}
