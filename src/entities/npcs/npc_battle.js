import NPC from './npc.js';
import Player from '../player/player.js';
import GameManager from '../../core/manager.js';

/**
 * Clase que representa un NPC con el que se puede batallar.
 */
export default class NPCBattle extends NPC {
    /**
     * @param {Phaser.Scene} scene Escena a la que pertenece
     * @param {Player} player Jugador para la interacción
     * @param {number} x Coordenada X
     * @param {number} y Coordenada Y
     * @param {string} texture Clave de la textura 
     * @param {object} stats Estadísticas del enemigo para el combate
     */
    constructor(scene, player, x, y, texture, frame, stats = {}, message = "", onFinish = null, itemId = null, NpcId = '', Nivel = null, Tutorial = false) {
        const name = stats.name ?? 'Enemigo';
        super(scene, player, x, y, texture, frame, message, onFinish, itemId, name);

        this.id = NpcId;
        this.nivel = Nivel;
        this.Tutorial = Tutorial;

        this.stats = {
            name: name,
            hp: stats.hp,
            maxHp: stats.maxHp,
            damage: stats.damage,
            spriteKey: stats.spriteKey ?? texture,
            scale: stats.scale,
            speed: stats.speed,
            defense: stats.defense,
            mp: stats.mp,
            maxMp: stats.maxMp,
            habilidades: stats.habilidades,
            objeto: stats.objeto,
            expReward: stats.expReward,
            moneyReward: stats.moneyReward
        };
    }

    /**
     * Reacción al interactuar: muestra diálogo si existe y luego inicia combate
     */
    interact() {
        const gm = GameManager.getInstance();

        if (this.id == '' || !gm.isDefeated(this.id)) {
            if (this.message) {
                this.say(this.message, () => this.startBattle());
            } else {
                this.startBattle();
            }
        } else {
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

        this.player.frozen = true;

        // Transición intensa (Parpadeo/Flash)
        const cam = this.scene.cameras.main;
        
        // Secuencia de parpadeo
        this.scene.tweens.add({
            targets: cam,
            alpha: 0.5,
            duration: 50,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                cam.flash(500, 255, 255, 255);
                cam.fadeOut(500, 0, 0, 0);
                cam.once('camerafadeoutcomplete', () => {
                    this.scene.scene.start('battle_scene', {
                        enemyName: this.stats.name,
                        enemyHP: this.stats.hp,
                        enemyMaxHp: this.stats.maxHp,
                        enemyDamage: this.stats.damage,
                        enemySpriteKey: this.stats.spriteKey,
                        enemyScale: this.stats.scale,
                        enemySpeed: this.stats.speed,
                        enemyDefense: this.stats.defense,
                        enemyMp: this.stats.mp,
                        enemyMaxMp: this.stats.maxMp,
                        enemyHabilidades: this.stats.habilidades,
                        enemyObjeto: this.stats.objeto,
                        enemyExpReward: this.stats.expReward,
                        enemyMoneyReward: this.stats.moneyReward,
                        originScene: this.scene.scene.key, 
                        npcid: this.id,
                        nivel: this.nivel,
                        Tutorial: this.Tutorial
                    });
                });
            }
        });
    }
}
