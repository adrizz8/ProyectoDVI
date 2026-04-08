import Phaser from 'phaser';
import NPC from './npc.js';
import GameManager from '../manager.js';



export default class amigo1 extends NPC {


    constructor(scene, player, x, y, texture,frame=0, message = null, onFinish = null, itemId = null, name = '')  {
        super(scene, player, x, y, texture,frame, message , onFinish , itemId , name);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.frozen = false;
        // 1. Ajustar el tamaño (Ancho, Alto)

        this.body.setSize(this.width, this.height);

        // 2. Ajustar el desplazamiento (Offset) para centrar la caja en los pies
        this.body.setOffset(this.width * 0.25, this.height * 0.7);

        this.gm= GameManager.getInstance();


        // Definición de animaciones direccionales
        const animsConfig = [
            { key: 'down', start: 0, end: 3 },
            { key: 'left', start: 4, end: 7 },
            { key: 'right', start: 8, end: 11 },
            { key: 'up', start: 12, end: 15 }
        ];

        animsConfig.forEach(cfg => {
            // Animación de caminar
            if (!this.scene.anims.exists(`walk5-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `walk5-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers('amigo1', { start: cfg.start, end: cfg.end }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            // Animación de reposo (solo el primer frame de esa dirección)
            if (!this.scene.anims.exists(`idle5-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `idle5-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers('amigo1', { start: cfg.start, end: cfg.start }),
                    frameRate: 1,
                    repeat: -1
                });
            }
        });

        this.setDirection('down');
    }

    /**
     * Establece la dirección en la que mira el jugador
     * @param {string} dir 'up', 'down', 'left', 'right'
     */
    setDirection(dir) {
        this.lastDirection = dir;
        this.play(`idle5-${dir}`);
    }


    /**
     * Métodos preUpdate de Phaser. En este caso solo se encarga del movimiento del jugador.
     * Como se puede ver, no se tratan las colisiones con las estrellas, ya que estas colisiones 
     * ya son gestionadas por la estrella (no gestionar las colisiones dos veces)
     * @override
     */
    preUpdate(t, dt) {
        super.preUpdate(t, dt);

        if (this.frozen) {
            this.body.setVelocity(0, 0);
            this.anims.stop();
            return;
        }

        let moving = false;


        // Reproducir la animación correspondiente: walk o idle según la última dirección
        const animState = moving ? 'walk5' : 'idle5';
        this.play(`${animState}-${this.lastDirection}`, true);
    }


    freeze() {
        this.play('idle5-' + this.lastDirection, true);
        this.frozen = true;
    }
    unfreeze() {
        this.frozen = false;
    }

    interact() {


        this.lastDirection=this.contrario_player();
        
        this.scene.showDialogue('Hey hola',this.name);
        this.scene.showDialogue('¡Oye! ¡La facultad se ha vuelto loca',this.player.name);

        this.unirse();

    }

    contrario_player(){

        if(this.player.lastDirection=='right'){
            return 'left';
        }else{
            return 'right';
        }
    }

    unirse(){
        this.gm.AddCompañero('Jugador2');
    }

}  
