import Player from './player.js';
import DialogueManager from './dialogueManager.js';
import Phaser from 'phaser';

/**
 * Nivel 3: Escena de exploración con el mapa de tiles.
 * El jugador llega aquí tras resolver el puzzle de circuito lógico en Level2.
 * @extends Phaser.Scene
 */
export default class Level3 extends Phaser.Scene {
    constructor() {
        super({ key: 'level3' });
    }

    preload() {
        // Los assets ya se han cargado en Boot, no es necesario recargarlos
    }

    create() {
        // --- Mapa de tiles ---
        const map = this.make.tilemap({ key: 'mainscene', tileWidth: 32, tileHeight: 32 });
        const tileset = map.addTilesetImage('tilesetexterior', 'tileset');

        const backgroundLayer = map.createLayer('Suelo', tileset, 0, 0);
        const groundLayer = map.createLayer('Arboles', tileset, 0, 0);
        const objectsLayer = map.createLayer('Resto', tileset, 0, 0);

        //backgroundLayer.setCollisionByProperty({ collides: true });
        //groundLayer.setCollisionByProperty({ collides: true });
        objectsLayer.setCollisionByProperty({ collides: true });

        // --- Jugador ---
        this.player = new Player(this, 100, 400);
        this.player.setDepth(1);

        // Colisión del jugador con las capas del mapa
        //this.physics.add.collider(this.player, groundLayer);
        this.physics.add.collider(this.player, objectsLayer);

        // --- Cámara ---
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);


    }

    update(t, dt) {
        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
    }
}
