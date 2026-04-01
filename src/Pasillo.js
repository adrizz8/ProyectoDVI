import Player from './personajes/player.js';
import Phaser from 'phaser';
import trigger from './trigger.js';

/**
 * Escena del Pasillo.
 * Accesible desde la cafetería por la puerta de la derecha.
 * @extends Phaser.Scene
 */
export default class Pasillo extends Phaser.Scene {
    constructor() {
        super({ key: 'pasillo' });
    }

    create(data = {}) {
        const map = this.make.tilemap({ key: 'pasillo' });

        // Puntos de entrada al pasillo
        var entradas = new Map();
        // Entrada desde la cafetería (puerta derecha): aparece en el lado izquierdo del pasillo
        entradas.set('desde_cafeteria', { x: 96, y: 300, direccion: 'right' });

        this.physics.world.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        );

        // Tileset utilizado en pasillo.json
        const tilesinterior = map.addTilesetImage('tilesinterior', 'tilesinterior');
        const allTilesets = [tilesinterior];

        // Capas del mapa (orden igual que en Tiled)
        // Nota: 'colisones' es el nombre exacto tal como está en el JSON (sin segunda 'i')
        const colisiones = map.createLayer('colisones', allTilesets, 0, 0);
        const fondo = map.createLayer('fondo', allTilesets, 0, 0);
        const pared = map.createLayer('pared', allTilesets, 0, 0);
        const ventana = map.createLayer('ventana', allTilesets, 0, 0);
        const puertasYBanco = map.createLayer('puertas y banco', allTilesets, 0, 0);

        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);

        // Spawn del jugador
        const posi = entradas.get(data.entrada) || entradas.get('desde_cafeteria');
        const spawnX = posi.x;
        const spawnY = posi.y;
        const direccion = posi.direccion;

        this.player = new Player(this, spawnX, spawnY);
        this.player.setDirection(direccion);

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Colisiones del jugador con la capa dedicada
        this.physics.add.collider(this.player, colisiones);

        // Zona de salida: volver a la cafetería (lado izquierdo del pasillo)
        const salidaCafeteria = this.add.zone(16, map.heightInPixels / 2, 32, map.heightInPixels);
        this.physics.world.enable(salidaCafeteria, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(this.player, salidaCafeteria, () => {
            this.scene.start('cafeteria', { entrada: 'puerta_der' });
        });

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
