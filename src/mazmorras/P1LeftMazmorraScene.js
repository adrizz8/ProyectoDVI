import Player from '../personajes/player.js';
import DialogueManager from '../dialogueManager.js';
import Phaser from 'phaser';
import GameManager from '../manager.js';

export default class P1LeftMazmorraScene extends Phaser.Scene {
    constructor() {
        super({ key: 'p1LeftMazmorra' });
    }

    create() {
        const map = this.make.tilemap({ key: 'p1LeftMazmorra' });
        const tileset = map.addTilesetImage('tilesetmazmorra', 'tilesMazmorra');

        // Capas
        //const colisiones = map.createLayer('Colisiones', tileset, 0, 0);
        const suelo = map.createLayer('Suelo', tileset, 0, 0);
        const paredes = map.createLayer('Paredes', tileset, 0, 0);
        const decoracionypuerta = map.createLayer('Decoracionypuerta', tileset, 0, 0);
        const puertasLogicas = map.createLayer('PuertasLogicas', tileset, 0, 0);

        // Colisiones
        //colisiones.setCollisionByExclusion([-1]);
        //colisiones.setVisible(false);
        paredes.setCollisionByProperty({ collides: true });

        // Jugador
        this.player = new Player(this, 1000, 400);
        //this.physics.add.collider(this.player, colisiones);
        this.physics.add.collider(this.player, paredes);
        this.physics.add.collider(this.player, decoracionypuerta);

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogueManager = new DialogueManager(this);

        // Menu con espacio
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.dialogueManager && this.dialogueManager.dialogBox.visible) return;
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
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
