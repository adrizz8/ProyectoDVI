import Player from './personajes/player.js';
import Phaser from 'phaser';
import trigger from './trigger.js';

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

        var entradas= new Map();
        entradas.set('salida_autobus',{x:820,y:980,direccion:'up'});
        entradas.set('puerta_izq',{x:110,y:240,direccion:'down'});
        entradas.set('puerta_der',{x:1100,y:240,direccion:'down'});
        
        this.physics.world.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        );


        // Tilesets (basados en cafeteria.json)
        const tilesInterior2 = map.addTilesetImage('tilesInterior2', 'tilesInterior2');
        const tilesInterior = map.addTilesetImage('tilesinterior', 'tilesinterior');
        const tilesCafeteria = map.addTilesetImage('tilesCafeteria', 'tilesCafeteria');
        const tilesExterior = map.addTilesetImage('tilesetexterior', 'tileset');

        const allTilesets = [tilesInterior2, tilesInterior, tilesCafeteria, tilesExterior];

        // Capas del mapa
        const fondo = map.createLayer('fondo', allTilesets, 0, 0);
        const pared = map.createLayer('pared', allTilesets, 0, 0);
        const puerta = map.createLayer('puerta', allTilesets, 0, 0);
        const barra = map.createLayer('barra', allTilesets, 0, 0);
        const mesas = map.createLayer('mesas', allTilesets, 0, 0);
        const sillas = map.createLayer('sillas', allTilesets, 0, 0);
        const sillas2 = map.createLayer('sillas2', allTilesets, 0, 0);
        const decoracion = map.createLayer('decoracion', allTilesets, 0, 0);

        const colisiones = map.createLayer('colisiones', allTilesets, 0, 0);

        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);

        const posi= entradas.get(data.entrada);
        const spawnX = posi.x;
        const spawnY = posi.y;
        const direccion=posi.direccion;

        this.player = new Player(this, spawnX, spawnY);
        this.player.setDirection(direccion);

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Colisiones del jugador con la capa dedicada
        this.physics.add.collider(this.player, colisiones);

        this.puerta_der=map.createFromObjects('triggers',{
            name:'puerta_der',
            classType:trigger
        });
        this.puerta_izq=map.createFromObjects('triggers',{
            name:'puerta_izq',
            classType:trigger
        });

        this.physics.add.overlap(this.puerta_der,this.player,()=>{
            this.scene.start('outdoorMap',{entrada:'entrada_izq'});
        });
        this.physics.add.overlap(this.puerta_izq,this.player,()=>{
            this.scene.start('outdoorMap',{entrada:'entrada_der'});
        });
       
        /*
        // Transición a MapaFuera (usando la zona de la puerta visual)
        const exitZone = this.add.zone(150, 150, 200, 100);
        this.physics.world.enable(exitZone, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(this.player, exitZone, () => {
            // Spawn en el mapa exterior (delante del edificio de la facultad)
            this.scene.start('outdoorMap', { spawnX: 350, spawnY: 280 });
        });
        */

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
