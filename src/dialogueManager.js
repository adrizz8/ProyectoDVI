import Phaser from 'phaser';


class Datos {
    constructor(nombre, texto) {
        this.contador = 0;
        this.textoSplit = texto;
        this.nombre = nombre;
    }

    incrementar() {
        this.contador++;
    }
}
/**
 * Clase que gestiona el sistema de diálogos de forma centralizada.
 */
export default class DialogueManager {
    /**
     * @param {Phaser.Scene} scene La escena donde se mostrará el diálogo
     */
    constructor(scene) {
        this.scene = scene;
        this.setupDialogue();
    }

    /**
     * Crea los elementos visuales del cuadro de diálogo
     */
    setupDialogue() {

        this.full_message=[];
        this.ini=0;
        this.fin=0;
        this.current_message='';

        this.onFinish=null;

        this.dialogueBox = this.scene.add.container(400, 440).setDepth(100).setVisible(false);

        // Fondo del diálogo con bordes redondeados
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.85);
        bg.fillRoundedRect(-250, -35, 900, 100, 15);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-250, -35, 900, 100, 15);

        this.dialogueText = this.scene.add.text(0, 0, "", {
            fontSize: '18px',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: 875 }
        }).setOrigin(0.26,0.26);

        

        this.dialogueBox.add([bg, this.dialogueText]);


         

        // Evento para cerrar al pulsar cualquier tecla
        this.scene.input.keyboard.on('keydown', () => {

            this.next_text();
                
            if(this.current_message==''){

                this.ini+=1;
                if(this.ini==this.fin){

                    this.ini=0;
                    this.fin=0;
                    if (this.dialogueBox.visible) {
                        this.hideDialogue();

                        if (this.onFinish!=null) {
                            this.onFinish();
                            this.onFinish=null;     
                        }
                        
                    }
                }else {
                    this.next_text();
                    this.dialogueText.setText(this.current_message);
                }
            
            }else{
                this.dialogueText.setText(this.current_message);
            }
            
        });
    }

    /**
     * Muestra un mensaje en pantalla de forma indefinida
     */
    showDialogue(message) {
        

        this.full_message[this.fin]=new Datos('p1',message.split(' '));
        this.fin+=1;

        if(!this.dialogueBox.visible){
            this.next_text();
            this.dialogueText.setText(this.current_message);
            this.dialogueBox.setVisible(true);
            this.dialogueBox.setAlpha(0);

            // Animación de aparición (fade in)
            this.scene.tweens.add({
                targets: this.dialogueBox,
                alpha: 1,
                duration: 200
            });
        }

       

       
    }
    /**
     * Muestra un mensaje y ejecuta un codigo cuando se quita
     */
    showDialogue(message,onFinish) {

        this.full_message[this.fin]=new Datos('p1',message.split(' '));
        this.fin+=1;

        if(!this.dialogueBox.visible){
            this.next_text();
            this.dialogueText.setText(this.current_message);
            this.dialogueBox.setVisible(true);
            this.dialogueBox.setAlpha(0);
           

            // Animación de aparición (fade in)
            this.scene.tweens.add({
                targets: this.dialogueBox,
                alpha: 1,
                duration: 200
            });
        }
        this.onFinish = onFinish;
        
    }

    /**
     * Oculta el cuadro de diálogo con una animación
     */
    hideDialogue() {
        this.scene.tweens.add({
            targets: this.dialogueBox,
            alpha: 0,
            duration: 200,
            onComplete: () => this.dialogueBox.setVisible(false)
        });
    }

    next_text(){
        var cont=0;
        var queda_text=true;
        this.current_message='';
       
        while(cont<200&&queda_text){
            if(this.full_message[this.ini].contador>=this.full_message[this.ini].textoSplit.length){
                queda_text=false;
            }else{
                
                cont+= this.full_message[this.ini].textoSplit[this.full_message[this.ini].contador].length+1;
               
                if(cont<200){
                    this.current_message+=this.full_message[this.ini].textoSplit[this.full_message[this.ini].contador]+' '; 
                    this.full_message[this.ini].contador+=1;
                    
                } 
            }  
        }
    }
        
}


