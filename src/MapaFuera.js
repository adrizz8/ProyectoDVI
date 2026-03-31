import Player from './personajes/player.js';
import Phaser from 'phaser';

/**
 * Escena del mapa exterior.
 * @extends Phaser.Scene
 */
export default class MapaFuera extends Phaser.Scene {
    constructor() {
        super({ key: 'outdoorMap' });
    }

    create(data) {
        // Carga del mapa y tilesets
        const map = this.make.tilemap({ key: 'outdoorMap' });
        const tileset1 = map.addTilesetImage('tilesetexterior', 'tileset');
        // El JSON de mapaFuera tiene dos entradas para el mismo tileset con diferentes GIDs
        const tilesets = [tileset1];

        // Capas del mapa
        const fondo = map.createLayer('fondo', tilesets, 0, 0);
        const facultad = map.createLayer('facultad', tilesets, 0, 0);
        const decoracion = map.createLayer('decoracion', tilesets, 0, 0);
        const bebidas = map.createLayer('bebidas', tilesets, 0, 0);

        const colisiones = map.createLayer('colisiones', tilesets, 0, 0);

        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);

        // Posición de spawn (por defecto abajo a la derecha si no viene en data)
        const spawnX = data.spawnX || 950;
        const spawnY = data.spawnY || 950;

        this.player = new Player(this, spawnX, spawnY);

        // Colisiones del jugador con la capa dedicada
        this.physics.add.collider(this.player, colisiones);

        // Zonas de transición a Cafetería
        // La facultad está en la parte superior. Puerta aproximada en X=350, Y=220
        const doorZone = this.add.zone(350, 220, 100, 60);

        this.physics.world.enable(doorZone, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(this.player, doorZone, () => {
            // Spawn en la cafetería (cerca de la puerta)
            this.scene.start('cafeteria', { spawnX: 300, spawnY: 200 });
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
