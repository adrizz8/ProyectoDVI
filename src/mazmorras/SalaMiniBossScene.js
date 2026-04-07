import Player from '../personajes/player.js';
import DialogueManager from '../dialogueManager.js';
import Phaser from 'phaser';
import GameManager from '../manager.js';

export default class SalaMiniBossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'salaMiniBoss' });
    }

    create() {
        const map = this.make.tilemap({ key: 'salaMiniBoss' });
        const tileset = map.addTilesetImage('tilesetmazmorra', 'tilesMazmorra');

        // Capas
        const colisiones = map.createLayer('Colisiones', tileset, 0, 0);
        const suelos = map.createLayer('Suelos', tileset, 0, 0);
        const pared = map.createLayer('Pared', tileset, 0, 0);
        const maquinas = map.createLayer('Maquinas', tileset, 0, 0);
        
        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);
        pared.setCollisionByProperty({ collides: true });

        // Jugador
        this.player = new Player(this, 100, 100); 
        this.physics.add.collider(this.player, colisiones);
        this.physics.add.collider(this.player, pared);
        this.physics.add.collider(this.player, maquinas);

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
    }

    update(t, dt) {
        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
    }
}
