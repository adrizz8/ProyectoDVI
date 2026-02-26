import Phaser from 'phaser'
import Player from './player';
import scene from './battleScene/battle_scene.js';

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
     * @param {Player} player Jugador del juego (para detectar interacciones)
     * @param {string} message Mensaje que dirá la bombilla al interactuar
     */
    constructor(scene,player,x,y, message = "...") {
        super(scene, x, y, 'bombilla');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);

        this.player = player;
        this.message = message; 
        this.input = false; // Señal de entrada
        this.setTint(0x444444); // Gris oscuro inicial (apagada)
        this.setDisplaySize(64, 64);
        this.normalDisplaySize = 64;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);
        this.scene.physics.add.collider(this, player);
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

    preUpdate(t, dt) {
        super.preUpdate(t, dt); 
        this.player.isinteractuable(this);
    }

    interact(){
        if (this.scene.showDialogue) {
            this.scene.showDialogue(this.message);
            this.scene.start('battle_scene'); // Indicamos que se ha interactuado con la bombilla para iniciar la siguiente escena
        }
    }

}
