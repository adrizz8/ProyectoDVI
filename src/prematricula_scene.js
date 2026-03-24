import Phaser from "phaser";
import DialogueManager from "./dialogueManager";

export default class prematricula_scene extends Phaser.Scene {


    constructor() {
        super({ key: 'prematricula' });
    }

     create() {

        var dialogM = new DialogueManager(this);

        dialogM.showDialogue("Todo comenzó un lunes a las 8:00 AM. La Facultad de Informática iba a estrenar el nuevo sistema de gestión académica: automatrícula 2.0 .-"+ 
                            "Prometían que nunca más se caería la web para matricularte... Mentira."+
                            "A pesar de todo por suerte o por desgracia conseguí inscribirme en la carrera: ",
                            () => {
                                this.time.addEvent({
                                    delay: 400, // ms
                                    callback:() => {
                                         this.scene.start('level3')
                                    }
                                });        
                            });

     }

}