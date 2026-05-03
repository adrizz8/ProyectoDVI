import Player from '../personajes/player.js';
import DialogueManager from '../dialogueManager.js';
import Phaser from 'phaser';
import GameManager from '../manager.js';
import trigger from '../trigger.js';

export default class EntradaMazmorraScene extends Phaser.Scene {
    constructor() {
        super({ key: 'entradaMazmorra' });
    }

    create(data) {

        var entradas = new Map();
        entradas.set('pasillo', { x: 595, y: 580, direccion: 'up' });
        entradas.set('izq', { x: 180, y: 300, direccion: 'right' });
        entradas.set('der', { x: 1020, y: 300, direccion: 'left' });
        entradas.set('jefe', { x: 595, y: 325, direccion: 'down' });


        const map = this.make.tilemap({ key: 'entradaMazmorra' });
        const tileset = map.addTilesetImage('tilesetmazmorra', 'tilesMazmorra');

  

        // Capas
        const colisiones = map.createLayer('Colisiones', tileset, 0, 0);
        const suelo = map.createLayer('Suelo', tileset, 0, 0);
        const paredes = map.createLayer('Pared', tileset, 0, 0);
        const ordenador = map.createLayer('Ordenadorpuerta', tileset, 0, 0);
        const limites = map.createLayer('limites', tileset, 0, 0);
        const decoracion = map.createLayer('decoracion', tileset, 0, 0);

        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);
        paredes.setCollisionByProperty({ collides: true });

        // Spawn del jugador
        const posi = entradas.get(data.entrada) || entradas.get('desde_cafeteria');
        const spawnX = posi.x;
        const spawnY = posi.y;
        const direccion = posi.direccion;

        const gm = GameManager.getInstance();
        const savedPos = gm.getPlayerPosition();

        this.player = new Player(this, spawnX, spawnY, direccion, true);
        this.player.setDirection(direccion);

        if (savedPos) {
            gm.clearPlayerPosition();
            this.player.setDirection(savedPos.direction);
            this.player.setPosition(savedPos.x, savedPos.y);
        }

        this.physics.add.collider(this.player, colisiones);
        this.physics.add.collider(this.player, paredes);
        this.physics.add.collider(this.player, ordenador);
        this.physics.add.collider(this.player, limites);

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogueManager = new DialogueManager(this);

        this.salida_pasillo = map.createFromObjects('triggers', {
            name: 'salida_pasillo',
            classType: trigger
        });
        this.entrada_der = map.createFromObjects('triggers', {
            name: 'entrada_der',
            classType: trigger
        });
        this.entrada_izq = map.createFromObjects('triggers', {
            name: 'entrada_izq',
            classType: trigger
        });
        this.entrada_jefe = map.createFromObjects('triggers', {
            name: 'entrada_jefe',
            classType: trigger
        });

        this.physics.add.overlap(this.player, this.salida_pasillo, () => {
            this.scene.start('pasillo', { entrada: 'salida_mazmorra' });
        });
        this.physics.add.overlap(this.player, this.entrada_der, () => {
            this.scene.start('p1RightMazmorra', { entrada: 'lobby' });
        });
        this.physics.add.overlap(this.player, this.entrada_izq, () => {
            this.scene.start('p1LeftMazmorra', { entrada: 'lobby' });
        });
        this.physics.add.overlap(this.player, this.entrada_jefe, () => {
            this.scene.start('salaLanchares');
        });

        // ── Abrir menú con ESPACIO o CLICK DERECHO ─────────────────────────────
        const launchMenu = () => {
            if (this.dialogueManager && this.dialogueManager.dialogueBox.visible) return;
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        };

        this.input.keyboard.on('keydown-SPACE', launchMenu);
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) launchMenu();
        });

        // Música de mazmorra
        this.music = this.sound.add('music_mazmorra', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });


    }

    update(t, dt) {
        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
    }
}
