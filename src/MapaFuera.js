import Player from './player.js';
import Phaser from 'phaser';

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
        // Si venimos desde level3 (transición), el jugador aparece arriba en el centro-derecha del mapa
        // El camino de mapaFuera baja desde la parte superior
        const spawnX = (data && data.spawnX !== undefined) ? data.spawnX : map.widthInPixels / 2;
        const spawnY = (data && data.spawnY !== undefined) ? data.spawnY : 80;
        this.player = new Player(this, spawnX, spawnY);

        this.physics.add.collider(this.player, facultadLayer);
        this.physics.add.collider(this.player, decoracionLayer);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });
    }

    update(t, dt) {
        const sec = this.registry.get('horasJuego') || 0;
        this.registry.set('horasJuego', sec + dt / 1000);

        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
    }
}
