import Phaser from 'phaser'
import Player from './personajes/player.js';

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
    constructor(scene, player, x, y, message = "...") {
        super(scene, x, y, 'bombilla');

        this.player = player;
        this.message = message;
        this.signalIn = false; // Señal de entrada
        this.setTint(0x444444); // Gris oscuro inicial (apagada)
        this.setDisplaySize(64, 64);
        this.normalDisplaySize = 64;

        // Una sola vez: registrar en escena y física
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true); // true = estático
        this.scene.physics.add.collider(this, player);
    }

    /**
     * Actualiza el estado visual de la bombilla según la entrada
     */
    updateLogic() {
        if (this.signalIn) {
            this.setTint(0xfffb00); // Amarillo brillante (encendida)
        } else {
            this.setTint(0x444444); // Gris oscuro
        }
    }

    preUpdate(t, dt) {
        super.preUpdate(t, dt);
        this.player.isinteractuable(this);
    }

    interact() {
        // this.scene      = la escena Phaser (Phaser.Scene)
        // this.scene.scene = el SceneManager (tiene .start())
        this.scene.scene.start('battle_scene', {
            playerName: 'Jugador',
            playerHP: 100,
            playerMaxHp: 100,
            playerDamage: 25,
            enemyName: 'Bombilla',
            enemyHP: 60,
            enemyMaxHp: 60,
            enemyDamage: 10,
            originScene: this.scene.scene.key,
        });
    }

}
