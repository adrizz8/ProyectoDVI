import Phaser from "phaser";
export default class battle_scene extends Phaser.Scene {
    /** 
     *  @param {Phaser.scene} scene; 
        @param {Player} player; 
        @param {Toy} enemy;     
    */
   
    constructor(scene, player, enemy) {
        super('battle_scene');
        this.scene=scene; 
        this.player=player;
        this.enemy= enemy; 
        this.playerHP= 1000;
        this.playerDamage= 100; 
        this.enemyDamage= 80; 
        this.enemyHP=500; 
        this.turn= "player"; 
    }

    preload() {
        this.load.image('fondo', 'assets/images/fondo.png');
    }


    create() {
       this.add.image(400, 300, 'fondo');
       //botones
       const lucharButton = this.add.text(400,150, 'Luchar', { fontSize: '32px', fill: '#000000', fontWeight: 'bold' }).setOrigin(0.5);
       lucharButton.setInteractive().on('pointerdown', ()=>{
        if(this.turn==="player"){
            playerAttack(); 
        }
       } );
       const huirbutton = this.add.text(400,250, 'Huir', { fontSize: '32px', fill: '#000000', fontWeight: 'bold' }).setOrigin(0.5);
       huirbutton.setInteractive().on('pointerdown', ()=>{
            //volver a la pantalla de exploracion
        }        );
       const mochilaButton = this.add.text(400,350,'Mochila', { fontSize: '32px', fill: '#000000', fontWeight: 'bold' }).setOrigin(0.5);
       mochilaButton.setInteractive().on('pointerdown', ()=>{
        //abrir escena de mochila
        
       });
       const habilidadesButton = this.add.text(400,450,'Habilidades', { fontSize: '32px', fill: '#000000', fontWeight: 'bold' }).setOrigin(0.5);
         habilidadesButton.setInteractive().on('pointerdown', ()=>{
        //abrir escena de habilidades
         });


       //live bar 
        this.playerLifeText = this.add.text(50, 400, "Player HP: " + this.playerHP);
        this.enemyLifeText = this.add.text(400, 50, "Toy HP: " + this.enemyHP);

       this.player = this.scene.get('level').player;
       this.player.setPosition(200, 300);

    }

    playerAttack () {
      // let ataque =  showAttacks(); por implementar 
        this.enemyHP -= this.playerAttack;
        if (this.enemyHP<0) this.enemyHP=0; 
        
        this.enemyLifeText.setText("Toy HP: " + this.enemyHP);
        this.turn= "enemy"; 


        if(this.enemyHP>0){
               this.time.delayedCall(1000, () => {
                this.enemyAttack();
            });
        } else {
            this.add.text(200, 200, "GANASTE!");
        }
    }

    enemyAttack(){
        
        this.messageText.setText("Toy usó ataque"); 
        this.playerHP -= this.enemyAttack;
        if (this.playerHP<0) this.playerHP=0; 
        
        this.playerLifeText.setText("Player HP: " + this.enemyHP);
        this.turn= "player"; 


        if(this.playerHP>0){
               this.time.delayedCall(1000, () => {
                this.playerAttack();
            });
        } else {
            this.add.text(200, 200, "PERDISTE!");
        }
    }
    


    

    


}