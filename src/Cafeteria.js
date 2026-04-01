import Player from './personajes/player.js';
import Phaser from 'phaser';
import trigger from './trigger.js';
import npc from './personajes/npc.js'
import DialogueManager from './dialogueManager.js';
import cafeteria_loco from './personajes/cafeteria_loco.js';
import miron from './personajes/miron.js';
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
        entradas.set('puerta_izq',{x:85,y:160,direccion:'down'});
        entradas.set('puerta_der',{x:1145,y:160,direccion:'down'});
        
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

        const posi= entradas.get(data.entrada);
        const spawnX = posi.x;
        const spawnY = posi.y;
        const direccion=posi.direccion;

        this.player = new Player(this, spawnX, spawnY);
        this.player.setDirection(direccion);

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogueManager= new DialogueManager(this);
    

        this.enemies = this.add.group();
        this.generarnpcs();

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

    generarnpcs(){
        
        const npcData = [
            { x: 270, y: 210, texture: 'npc1',frame:8,message:'a.',onFinish:null,ItemId:null, name: 'Juan' },
            { x: 334, y: 210, texture: 'npc2',frame:4,message:'b.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 380, y: 340, texture: 'npc3',frame:8,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 520, y: 590, texture: 'npc1',frame:4,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 464, y: 590, texture: 'npc4',frame:8,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 680, y: 470, texture: 'npc2',frame:8,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 1015, y: 340, texture: 'npc1',frame:8,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 820, y: 160, texture: 'npc4',frame:8,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 860, y: 185, texture: 'npc3',frame:8,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 900, y: 208, texture: 'npc4',frame:8,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 890, y: 156, texture: 'npc3',frame:8,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 950, y: 155, texture: 'npc4',frame:8,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 995, y: 142, texture: 'npc1',frame:8,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 950, y: 208, texture: 'npc2',frame:4,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 1070, y: 225, texture: 'npc1',frame:12,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 1083, y: 285, texture: 'npc2',frame:12,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 1200, y: 262, texture: 'npc4',frame:12,message:'c.',onFinish:null,ItemId:null, name: 'Maria' },
            { x: 1015, y: 188, texture: 'npc2',frame:8,message:'c.',onFinish:null,ItemId:null, name: 'Maria' }
            
        ];

       this.npcArray = npcData.map(data => 
            new npc(
                this,
                this.player,
                data.x,
                data.y,
                data.texture,
                data.frame,
                data.message,
                data.onFinish,
                data.ItemId,
                data.name
            )
        );

        // añadir al grupo
        this.npcArray.forEach(npc => this.enemies.add(npc));
        const loco= new cafeteria_loco(this,this.player,450,320,null,null,{name:'Marcos'},'',null,null);
        this.enemies.add(loco);
        const per_miron = new miron(this,this.player,707,340,null,0,{},'',null,null);
        this.enemies.add(per_miron);
        
    }
    showDialogue(message, nombre = '', onFinish = null) {
        if (this.dialogueManager) {
            this.dialogueManager.showDialogue(message, nombre, onFinish);
        }
    }
}
