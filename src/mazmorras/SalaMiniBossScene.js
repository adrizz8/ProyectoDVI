import Player from '../personajes/player.js';
import DialogueManager from '../dialogueManager.js';
import Phaser from 'phaser';
import GameManager from '../manager.js';
import trigger from '../trigger.js';
import npcBattle from '../personajes/npc_battle.js'
import npc from '../personajes/npc.js'

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

        const gm=GameManager.getInstance();

        gm.addNivel("salaMiniBoss");
        

        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);
        pared.setCollisionByProperty({ collides: true });

        // Jugador
        this.player = new Player(this, 617, 440); 
        this.player.setDirection('up');
        this.physics.add.collider(this.player, colisiones);
        this.physics.add.collider(this.player, pared);
        this.physics.add.collider(this.player, maquinas);

        const savedPos=gm.getPlayerPosition();

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

        this.salida = map.createFromObjects('triggers', {
            name: 'salida',
            classType: trigger
        });
        this.physics.add.overlap(this.player,this.salida,()=>{
            this.scene.start('p1LeftMazmorra',{entrada:'salida_miniboss'});
        });

        // Menu con espacio
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.dialogueManager && this.dialogueManager.dialogueBox.visible) return;
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });

        
        if(!gm.estadoNivel("salaMiniBoss")){

            this.miniboss= new npcBattle(this,this.player,625,250,'miniboss',0,{
                    spriteKey: 'minibossbatalla',
                    name: 'Miniboss',
                    hp: 120,
                    maxHp: 120,
                    damage: 15,
                    speed: 8,
                    defense: 5,
                    mp: 40,
                    maxMp: 40,
                    habilidades: ['Cura', 'Ataque Potente', 'Golpe Vigorizante']
                },null, null,null,'miniboss_',"salaMiniBoss");
        }else{
            this.miniboss= new npc(this,this.player,625,250,'miniboss',0,"b",null,'miniboss_',"Miniboss");
        }

        // Música de mazmorra
        this.music = this.sound.add('music_mazmorra', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });


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
