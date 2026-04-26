import NPCBattle from './npc_battle.js';
import GameManager from '../manager.js';

/**
 * Clase que representa al conserje (jefe de la cafetería).
 */
export default class conserje extends NPCBattle {

    constructor(scene, player, x, y, texture, frame, stats = {}, message = null, onFinish = null, itemId = null, NpcId) {
        super(scene, player, x, y, texture, frame, stats, message, onFinish, itemId, NpcId);

        this.body.setSize(this.width, this.height);
        this.body.moves = true;
        this.speed = 200;
    }

    /**
     * Override de interact para bloquear el combate hasta que se derroten los otros NPCs
     * y se reclute al amigo (P1).
     */
    interact() {
        const gm = GameManager.getInstance();

        // Si ya está derrotado, solo habla (lógica de NPCBattle)
        if (this.id !== '' && gm.isDefeated(this.id)) {
            super.interact();
            return;
        }

        // Bloqueo de progresión: hay que derrotar al loco primero, y reclutar a P1
        const locoDerrotado = gm.isDefeated('npc_loco_caf');

        const p1Unido = gm.ActualPlayers.includes('Jugador2');

        if (!p1Unido) {
            this.say("¿Piensas enfrentarte a mí tú solo? Je... ingenuo. Se nota que eres nuevo. Busca refuerzos en la cafetería, alguien con un poco más de 'experiencia' académica, antes de volver a molestarme.");
            return;
        }

        if (!locoDerrotado) {
            this.say("¡Eh, tú! No pienses que vas a pasar tan fácilmente. Primero demuéstrame que puedes con ese alborotador de ahí fuera. ¡Vuelve cuando lo hayas 'debugeado'!");
            return;
        }

        // Si se cumplen todos los requisitos, procedemos al combate normal
        super.interact();
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