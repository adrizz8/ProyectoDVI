import NPC from './npc.js';
import Player from './player.js';

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
    constructor(scene, player, x, y, texture, stats = {}) {
        super(scene, x, y, texture);
        
        this.player = player;
        this.stats = {
            name: stats.name ?? 'Enemigo',
            hp: stats.hp ?? 100,
            maxHp: stats.maxHp ?? 100,
            damage: stats.damage ?? 10,
            spriteKey: stats.spriteKey ?? texture
        };

        // Ponemos el NPC como interactuable
        this.scene.physics.add.collider(this, player);
    }

    /**
     * Actualización para chequear si el jugador puede interactuar con el NPC
     */
    preUpdate(t, dt) {
        super.preUpdate(t, dt);
        this.player.isinteractuable(this);
    }

    /**
     * Método que se llama cuando el jugador pulsa la tecla de interacción 'E'
     */
    interact() {
        console.log(`Iniciando combate contra ${this.stats.name}`);
        
        // Iniciamos la escena de combate pasando los parámetros necesarios
        // La escena 'battle_scene' se encarga de gestionar el combate
        this.scene.scene.start('battle_scene', {
            enemyName: this.stats.name,
            enemyHP: this.stats.hp,
            enemyMaxHp: this.stats.maxHp,
            enemyDamage: this.stats.damage,
            enemySpriteKey: this.stats.spriteKey,
            originScene: this.scene.scene.key // Para saber a dónde volver tras el combate
        });
    }
}
