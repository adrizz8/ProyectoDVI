import Player from './personajes/player.js';
import Phaser from 'phaser';

/**
 * Escena de la Cafetería.
 * @extends Phaser.Scene
 */
export default class Cafeteria extends Phaser.Scene {
    constructor() {
        super({ key: 'cafeteria' });
    }

    create(data = {}) {
        // Carga del mapa y tilesets
        const map = this.make.tilemap({ key: 'cafeteria' });

        // Tilesets (basados en cafeteria.json)
        const tilesInterior2 = map.addTilesetImage('tilesInterior2', 'tilesInterior2');
        const tilesInterior = map.addTilesetImage('tilesinterior', 'tilesinterior');
        const tilesCafeteria = map.addTilesetImage('tilesCafeteria', 'tilesCafeteria');
        const tilesExterior = map.addTilesetImage('tilesetexterior', 'tilesetexterior');

        const allTilesets = [tilesInterior2, tilesInterior, tilesCafeteria, tilesExterior];

        // Capas del mapa (orden de abajo a arriba, igual que en Tiled)
        const fondo = map.createLayer('fondo', allTilesets, 0, 0);
        const pared = map.createLayer('pared', allTilesets, 0, 0);
        const puerta = map.createLayer('puerta', allTilesets, 0, 0);
        const barra = map.createLayer('barra', allTilesets, 0, 0);
        const sillas = map.createLayer('sillas', allTilesets, 0, 0);
        const mesas = map.createLayer('mesas', allTilesets, 0, 0);
        const decoracion = map.createLayer('decoracion', allTilesets, 0, 0);
        const sillas2 = map.createLayer('sillas2', allTilesets, 0, 0);

        const colisiones = map.createLayer('colisiones', allTilesets, 0, 0);

        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);

        // Posición de spawn (por defecto cerca de la puerta arriba a la izquierda)
        const spawnX = data.spawnX !== undefined ? data.spawnX : 150;
        const spawnY = data.spawnY !== undefined ? data.spawnY : 250;

        this.player = new Player(this, spawnX, spawnY);

        // Colisiones del jugador con la capa dedicada
        this.physics.add.collider(this.player, colisiones);

        // Transición a MapaFuera (usando la zona de la puerta visual)
        const exitZone = this.add.zone(150, 100, 200, 100);
        this.physics.world.enable(exitZone, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(this.player, exitZone, () => {
            // Spawn en el mapa exterior (delante del edificio de la facultad)
            this.scene.start('outdoorMap', { spawnX: 350, spawnY: 280 });
        });

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Tecla de menú (Espacio)
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });
    }

    update(t, dt) {
        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
    }
}
