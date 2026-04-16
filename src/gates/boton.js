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
        this.scene.physics.add.collider(this, this.player);

        this.output = false; // Estado inicial apagado
    }

    /**
     * Lógica de actualización para detectar si el jugador está cerca y pulsa la tecla de interacción
     */
    preUpdate(t, dt) {
        super.preUpdate(t, dt);

        this.player.isinteractuable(this);

    }

    /**
     * Cambia el estado del botón y actualiza su color
     */
    interact() {
        this.output = !this.output;

        if (this.output) {
            this.setTint(0x888888); // Gris para apagado
        } else {
            this.setTint(0xffffff); // Blanco para encendido
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
