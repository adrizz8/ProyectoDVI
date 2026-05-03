import Phaser from 'phaser';
import NPCBattle from './npc_battle';

/**
 * Clase que representa el jugador del juego. El jugador se mueve por el mundo usando los cursores.
 * También almacena la puntuación o número de estrellas que ha recogido hasta el momento.
 */



export default class cafeteria_loco extends NPCBattle {

    constructor(scene, player, x, y, texture,frame, stats = {}, message = null, onFinish = null, itemId = null,NpcId) {
        super(scene, player, x, y, texture,frame, stats , message , onFinish , itemId,NpcId);

        this.lastDirection='';
        
        this.frozen = false;
        
        this.body.moves = true;
        this.speed = 200;

        this.move_x=0;
        this.move_y=0;

        // Definición de animaciones direccionales
        const animsConfig = [
            { key: 'down', start: 0, end: 3 },
            { key: 'left', start: 4, end: 7 },
            { key: 'right', start: 8, end: 11 },
            { key: 'up', start: 12, end: 15 }
        ];

        animsConfig.forEach(cfg => {
            // Animación de caminar
            if (!this.scene.anims.exists(`walk3-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `walk3-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers('npc1', { start: cfg.start, end: cfg.end }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            // Animación de reposo (solo el primer frame de esa dirección)
            if (!this.scene.anims.exists(`idle3-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `idle3-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers('npc1', { start: cfg.start, end: cfg.start }),
                    frameRate: 1,
                    repeat: -1
                });
            }
        });

        this.setDirection('down');

    }

    setDirection(dir) {
        this.lastDirection = dir;
        this.play(`idle3-${dir}`);
    }
    preUpdate(t, dt) {
        super.preUpdate(t, dt);
        
        if (this.frozen) {
            this.body.setVelocity(0, 0);
            this.anims.stop();
            return;
        }
        let moving = false;
        if (this.lastDirection=='up') {

            if(Math.abs(this.player.x-this.x)<25&&this.y-this.player.y>=30&&this.y-this.player.y<=60){
                this.freeze();
                this.player.freeze();
                this.interact();
            }else{
                this.body.setVelocityY(-this.speed);
                this.body.setVelocityX(0);
                moving = true;

                this.move_y-=1;
                if(this.move_y<=0){
                    this.lastDirection='left';
                }
            }
        }
        else if (this.lastDirection=='left') {

            if(Math.abs(this.player.y-this.y)<25&&this.x-this.player.x>=30&&this.x-this.player.x<=60){
                this.freeze();
                this.player.freeze();
                this.interact();
            }
            else{
                this.body.setVelocityX(-this.speed);
                this.body.setVelocityY(0);
                moving = true;
                
                this.move_x-=1;
                if(this.move_x<=0){
                    this.lastDirection='down';
                }
            }
        }
        else if (this.lastDirection=='right') {

            if(Math.abs(this.player.y-this.y)<25&&this.x-this.player.x<=-30&&this.x-this.player.x>=-60){
                this.freeze();
                this.player.freeze();
                this.interact();
            }
            else{

            this.body.setVelocityX(this.speed);
            this.body.setVelocityY(0);
            moving = true;
            
                this.move_x+=1;
                if(this.move_x>=15){
                    this.lastDirection='up';
                }
            }
        }
        else if (this.lastDirection=='down') {

            if(Math.abs(this.player.x-this.x)<25&&this.y-this.player.y<=-30&&this.y-this.player.y>=-60){
                this.freeze();
                this.player.freeze();
                this.interact();
            }
            else{
                this.body.setVelocityY(this.speed);
                this.body.setVelocityX(0);
                moving = true;

                this.move_y+=1;
                if(this.move_y>=28){
                    this.lastDirection='right';
                }
            }

        } else {
            this.body.setVelocityX(0);
            this.body.setVelocityY(0);
        }

        // Reproducir la animación correspondiente: walk o idle según la última dirección
        const animState = moving ? 'walk3' : 'idle3';
        this.play(`${animState}-${this.lastDirection}`, true);
    
    }
    freeze(){
        this.play('idle3-'+this.lastDirection,true);
        this.frozen=true;
    }
    unfreeze() {
        this.frozen = false;
    }

}