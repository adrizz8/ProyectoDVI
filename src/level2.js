import Platform from './platform.js';
import Player from './player.js';
import Toy from './toy.js';
import DialogueManager from './dialogueManager.js';
import Phaser from 'phaser';

/**
 * Segundo nivel del juego. 
 * Tiene una disposición de plataformas diferente y un juguete diferente.
 */
export default class Level2 extends Phaser.Scene {
    constructor() {
        super({ key: 'level2' });
    }

    create() {
        // Configuramos el jugador
        this.player = new Player(this, 100, 400);

        // Disposición de plataformas diferente a Level 1
        this.platforms = this.add.group();

        // Plataformas en escalera o zigzag
        new Platform(this, this.player, this.platforms, 200, 350);
        new Platform(this, this.player, this.platforms, 400, 250);
        new Platform(this, this.player, this.platforms, 600, 150);
        new Platform(this, this.player, this.platforms, 800, 250);


        // Canal de diálogo (Centralizado)
        this.dialogueManager = new DialogueManager(this);

        // Un juguete interactivo con un mensaje distinto
        new Toy(this, this.player, 800, 70, "¡Bienvenido al Nivel 2! Has encontrado el juguete secreto.");
    }

    /**
     * Muestra un mensaje en pantalla a través del manager
     */
    showDialogue(message) {
        this.dialogueManager.showDialogue(message);
    }
}
