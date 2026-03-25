import Phaser from 'phaser';

export default class bus extends Phaser.GameObjects.Sprite{

    /**
     * Constructor del jugador
     * @param {Phaser.Scene} scene Escena a la que pertenece el jugador
     * @param {number} x Coordenada X
     * @param {number} y Coordenada Y
     */
    constructor(scene, x, y,spriteName) {
        super(scene, x, y,spriteName);
        
        this.bajado=false;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        

        this.state = 'move';
        this.speed = 150;

        this.scene.anims.create({

            key:'move',
            frames: this.scene.anims.generateFrameNumbers(spriteName,{start:0,end:3}),
            frameRate: 15,
            repeat:-1
        })
        //this.body.setSize(this.width, this.height);
        

        //this.scene.anims.generateFrameNumbers('base', { start: 1, end: 1 });
        this.play('move');

    }

    config(player){
        this.player=player;
        this.scene.physics.add.overlap(this,this.player,() => {
        if (this.hasDroppedPlayer) return;
            this.hasDroppedPlayer = true;
            this.drop_player();
        },null,this);
    }

    drop_player(){
        
        this.state='stop';
        this.player.destroy();
        this.scene.parar_soni();
        
    }

    active(){
        this.state='move';
    }

    preUpdate(t,dt){
        super.preUpdate(t, dt);


        let factor = this.speed / 100; 
        this.anims.timeScale = Phaser.Math.Clamp(factor, 0.0, 3);

        
        const cam = this.scene.cameras.main;
        
       if (this.x + this.width < cam.worldView.x) {
            this.scene.unfreeze();
            this.scene.parar_carretera();
            this.destroy();
        }
        else{
            switch(this.state){
                case 'move':
        
                    this.body.setVelocityX(-this.speed);

                break;
                case 'stop':

                    this.frenar();
                    this.body.setVelocityX(-this.speed);
                    if(this.speed<=0&&!this.bajado){
                        this.scene.drop_player();
                        this.bajado=true;
                    }

                break;
                case 'arrancar':

                    
                    this.arranca();
                    this.body.setVelocityX(-this.speed);
                    if(this.speed>=150){
                        
                        this.state='move';
                        this.scene.carretera_soni();
                       
                    }

                break;
            }
        }

    }

    frenar(){
        this.speed=parseInt(this.speed/1.005);
       
    }
    arranca(){
        
        if(this.speed==0){
            this.speed=1;
        }
        this.speed=this.speed*1.02
    }

    
}