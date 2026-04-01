import Player from './personajes/player.js';
import Phaser from 'phaser';
import trigger from './trigger.js';
import primerencuentro from './personajes/primerencuentro.js';
import GameManager from './manager.js';
import DialogueManager from './dialogueManager.js';

/**
 * Escena del mapa exterior (mapaFuera).
 * El jugador llega aquí al salir del camino en el mapaDePrueba.
 * @extends Phaser.Scene
 */
export default class MapaFueraAux extends Phaser.Scene {
    constructor() {
        super({ key: 'MapaFueraAux' });
    }

    init(data){
        this.direccion_personaje=data.posi;
    }
    preload() {
        // Los assets ya se han cargado en Boot
    }

    /**
     * @param {{ spawnX?: number, spawnY?: number }} data  Datos opcionales de spawn
     */
    create(data) {
        const map = this.make.tilemap({ key: 'MapaFueraAuxt', tileWidth: 32, tileHeight: 32 });
        const tileset = map.addTilesetImage('tilesetexterior', 'tileset');
        
        this.physics.world.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        );

        const fondoLayer = map.createLayer('fondo', tileset, 0, 0);
        //const facultadLayer = map.createLayer('facultad', tileset, 0, 0);
        //const decoracionLayer = map.createLayer('decoracion', tileset, 0, 0);
        // 'bebidas' omitida: contiene GIDs de tilesets externos no cargados en el proyecto


        //facultadLayer.setCollisionByProperty({ collides: true });
        //decoracionLayer.setCollisionByProperty({ collides: true });

         
        //this.physics.add.collider(this.player, facultadLayer);
        //this.physics.add.collider(this.player, decoracionLayer);


        this.player = new Player(this, map.widthInPixels/2,map.heightInPixels-60, this.direccion_personaje);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels,true);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogueManager= new DialogueManager(this); 
      
        // --- Jugador ---
        const gm = GameManager.getInstance();
        const savedPos = gm.getPlayerPosition();
        const startX = savedPos ? savedPos.x : 100;
        const startY = savedPos ? savedPos.y : 400;

        gm.addNivel('MapaFueraAux');

        this.volver = map.createFromObjects('triggers', {
            name:'volver' ,
            classType: trigger
        });

        this.physics.add.overlap(this.volver,this.player,()=>{

            this.scene.start('level3');
        });

        if(!gm.estadoNivel('MapaFueraAux')){
            
            // Restaurar dirección si existía
            if (savedPos && savedPos.direction) {
                this.player.setDirection(savedPos.direction);
            }

            // Limpiamos la posición para que no se use de nuevo si cambiamos de nivel después
            if (savedPos) gm.clearPlayerPosition();
            
            // Si hay posición guardada, es que venimos de la batalla
            if (savedPos) {

                gm.CompleteNivel('MapaFueraAux');

                this.player.setPosition(startX,startY);
                this.player.freeze();
                console.log(savedPos);
                const posi= this.getPosiPostComb(savedPos);
                this.player2=new primerencuentro(this,this.player,posi.x,posi.y,'estudianteprimero',{},null,null,null);
                this.player2.setDirection(posi.direction);

                this.irse=map.createFromObjects('triggers', {
                    name:'irse' ,
                    classType: trigger
                });
                this.physics.add.overlap(this.irse,this.player2,()=>{
                    console.log( this.player2.lastDirection);
                    this.player2.setDirection('down');
                });

                this.time.addEvent({
                    delay: 300, // ms
                    callback:() => {
                        this.dialogueManager.showDialogue("Comoo!!!! PASO DE TI",'Enemigo',() => {
                            this.player2.setDirection('right');
                            this.player2.unfreeze();
                            });
                    }
                });
    
            }
            else{

                this.parar_jug = map.createFromObjects('triggers', {
                    name:'parar_jug' ,
                    classType: trigger
                });
                this.mover_der = map.createFromObjects('triggers', {
                    name:'mover_der' ,
                    classType: trigger
                });
                this.mover_abajo = map.createFromObjects('triggers', {
                    name:'mover_abajo' ,
                    classType: trigger
                });
            
                
                this.player2=new primerencuentro(this,this.player,181,400,'estudianteprimero',{hp:1}," ¿Quien eres tu?, te vas a enterar.",null,null);
                this.player2.setVisible(false);

                this.physics.add.overlap(this.parar_jug,this.player,()=>{
                    this.parar_jug[0].destroy();
                    
                    this.player.freeze();
                    this.player2.setVisible(true);
                    this.player2.unfreeze();
                    this.player2.setDirection('down');
                    this.dialogueManager.showDialogue("¡No me carga el repositorio, no me cargaaaa!",'Enemigo');

                });

                this.physics.add.overlap(this.mover_der,this.player2,()=>{
                    this.player2.setDirection('right');
                });
                this.physics.add.overlap(this.mover_abajo,this.player2,()=>{
                    this.player2.setDirection('down');
                });

                this.player2.collider.destroy();
                this.physics.add.collider(this.player, this.player2, (player, player2) => {
                    if (player2.triggered) return;

                    player2.triggered = true;
                    this.player2.freeze();
                    this.player2.interact();
                });

            }
        }

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });

    }

    update(t, dt) {
        const sec = this.registry.get('horasJuego') || 0;
        this.registry.set('horasJuego', sec + dt / 1000);

        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
        if (this.player2 && this.player2.update) {
            this.player2.update(t, dt);
        }
       
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
