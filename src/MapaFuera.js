import Player from './personajes/player.js';
import Phaser from 'phaser';
import GameManager from './manager.js';

/**
 * Escena del mapa exterior (mapaFuera).
 * El jugador llega aquí al salir del camino en el mapaDePrueba.
 * @extends Phaser.Scene
 */
export default class MapaFuera extends Phaser.Scene {
    constructor() {
        super({ key: 'MapaFuera' });
    }

    preload() {
        // Los assets ya se han cargado en Boot
    }

    /**
     * @param {{ spawnX?: number, spawnY?: number }} data  Datos opcionales de spawn
     */
    create(data) {
        const map = this.make.tilemap({ key: 'outdoorMap', tileWidth: 32, tileHeight: 32 });
        const tileset = map.addTilesetImage('tilesetexterior', 'tileset');

        const fondoLayer = map.createLayer('fondo', tileset, 0, 0);
        const facultadLayer = map.createLayer('facultad', tileset, 0, 0);
        const decoracionLayer = map.createLayer('decoracion', tileset, 0, 0);
        // 'bebidas' omitida: contiene GIDs de tilesets externos no cargados en el proyecto

        facultadLayer.setCollisionByProperty({ collides: true });
        decoracionLayer.setCollisionByProperty({ collides: true });

        // --- Jugador ---
        const savedPos = GameManager.getInstance().getPlayerPosition();
        
        let spawnX, spawnY;
        if (savedPos) {
            spawnX = savedPos.x;
            spawnY = savedPos.y;
        } else {
            // Si venimos de la transición (level3) se usa data.spawnX/Y
            spawnX = (data && data.spawnX !== undefined) ? data.spawnX : map.widthInPixels / 2;
            spawnY = (data && data.spawnY !== undefined) ? data.spawnY : 80;
        }

        this.player = new Player(this, spawnX, spawnY);

        // Restaurar dirección si existía
        if (savedPos && savedPos.direction) {
            this.player.setDirection(savedPos.direction);
        }

        // Limpiamos la posición para que no se use de nuevo si cambiamos de nivel después
        if (savedPos) GameManager.getInstance().clearPlayerPosition();

        this.physics.add.collider(this.player, facultadLayer);
        this.physics.add.collider(this.player, decoracionLayer);

        this.dialogueManager = new DialogueManager(this);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.dialogueManager && this.dialogueManager.dialogueBox.visible) return;
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });
    }

    showDialogue(message, nombre = '', onFinish = null) {
        if (this.dialogueManager) {
            this.dialogueManager.showDialogue(message, nombre, onFinish);
        }
    }

    update(t, dt) {
        const sec = this.registry.get('horasJuego') || 0;
        this.registry.set('horasJuego', sec + dt / 1000);

        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
    }
}
