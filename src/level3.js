import Player from './player.js';
import DialogueManager from './dialogueManager.js';
import Phaser from 'phaser';

/**
 * Nivel 3: Escena de exploración con el mapa de tiles (mapa interior/camino).
 * El jugador llega aquí tras resolver el puzzle de circuito lógico en Level2.
 * Al llegar al borde del camino (borde derecho del mapa) se transiciona a MapaFuera.
 * @extends Phaser.Scene
 */
export default class Level3 extends Phaser.Scene {
    constructor() {
        super({ key: 'level3' });
        this._transitionActive = false;
    }

    preload() {
    }

    create() {
        this._transitionActive = false;

        const map = this.make.tilemap({ key: 'mainscene', tileWidth: 32, tileHeight: 32 });
        const tileset = map.addTilesetImage('tilesetexterior', 'tileset');

        const backgroundLayer = map.createLayer('Suelo', tileset, 0, 0);
        const groundLayer = map.createLayer('Arboles', tileset, 0, 0);
        const objectsLayer = map.createLayer('Resto', tileset, 0, 0);

        //backgroundLayer.setCollisionByProperty({ collides: true });
        groundLayer.setCollisionByProperty({ collides: true }); // Solo esta capa tiene colisiones, el resto es decorativo
        objectsLayer.setCollisionByProperty({ collides: true });

        // --- Jugador ---
        this.player = new Player(this, 100, 400);

        // Colisión del jugador con las capas del mapa
        this.physics.add.collider(this.player, groundLayer);
        this.physics.add.collider(this.player, objectsLayer);


        const caminoCentroX = 592;
        const caminoAncho = 160;
        const exitZone = this.add.zone(
            caminoCentroX,
            20,
            caminoAncho,
            40
        );
        this.physics.world.enable(exitZone, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.add.overlap(this.player, exitZone, () => {
            if (!this._transitionActive) {
                this._transitionActive = true;
                this.cameras.main.fade(300, 0, 0, 0, false, (cam, progress) => {
                    if (progress === 1) {
                        // El jugador aparece en la parte superior del mapa exterior
                        this.scene.start('outdoorMap', { spawnX: 512, spawnY: 80 });
                    }
                });
            }
        });

        // --- Cámara ---
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });
    }

    update(t, dt) {
        // actualizamos el contador global
        const sec = this.registry.get('horasJuego') || 0;
        this.registry.set('horasJuego', sec + dt / 1000);

        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
    }
}
