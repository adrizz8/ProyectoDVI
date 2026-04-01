import Player from './personajes/player.js';
import DialogueManager from './dialogueManager.js';
import Phaser from 'phaser';
import GameManager from './manager.js';
import Parada from './Parada.js'
import Bus from './bus.js'
import trigger from './trigger.js'

/**
 * Nivel 3: Escena de exploración con el mapa de tiles (mapa interior/camino).
 * El jugador llega aquí tras resolver el puzzle de circuito lógico en Level2.
 * Al llegar al borde del camino (borde derecho del mapa) se transiciona a MapaFuera.
 * @extends Phaser.Scene
 */
export default class Level3 extends Phaser.Scene {
    constructor() {
        super({ key: 'level3' });
        this._transitionActive = false;
    }

    create() {
        this._transitionActive = false;

        const map = this.make.tilemap({ key: 'mainscene', tileWidth: 32, tileHeight: 32 });
        const tileset = map.addTilesetImage('tilesetexterior', 'tileset');

        this.arrancar = this.sound.add('arrancar');
        this.parar = this.sound.add('parar');
        this.carretera = this.sound.add('carretera');
        this.carre_join = this.sound.add('carre_join');

        const backgroundLayer = map.createLayer('Suelo', tileset, 0, 0);
        const groundLayer = map.createLayer('Arboles', tileset, 0, 0);
        const objectsLayer = map.createLayer('Resto', tileset, 0, 0);

        //backgroundLayer.setCollisionByProperty({ collides: true });
        groundLayer.setCollisionByProperty({ collides: true }); // Solo esta capa tiene colisiones, el resto es decorativo
        objectsLayer.setCollisionByProperty({ collides: true });


        const gm = GameManager.getInstance();
        gm.addNivel('level3');

        this.player = new Player(this, 100, 400);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogM = new DialogueManager(this);

        if(!gm.estadoNivel('level3')){
            
            this.player.setVisible(false);
            this.bus= new Bus(this,1800, 560,'bus');

            const parada = map.createFromObjects('triggers', {
                gid: 558,    // ← ID del tile en el tileset
                classType: Parada,             
                key: 'tileset',        // ← key de la imagen cargada en Phaser
                frame: 557              // ← frame dentro del tileset (gid - firstgid)
            });

            this.bus.config(parada[0]);

            this.carretera.play();

            gm.CompleteNivel('level3');
            
        }else{
            this.player.setPosition(map.widthInPixels/2-10,30);
           
        }

        const trigger_pantalla = map.createFromObjects('triggers', {
            name: 'pantalla_nueva',
            classType: trigger
        });
        
        this.physics.add.overlap(trigger_pantalla,this.player,() => {
            this.scene.start('outdoorMap',{entrada:'salida_autobus'});
        });

        // Colisión del jugador con las capas del mapa
        this.physics.add.collider(this.player, groundLayer);
        this.physics.add.collider(this.player, objectsLayer);
       

        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.dialogueManager && this.dialogueManager.dialogueBox.visible) return;
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });

       
    }

    parar_soni() {
        this.parar.play();
        this.carretera.stop();
    }
    carretera_soni() {
        this.carre_join.play();
    }
    parar_carretera() {
        this.carre_join.stop();
    }
    unfreeze() {
        this.player.unfreeze();
    }
    drop_player() {
        this.time.addEvent({
            delay: 400, // ms
            callback:() => {
                    var posi=this.bus.getCenter();
                    this.player.setPosition(posi.x,posi.y-45);
                    this.player.setVisible(true);
                    this.player.freeze();
            }
        });
        this.time.addEvent({
            delay: 2000, // ms
            callback: () => {
                this.bus.state = 'arrancar';
                this.arrancar.play();
                this.parar.stop();
            }
        });


    }

    update(t, dt) {
        // actualizamos el contador global
        const sec = this.registry.get('horasJuego') || 0;
        this.registry.set('horasJuego', sec + dt / 1000);

        //console.log(this.bus.state);
        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
    }

    showDialogue(message, nombre = '', onFinish = null) {
        if (this.dialogM) {
            this.dialogM.showDialogue(message, nombre, onFinish);
        }
    }
}
