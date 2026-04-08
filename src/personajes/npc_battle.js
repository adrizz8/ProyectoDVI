import NPC from './npc.js';
import Player from './player.js';
import GameManager from '../manager.js';

/**
 * Clase que representa un NPC con el que se puede batallar.
 */
export default class NPCBattle extends NPC {
    /**
     * @param {Phaser.Scene} scene Escena a la que pertenece
     * @param {Player} player Jugador para la interacción
     * @param {number} x Coordenada X
     * @param {number} y Coordenada Y
     * @param {string} texture Clave de la textura (podría ser 'toy' o el que asignes)
     * @param {object} stats Estadísticas del enemigo para el combate
     */
    constructor(scene, player, x, y, texture,frame, stats = {}, message = null, onFinish = null, itemId = null, NpcId='', Nivel=null) {
        const name = stats.name ?? 'Enemigo';
        super(scene, player, x, y, texture,frame, message, onFinish, itemId, name);

        this.id=NpcId;
        this.nivel=Nivel;

        this.stats = {
            name: name,
            hp: stats.hp ?? 100,
            maxHp: stats.maxHp ?? 100,
            damage: stats.damage ?? 10,
            spriteKey: stats.spriteKey ?? texture
        };
    }
    /**
     * Reacción al interactuar: muestra diálogo si existe y luego inicia combate
     */
    interact() {
        const gm = GameManager.getInstance();

        if(this.id==''||!gm.isDefeated(this.id)){
            if (this.message) {
                this.say(this.message, () => this.startBattle());
            } else {
                this.startBattle();
            }
        }else{
            if (this.message) {
                this.say(this.message);
            }
        }
    }

    /**
     * Inicia la escena de combate
     */
    startBattle() {
        console.log(`Iniciando combate contra ${this.stats.name}`);
        
        // Guardamos la posición y dirección antes de ir a batalla
        GameManager.getInstance().setPlayerPosition(this.player.x, this.player.y, this.player.lastDirection);

        this.scene.scene.start('battle_scene', {
            enemyName: this.stats.name,
            enemyHP: this.stats.hp,
            enemyMaxHp: this.stats.maxHp,
            enemyDamage: this.stats.damage,
            enemySpriteKey: this.stats.spriteKey,
            originScene: this.scene.scene.key, // Para saber a dónde volver tras el combate
            npcid: this.id,
            nivel:this.nivel
        });
    }
}
