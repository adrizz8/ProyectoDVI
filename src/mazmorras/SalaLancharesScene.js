import Player from '../personajes/player.js';
import DialogueManager from '../dialogueManager.js';
import Phaser from 'phaser';
import GameManager from '../manager.js';
import trigger from '../trigger.js';
import npcBattle from '../personajes/npc_battle.js'
import npc from '../personajes/npc.js'

export default class SalaLancharesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'salaLanchares' });
    }

    create() {
        const map = this.make.tilemap({ key: 'salaLanchares' });
        const tileset = map.addTilesetImage('tilesetmazmorra', 'tilesMazmorra');


        const gm = GameManager.getInstance();
        gm.addNivel("salaLanchares");

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


        const savedPos = gm.getPlayerPosition();

        // Si hay posición guardada, es que venimos de la batalla
        if (savedPos) {
            gm.clearPlayerPosition();
            this.player.setDirection(savedPos.direction);
            this.player.setPosition(savedPos.x, savedPos.y);
        }

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogueManager = new DialogueManager(this);


        this.lobby = map.createFromObjects('triggers', {
            name: 'lobby',
            classType: trigger
        });

        this.physics.add.overlap(this.player, this.lobby, () => {
            this.scene.start('entradaMazmorra', { entrada: 'jefe' });
        });


        // Menu con espacio
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

        if (!gm.estadoNivel("salaLanchares")) {

            this.lanchares = new npcBattle(this, this.player, 650, 150, 'lanchares', 0, {
                spriteKey: 'lancharesbatalla',
                scale: 0.45,
                name: 'Lanchares',
                hp: 90,
                maxHp: 90,
                damage: 21,
                speed: 8,
                defense: 22,
                mp: 20,
                maxMp: 20,
                habilidades: ['Cura', 'Ataque Potente', 'Golpe Vigorizante', 'Entrega Última Hora', '¡A pelar cables!']
            }, null, null, null, 'lanchares_', "salaLanchares");
        } else {
            this.lanchares = new npc(this, this.player, 650, 150, 'lanchares', 0, "b", null, 'lanchares_', 'Lanchares');
        }


    }

    showDialogue(message, nombre = '', onFinish = null) {
        if (this.dialogueManager) {
            this.dialogueManager.showDialogue(message, nombre, onFinish);
        }
    }

    update(t, dt) {
        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
    }
}
