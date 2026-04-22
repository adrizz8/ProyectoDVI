import Player from '../personajes/player.js';
import DialogueManager from '../dialogueManager.js';
import Phaser from 'phaser';
import GameManager from '../manager.js';
import trigger from '../trigger.js';

export default class SalaLancharesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'salaLanchares' });
    }

    create() {
        const map = this.make.tilemap({ key: 'salaLanchares' });
        const tileset = map.addTilesetImage('tilesetmazmorra', 'tilesMazmorra');


        // Capas
        const colisiones = map.createLayer('Colisiones', tileset, 0, 0);
        const suelos = map.createLayer('Suelos', tileset, 0, 0);
        const escaleras = map.createLayer('Escaleras', tileset, 0, 0);
        const paredes = map.createLayer('Paredes', tileset, 0, 0);
        const decoracion = map.createLayer('Decoracion', tileset, 0, 0);

        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);
        paredes.setCollisionByProperty({ collides: true });

        // Jugador
        this.player = new Player(this, 660, 515);
        this.player.setDirection('up');
        this.physics.add.collider(this.player, colisiones);
        this.physics.add.collider(this.player, paredes);
        this.physics.add.collider(this.player, decoracion);

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogueManager = new DialogueManager(this);

        
        this.lobby = map.createFromObjects('triggers', {
            name: 'lobby',
            classType: trigger
        });

        this.physics.add.overlap(this.player,this.lobby,()=>{
            this.scene.start('entradaMazmorra',{entrada:'jefe'});
        });
        

        // Menu con espacio
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.dialogueManager && this.dialogueManager.dialogueBox.visible) return;
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
