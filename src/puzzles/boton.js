import Phaser from 'phaser'
import GameManager from '../core/manager.js';

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
     * @param {string} name Nombre del botón (para persistencia)
     */
    constructor(scene, player, x, y, name = 'boton_default') {
        super(scene, x, y, 'boton');
        this.player = player;
        this.name = name;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);
        this.scene.physics.add.collider(this, this.player);

        this.output = false; // Estado inicial apagado
        this.updateVisuals();
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
        this.updateVisuals();
        
        // Persistencia
        GameManager.getInstance().setButtonState(this.scene.scene.key, this.name, this.output);
    }

    updateVisuals() {
        if (this.output) {
            this.setTint(0x888888); // Gris para "activado" (siguiendo lógica previa)
        } else {
            this.setTint(0xffffff); // Blanco para "apagado"
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
