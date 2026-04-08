import Player from './personajes/player.js';
import Phaser from 'phaser';
import trigger from './trigger.js';
import npc from './personajes/npc.js'
import NPCBattle from './personajes/npc_battle.js';
import DialogueManager from './dialogueManager.js';
import cafeteria_loco from './personajes/cafeteria_loco.js';
import miron from './personajes/miron.js';
import GameManager from './manager.js';
import amigo1 from './personajes/amigo1.js';
import conserje from './personajes/conserje.js'
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

        var entradas = new Map();
        entradas.set('salida_autobus', { x: 820, y: 980, direccion: 'up' });
        // Entrada desde exterior: x coincide con el trigger en mapaFuera.json
        entradas.set('puerta_izq', { x: 161, y: 580, direccion: 'up' });
        entradas.set('puerta_der', { x: 896, y: 580, direccion: 'up' });
        // Vuelta desde el pasillo
        entradas.set('desde_pasillo_izq', { x: 85, y: 160, direccion: 'down' });
        entradas.set('desde_pasillo_der', { x: 1145, y: 160, direccion: 'down' });

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

        const posi = entradas.get(data.entrada);
        const spawnX = posi.x;
        const spawnY = posi.y;
        const direccion = posi.direccion;
        // Venimos del exterior si la entrada es por una puerta del outdoor
        const desdeExterior = (data.entrada === 'puerta_izq' || data.entrada === 'puerta_der');

        this.player = new Player(this, spawnX, spawnY);
        this.player.setDirection(direccion);

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.gm = GameManager.getInstance();
        this.savedPos = this.gm.getPlayerPosition();

        this.dialogueManager= new DialogueManager(this);

         if(this.savedPos){
            this.player.x=this.savedPos.x;
            this.player.y=this.savedPos.y;
            this.player.setDirection(this.savedPos.direction);
            this.gm.clearPlayerPosition();
        }

        // Colisiones del jugador con la capa dedicada
        this.physics.add.collider(this.player, colisiones);

        if(!this.gm.estadoNivel('cafeteria')){

            this.amigo1= new amigo1(this,this.player,1040,470,'',0,null,null,null,'Pepe');
            this.enemies = this.add.group();
            this.generarnpcs();

        }

        // Zonas de salida con rectángulos verdes visibles para debug de posición
        // El mapa es 38x20 tiles de 32px = 1216x640px
        // Los huecos de la capa colisiones están en los extremos izquierdo y derecho, filas 4-5 (y=128-192)

        if(this.gm.estadoNivel('cafeteria')){
            // puerta_der → pasillo (extremo derecho del mapa, filas 4-5)
            const zonaDer = this.add.zone(1200, 160, 48, 128);
            this.physics.world.enable(zonaDer, Phaser.Physics.Arcade.STATIC_BODY);
            // Rectángulo verde debug — eliminar cuando funcione
            this.add.rectangle(1200, 160, 48, 128, 0x00ff00, 0.5).setDepth(99);

            this.physics.add.overlap(zonaDer, this.player, () => {
                this.scene.start('pasillo', { entrada: 'desde_cafeteria' });
            });
        }

        // puerta_izq → pasillo
        const zonaIzq = this.add.zone(16, 160, 60, 128);
        this.physics.world.enable(zonaIzq, Phaser.Physics.Arcade.STATIC_BODY);

        // Zona de salida baja derecha → volver al exterior (x=896, coincide con trigger en mapaFuera)
        const zonaExitDer = this.add.zone(896, 635, 100, 32);
        this.physics.world.enable(zonaExitDer, Phaser.Physics.Arcade.STATIC_BODY);

        // Zona de salida baja izquierda → volver al exterior (x=161, coincide con trigger en mapaFuera)
        const zonaExitIzq = this.add.zone(161, 635, 100, 32);
        this.physics.world.enable(zonaExitIzq, Phaser.Physics.Arcade.STATIC_BODY);

 
        this.physics.add.overlap(zonaIzq, this.player, () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('pasillo', { entrada: 'desde_cafeteria_izq' });
            });
        });
        this.physics.add.overlap(zonaExitDer, this.player, () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('outdoorMap', { entrada: 'entrada_der' });
            });
        });
        this.physics.add.overlap(zonaExitIzq, this.player, () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('outdoorMap', { entrada: 'entrada_izq' });
            });
        });

        // Tecla de menú (Espacio)
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });

        // Fade-in al entrar en la escena
        this.cameras.main.fadeIn(400, 0, 0, 0);

        // Si venimos del exterior: freeze breve + walk para que se vea entrar al personaje
        if (desdeExterior) {
            this.player.freeze();
            this.cameras.main.once('camerafadeincomplete', () => {
                this.player.unfreeze();
            });
        }

        // Música ambiente
        this.music = this.sound.add('music_ambiente', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });
    }

    update(t, dt) {
        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
        if (this.amigo1 && this.amigo1.update) {
            this.amigo1.update(t, dt);
        }
    }

    generarnpcs(){


        const conserj= new conserje(this,this.player,1150,155,'toy',null,{},'No pasaras!!',null,null,'conserje_caf');

        if(this.gm.isJustDefeated('conserje_caf')){

            this.player.freeze();
            this.gm.CompleteNivel('cafeteria');
            this.showDialogue('No pueder ser',()=>{
                conserj.huir();
            })

            this.gm.markDefeated('npc_loco_caf');
            
            this.gm.markDefeated('npc_miron_caf');

        }
        
        const npcData = [
            { x: 270, y: 210, texture: 'npc1', frame: 8, message: 'a.', onFinish: null, ItemId: null, name: 'Juan' },
            { x: 334, y: 210, texture: 'npc2', frame: 4, message: 'b.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 380, y: 340, texture: 'npc3', frame: 8, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 520, y: 590, texture: 'npc1', frame: 4, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 464, y: 590, texture: 'npc4', frame: 8, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 680, y: 470, texture: 'npc2', frame: 8, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 1015, y: 340, texture: 'npc1', frame: 8, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 820, y: 160, texture: 'npc4', frame: 8, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 860, y: 185, texture: 'npc3', frame: 8, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 900, y: 208, texture: 'npc4', frame: 8, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 890, y: 156, texture: 'npc3', frame: 8, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 950, y: 155, texture: 'npc4', frame: 8, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 995, y: 142, texture: 'npc1', frame: 8, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 950, y: 208, texture: 'npc2', frame: 4, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 1070, y: 225, texture: 'npc1', frame: 12, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 1083, y: 285, texture: 'npc2', frame: 12, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 1200, y: 262, texture: 'npc4', frame: 12, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' },
            { x: 1015, y: 188, texture: 'npc2', frame: 8, message: 'c.', onFinish: null, ItemId: null, name: 'Maria' }

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
        const loco= new cafeteria_loco(this,this.player,450,320,null,null,{name:'Marcos'},'AHHHHHHHH',null,null,'npc_loco_caf');

        if(this.gm.isJustDefeated('npc_loco_caf')){
            const posi= this.getPosiPostComb(this.savedPos);
            loco.x=posi.x;
            loco.y=posi.y;
            loco.setDirection(posi.direction);
            loco.freeze();
            this.gm.setJustDefeated('');

        }else{
            if(this.gm.isDefeated('npc_loco_caf')){
                loco.freeze();
            }
        }
        
        this.enemies.add(loco);
        const per_miron = new miron(this,this.player,707,340,null,0,{},'Te pille',null,null,'npc_miron_caf');

         if(this.gm.isJustDefeated('npc_miron_caf')){
            const posi= this.getPosiPostComb(this.savedPos);
            per_miron.x=posi.x;
            per_miron.y=posi.y;
            per_miron.setDirection(posi.direction);
            per_miron.freeze();
            this.gm.setJustDefeated('');

        }else{
            if(this.gm.isDefeated('npc_miron_caf')){
                per_miron.freeze();
            }
        }
        this.enemies.add(per_miron);

        
        
    }


    showDialogue(message, nombre = '', onFinish = null) {
        if (this.dialogueManager) {
            this.dialogueManager.showDialogue(message, nombre, onFinish);
        }
    }

    getPosiPostComb(savedPos, paso = 60) {
        const { x, y, direction } = savedPos;

        switch (direction) {
            case "up":
                return {
                    x: x,
                    y: y - paso,
                    direction: "down"
                };

            case "down":
                return {
                    x: x,
                    y: y + paso,
                    direction: "up"
                };

            case "left":
                return {
                    x: x - paso,
                    y: y,
                    direction: "right"
                };

            case "right":
                return {
                    x: x + paso,
                    y: y,
                    direction: "left"
                };

            default:
                throw new Error(`Dirección no válida: ${direction}`);
        }
    }

     unfreeze(){
        this.player.unfreeze();
    }

}

