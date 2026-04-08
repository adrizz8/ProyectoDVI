import NPCBattle from './npc_battle';

/**
 * Clase que representa el jugador del juego. El jugador se mueve por el mundo usando los cursores.
 * También almacena la puntuación o número de estrellas que ha recogido hasta el momento.
 */



export default class cafeteria_loco extends NPCBattle {

    constructor(scene, player, x, y, texture,frame, stats = {}, message = null, onFinish = null, itemId = null,NpcId) {
        super(scene, player, x, y, texture,frame, stats , message , onFinish , itemId,NpcId);



        this.body.setSize(this.width, this.height);
        
        this.body.moves = true;
        this.speed = 200;
    }
    preUpdate(t, dt) {
        super.preUpdate(t, dt);


        if (this.x - this.width > this.scene.physics.world.bounds.x + this.scene.physics.world.bounds.width) {
            this.scene.unfreeze();
            this.destroy();
        }
    }

    huir(){
        this.body.setVelocityX(this.speed);
    }

}