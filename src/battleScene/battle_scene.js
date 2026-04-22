import Phaser from 'phaser';
import BattleManager from './battle_manager.js';
import GameManager from '../manager.js';
import { HABILITIES } from './habilities.js';
import { ITEM_TYPES } from '../item/item_types.js';
import SkillMenu from './skill_menu.js';
import BagMenu from './bag_menu.js';
import ActionMenu from './action_menu.js';

/**
 * BattleScene
 * -----------
 * Escena de combate por turnos basada en velocidad.
 */
export default class BattleScene extends Phaser.Scene {

    constructor() {
        super({ key: 'battle_scene' });
    }

    init(data) {
        const gm = GameManager.getInstance();
        const allNames = Object.keys(gm.playerStats);
        this._playerStats = gm.getPlayersForBattle(gm.ActualPlayers);

        this.npcid = data.npcid;
        this.nivel = data.nivel;

        // Si es un combate contra un enemigo concreto, usar los datos recibidos.
        if (data && data.enemyName) {
            this._enemiesStats = [{
                name: data.enemyName,
                hp: data.enemyHP,
                maxHp: data.enemyMaxHp,
                damage: data.enemyDamage,
                spriteKey: data.enemySpriteKey ?? 'toybatalla',
                speed: data.enemySpeed,
                defense: data.enemyDefense,
                mp: data.enemyMp,
                maxMp: data.enemyMaxMp,
                habilidades: data.enemyHabilidades,
                objeto: data.enemyObjeto
            }];
        } else if (data && data.enemies) {
            this._enemiesStats = data.enemies;
        } else {
            this._enemiesStats = this.generarGrupoEnemigos(gm);
        }

        this._originScene = data?.originScene ?? 'level';
    }

    generarGrupoEnemigos(gm) {
        // 1. Determinar cuántos enemigos habrá (1 a 4)
        const cantidad = this.getCanitdadEnemigosAleatoria();
        const grupo = [];

        // 2. Generar cada enemigo individualmente
        for (let i = 0; i < cantidad; i++) {
            grupo.push(this.generarEnemigoAleatorio(gm, cantidad));
        }

        return grupo;
    }

    getCanitdadEnemigosAleatoria() {
        const n = Math.random();

        if (n < 0.40) return 1;
        if (n < 0.70) return 1;
        if (n < 0.90) return 1;
        return 1;
    }

    generarEnemigoAleatorio(gm, cantidad) {
        const nombresEquipo = Object.keys(gm.playerStats);
        const nombreAzar = nombresEquipo[Math.floor(Math.random() * nombresEquipo.length)];
        const ref = gm.playerStats[nombreAzar];

        const variacion = () => Math.floor(Math.random() * 0.2) + 0.9;

        const calculadoMaxHp = Math.max(1, ref.maxHp * variacion());
        const calculadoMaxMp = Math.max(1, ref.maxMp * variacion());
        const calculadoBaseDamage = Math.max(1, ref.damage * variacion());
        const calculadoBaseSpeed = Math.max(1, ref.speed * variacion());
        const calculadoBaseDefense = Math.max(1, ref.defense * variacion());

        return {
            name: `Toy Salvaje`,
            maxHp: calculadoMaxHp,
            hp: calculadoMaxHp,
            baseDamage: calculadoBaseDamage,
            damage: calculadoBaseDamage,
            baseSpeed: calculadoBaseSpeed,
            speed: calculadoBaseSpeed,
            baseDefense: calculadoBaseDefense,
            defense: calculadoBaseDefense,
            baseLuck: ref.luck,
            maxMp: calculadoMaxMp,
            mp: calculadoMaxMp,
            luck: ref.luck,
            spriteKey: 'toy',
            expReward: Math.floor(50 / cantidad),
            moneyReward: Math.floor((20 + Math.random() * 20) / cantidad),
            // Llamamos a la nueva función para obtener 2 habilidades aleatorias
            habilidades: this.obtenerHabilidadesAleatorias(2),
            objeto: this.obtenerObjetoAleatorio()
        };
    }

    /**
 * Selecciona un objeto de tipo 'equipment' aleatoriamente del diccionario ITEM_TYPES.
 * @param {number} probabilidad - Valor entre 0 y 1 (ej: 0.3 para un 30% de éxito).
 * @returns {Object|null} El objeto de equipo o null si no hubo suerte.
 */
    obtenerObjetoAleatorio(probabilidad) {
        if (Math.random() > probabilidad) {
            return '';
        }
        const equiposDisponibles = Object.values(ITEM_TYPES).filter(item => {
            return item.type === 'equipment';
        });

        if (equiposDisponibles.length === 0) {
            console.warn("No se encontraron objetos de tipo 'equipment' en ITEM_TYPES.");
            return '';
        }

        const indiceAzar = Math.floor(Math.random() * equiposDisponibles.length);
        const itemElegido = equiposDisponibles[indiceAzar];

        return { ...itemElegido };
    }

    obtenerHabilidadesAleatorias(num) {
        const todasLasKeys = Object.keys(HABILITIES);
        const mezcladas = todasLasKeys.sort(() => 0.5 - Math.random());
        return mezcladas.slice(0, num);
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this._actionState = 'IDLE';
        this._currentSkill = null;
        this._currentItem = null;

        this.battle_manager = new BattleManager(this._playerStats, this._enemiesStats, this, this.npcid, this.nivel);
        this.battle_manager.setCallbacks({
            onPlayerTurnStarted: (idx) => this._onPlayerTurnStarted(idx),
            onPlayerActionResult: (r) => this._onPlayerActionResult(r),
            onEnemyActionResult: (r) => this._onEnemyActionResult(r),
            onBattleEnd: (r) => this._onBattleEnd(r),
            onMessage: (m) => this._setMessage(m),
            onTurnChanged: (p) => this._updateTurnIndicator(p),
            onReadyForNextTurn: (fn) => this._scheduleNextTurn(fn)
        });

        this._buildBackground(W, H);
        this._buildPlayerSprites();
        this._buildEnemiesSprites();
        this._buildTurnIndicator();
        this._buildMessageBox(H);
        this._buildActionIndicator();

        // Inicializar menú de acciones principal
        this.actionMenu = new ActionMenu(this, this.battle_manager, {
            onAttack: () => this._onAttackIntent(),
            onSkills: () => this._onSkillsIntent(),
            onBag: () => this._onBagIntent(),
            onGuard: () => {
                this._cancelAllMenus();
                this.battle_manager.onGuard();
            },
            onFlee: () => {
                this._cancelAllMenus();
                this.battle_manager.onFlee();
            }
        });

        // Inicializar menú de habilidades externo
        this.skillMenu = new SkillMenu(this,
            (skillId) => this._onSkillSelectedExternal(skillId),
            () => this._onSkillMenuCancelExternal()
        );

        // Inicializar menú de mochila externo
        this.bagMenu = new BagMenu(this,
            (item) => this._onItemSelectedExternal(item),
            () => this._onBagMenuCancelExternal()
        );

        // Ocultar botones al inicio
        this.actionMenu.setVisibility(false);

        // Iniciar combate
        this.battle_manager.startBattle();

        this.music_battle = this.sound.add('music_battle');
        this.music_battle.play();

    }

    // ── UI Building ───────────────────────────────────────────────────────────

    _buildBackground(W, H) {
        this.add.image(W / 2, H / 2, 'fondoCombate').setDisplaySize(W, H).setDepth(-1);
        this.add.image(W / 2, H / 2, 'battleUI').setDisplaySize(W, H).setDepth(0);
    }

    _buildPlayerSprites() {
        this._playerSprites = [];
        this._playerHUDs = [];
        const players = this.battle_manager.getAllPlayers();

        // Mapeo de sprites específicos de batalla
        const battleKeys = ['prota_battle', 'player2_battle', 'player3_battle', 'player4_battle'];

        const startX = 293;
        const startY = 500;
        const offsetX = 210;
        const BAR_W = 189;
        const BAR_H = 10;

        players.forEach((player, index) => {
            const x = startX + (index * offsetX);
            const y = startY;

            const key = battleKeys[index];

            const sprite = this.add.sprite(x, y, key)
                .setDepth(2)
                .setInteractive({ useHandCursor: true });

            sprite.on('pointerdown', () => this._onSpriteClicked('player', index));

            const hpFill = this.add.rectangle(x - BAR_W / 2, y + 107, BAR_W, BAR_H, 0x22dd22)
                .setOrigin(0, 0.5).setDepth(5);

            const mpFill = this.add.rectangle(x - BAR_W / 2, y + 128, BAR_W, BAR_H, 0x2266ff)
                .setOrigin(0, 0.5).setDepth(5);

            this._playerSprites.push(sprite);
            this._playerHUDs.push({ hpFill, mpFill, player, barWidth: BAR_W });
        });

        this._updatePlayerHUDs();
    }

    _buildEnemiesSprites() {
        const W = this.scale.width;
        this._enemySprites = [];
        this._enemyHUDs = [];

        const enemies = this.battle_manager.getEnemies();
        const count = enemies.length;
        const spacing = 180;
        const startX = (W / 2) - (((count - 1) * spacing) / 2);

        enemies.forEach((enemy, index) => {
            const x = startX + (index * spacing);
            const y = 155;

            const sprite = this.add.image(x, y, enemy.spriteKey)
                .setScale(1) // el originial era 4
                .setDepth(2)
                .setInteractive({ useHandCursor: true });

            sprite.on('pointerdown', () => this._onSpriteClicked('enemy', index));

            const BAR_W = 120;
            const BAR_H = 12;
            const yInfo = y + 155;

            this.add.rectangle(x, yInfo, BAR_W, BAR_H, 0x000000)
                .setDepth(4).setAlpha(0.6);

            const hpFill = this.add.rectangle(x - BAR_W / 2, yInfo, BAR_W, BAR_H, 0x22dd22)
                .setOrigin(0, 0.5).setDepth(5);

            this._enemySprites.push(sprite);
            this._enemyHUDs.push({ hpFill, enemy, barWidth: BAR_W });
        });

        this._updateEnemiesHP();
    }

    _buildTurnIndicator() {
        // Marcador de turno: un sprite que tomará la forma del personaje activo
        // Se coloca detrás (depth 1) y con un tinte amarillo
        this._turnGlow = this.add.sprite(-500, -500, '__WHITE')
            .setDepth(1)
            .setAlpha(0)
            .setTintFill(0xffff00);

        this.tweens.add({
            targets: this._turnGlow,
            alpha: 0.7,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    _buildActionIndicator() {
        // En lugar de hacer el tween directamente sobre los objetos (lo que bloqueaba su posición Y),
        // los metemos en un contenedor. Movemos el contenedor y el tween anima los objetos por dentro.
        this._actionIndicatorContainer = this.add.container(0, 0)
            .setDepth(20)
            .setVisible(false);

        this._actionIndicatorCircle = this.add.circle(0, 0, 22, 0xffffff, 1);

        this._actionIndicatorStroke = this.add.circle(0, 0, 22)
            .setStrokeStyle(3, 0x000000);

        this._actionIndicatorText = this.add.text(0, 0, '', { fontSize: '24px', fontFamily: 'Arial' })
            .setOrigin(0.5);

        this._actionIndicatorContainer.add([this._actionIndicatorCircle, this._actionIndicatorStroke, this._actionIndicatorText]);

        // Pequeña animación de flotación sobre los elementos DENTRO del contenedor
        this.tweens.add({
            targets: [this._actionIndicatorCircle, this._actionIndicatorStroke, this._actionIndicatorText],
            y: -5,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    _updateActionIndicator() {
        if (!this._actionIndicatorContainer) return;

        const participant = this.battle_manager.getActiveParticipant();
        if (!participant || participant.type !== 'player') {
            this._actionIndicatorContainer.setVisible(false);
            return;
        }

        const spr = this._playerSprites[participant.index];
        if (!spr) return;

        const x = spr.x - 90;
        // Calculamos la posición encima de la cabeza, lo cual se adapta a la altura (displayHeight) de CADA personaje!
        const y = spr.y - spr.displayHeight / 2 + 10;

        let show = false;
        let symbol = '';
        let bgColor = 0xffffff;

        if (this._actionState === 'SELECTING_TARGET_ATTACK') {
            show = true;
            symbol = '⚔️';
            bgColor = 0xff4444; // Rojo para ataque
        } else if (this._actionState === 'SELECTING_TARGET_SKILL') {
            show = true;
            const skill = HABILITIES[this._currentSkill];
            if (skill) {
                if (skill.type === 'heal' || skill.type === 'buff') {
                    symbol = '✚';
                    bgColor = 0x44ff44; // Verde para curas y buffs
                } else if (skill.type === 'nerf') {
                    symbol = '🔻'; // Flecha hacia abajo para nerfs
                    bgColor = 0x081A41;
                } else {
                    symbol = '✨'; // Estrella mágica para habilidades de daño
                    bgColor = 0xcc44ff; // Naranja para habilidades de daño
                }
            }
        } else if (this._actionState === 'SELECTING_TARGET_ITEM') {
            show = true;
            symbol = '🎒';
            bgColor = 0x44aaff; // Azul para items
        }

        if (show) {
            this._actionIndicatorContainer.setPosition(x, y).setVisible(true);
            this._actionIndicatorCircle.setFillStyle(bgColor);
            this._actionIndicatorText.setText(symbol);
        } else {
            this._actionIndicatorContainer.setVisible(false);
        }
    }


    _buildMessageBox(H) {
        const W = this.scale.width;

        // Panel grande sobre los botones (parte inferior de la pantalla)
        const panelX = W / 2;
        const panelY = H - 240;
        const panelW = W - 200;
        const panelH = 80;

        //DISEÑO DE LA CAJA DE MENSAJES
        // Sombra exterior
        this._msgBoxShadow = this.add.rectangle(panelX + 4, panelY + 4, panelW, panelH, 0x000000, 0.55)
            .setOrigin(0.5, 1).setDepth(19).setVisible(false);

        // Fondo principal oscuro con borde dorado
        this._msgBoxBg = this.add.rectangle(panelX, panelY, panelW, panelH, 0x0d0d1a, 0.95)
            .setStrokeStyle(3, 0xf0c040)
            .setOrigin(0.5, 1).setDepth(20).setVisible(false);

        // Texto del mensaje — centrado dentro del panel
        this._msgText = this.add.text(panelX, panelY - panelH + 12, '', {
            fontFamily: 'SFDistantGalaxy, monospace',
            fontSize: '16px',
            fill: '#f5e6c8',
            wordWrap: { width: panelW - 40 },
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5, 0).setDepth(21).setVisible(false);

        // Indicador "pulsa ESPACIO/ENTER" parpadeante
        this._msgContinue = this.add.text(panelX + panelW / 2 - 20, panelY - 18, '▼ CONTINÚA', {
            fontFamily: 'SFDistantGalaxy, monospace',
            fontSize: '11px',
            fill: '#f0c040'
        }).setOrigin(1, 1).setDepth(21).setVisible(false);

        this.tweens.add({
            targets: this._msgContinue,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Estado interno del diálogo — resetear completamente en cada create()
        this._dialogPending = false;
        this._typewriterEvent = null;
        this._autoCloseEvent = null;
        this._fullMessage = '';
        this._dialogCallback = null;

        // ── Teclas de confirmación ──────────────────────────────────────────────
        // Pondremos las que queramos
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        const handleConfirm = () => {
            if (!this._dialogPending) return;

            // 1ª pulsación: si el typewriter corre, completar el texto
            if (this._typewriterEvent) {
                this._typewriterEvent.remove(false);
                this._typewriterEvent = null;
                this._msgText.setText(this._fullMessage);
                this._msgContinue.setVisible(true);
                return;
            }

            // Texto ya completo: cerrar el panel y ejecutar la acción pendiente
            this._dialogPending = false;
            this._msgBoxBg.setVisible(false);
            this._msgBoxShadow.setVisible(false);
            this._msgText.setVisible(false);
            this._msgContinue.setVisible(false);

            if (this._dialogCallback) {
                const cb = this._dialogCallback;
                this._dialogCallback = null;
                cb();
            }
        };

        spaceKey.on('down', handleConfirm);
        enterKey.on('down', handleConfirm);
    }

    // ── Acciones desde Menús ──────────────────────────────────────────────────

    _cancelAllMenus() {
        if (this.skillMenu) this.skillMenu.hide();
        if (this.bagMenu) this.bagMenu.hide();
        this._actionState = 'IDLE';
        this._currentSkill = null;
        this._currentItem = null;
        this._updateActionIndicator();
    }

    _onAttackIntent() {
        if (this._actionState === 'SELECTING_TARGET_ATTACK') {
            this._cancelAllMenus();
        } else {
            this._cancelAllMenus();
            this._actionState = 'SELECTING_TARGET_ATTACK';
            this._updateActionIndicator();
        }
    }

    _onSkillsIntent() {
        if (this._actionState === 'SELECTING_SKILL' || this._actionState === 'SELECTING_TARGET_SKILL') {
            this._cancelAllMenus();
        } else {
            this._cancelAllMenus();
            const participant = this.battle_manager.getActiveParticipant();
            const player = participant.data;
            if (!player.habilidades || player.habilidades.length === 0) {
                this._setMessage("No tienes habilidades disponibles.");
                return;
            }
            this._actionState = 'SELECTING_SKILL';
            this._updateActionIndicator();
            this.skillMenu.show(player.habilidades);
        }
    }

    _onSkillMenuCancelExternal() {
        if (this._actionState === 'SELECTING_SKILL') {
            this._actionState = 'IDLE';
            this._updateActionIndicator();
        }
    }

    _onSkillSelectedExternal(skillId) {
        if (this._actionState !== 'SELECTING_SKILL') return;

        this._currentSkill = skillId;
        const skill = HABILITIES[this._currentSkill];

        const participant = this.battle_manager.getActiveParticipant();

        if (skill && skill.targetType === 'self') {
            this._actionState = 'IDLE';
            this._updateActionIndicator();
            this.battle_manager.onSkill(this._currentSkill, participant.type, participant.index);
            this._currentSkill = null;
        } else {
            this._actionState = 'SELECTING_TARGET_SKILL';
            this._updateActionIndicator();
        }
    }

    _onBagIntent() {
        if (this._actionState === 'SELECTING_ITEM' || this._actionState === 'SELECTING_TARGET_ITEM') {
            this._cancelAllMenus();
        } else {
            this._cancelAllMenus();
            const gm = GameManager.getInstance();
            if (!gm.backpack || gm.backpack.filter(i => i.type === 'consumable' && i.quantity > 0).length === 0) {
                this._setMessage("No tienes objetos utilizables.");
                return;
            }
            this._actionState = 'SELECTING_ITEM';
            this._updateActionIndicator();
            this.bagMenu.show(gm.backpack);
        }
    }

    _onBagMenuCancelExternal() {
        if (this._actionState === 'SELECTING_ITEM') {
            this._actionState = 'IDLE';
            this._updateActionIndicator();
        }
    }

    _onItemSelectedExternal(item) {
        if (this._actionState !== 'SELECTING_ITEM') return;

        this._currentItem = item;
        this._actionState = 'SELECTING_TARGET_ITEM';
        this._updateActionIndicator();
    }

    // ── Callbacks ─────────────────────────────────────────────────────────────

    _onSpriteClicked(type, index) {
        if (this._actionState === 'SELECTING_TARGET_ATTACK') {
            if (type === 'enemy') {
                const enemies = this.battle_manager.getEnemies();
                if (enemies[index].isDead) {
                    this._setMessage("¡Ese enemigo ya está derrotado!");
                    return;
                }
                this._actionState = 'IDLE';
                this._updateActionIndicator();
                this.battle_manager.onAttack(index);
            } else {
                this._setMessage("¡No puedes atacar a un aliado!");
            }
        } else if (this._actionState === 'SELECTING_TARGET_SKILL') {
            const skill = HABILITIES[this._currentSkill];

            if (skill.type === 'heal' && type === 'enemy') {
                this._setMessage("¡No puedes curar a un enemigo!");
                return;
            }
            if (skill.type === 'buff' && type === 'enemy') {
                this._setMessage("¡No puedes mejorar a un enemigo!");
                return;
            }
            if (skill.type === 'damage' && type === 'player') {
                this._setMessage("¡No puedes atacar a un aliado!");
                return;
            }
            if (skill.type === 'nerf' && type === 'player') {
                this._setMessage("¡No puedes debilitar a un aliado!");
                return;
            }
            if ((skill.type === 'damage+nerf' || skill.type === 'damage+buff') && type === 'player') {
                this._setMessage("¡Esta habilidad solo se puede usar contra enemigos!");
                return;
            }

            const targetList = type === 'enemy' ? this.battle_manager.getEnemies() : this.battle_manager.getAllPlayers();
            if (targetList[index].isDead) {
                this._setMessage("¡Ese objetivo ya está derrotado!");
                return;
            }
            this._actionState = 'IDLE';
            this._updateActionIndicator();
            this.battle_manager.onSkill(this._currentSkill, type, index);
            this._currentSkill = null;
        } else if (this._actionState === 'SELECTING_TARGET_ITEM') {
            if (type === 'enemy') {
                this._setMessage("¡Los objetos solo se pueden usar en aliados!");
                return;
            }

            const targetList = this.battle_manager.getAllPlayers();
            if (targetList[index].isDead) {
                this._setMessage("¡Ese objetivo ya está derrotado!");
                return;
            }
            this._actionState = 'IDLE';
            this._updateActionIndicator();
            this.battle_manager.onItem(this._currentItem, type, index);
            this._currentItem = null;
        }
    }

    _updateTurnIndicator(participant) {
        let targetSprite = null;

        if (participant.type === 'player') {
            targetSprite = this._playerSprites[participant.index];
            this._updatePlayerHUDs();
        } else {
            targetSprite = this._enemySprites[participant.index];
            this.actionMenu.setVisibility(false);
        }

        if (this._turnGlow && targetSprite) {
            // Sincronizar textura y forma
            this._turnGlow.setTexture(targetSprite.texture.key, targetSprite.frame.name);
            this._turnGlow.setPosition(targetSprite.x, targetSprite.y);

            // Un poco más grande que el original para que asome por detrás
            this._turnGlow.setScale(targetSprite.scaleX * 1.1, targetSprite.scaleY * 1.05);
            this._turnGlow.setFlipX(targetSprite.flipX);
            this._turnGlow.setRotation(targetSprite.rotation);

            this._turnGlow.setVisible(true);
        } else if (this._turnGlow) {
            this._turnGlow.setVisible(false);
        }
    }

    _onPlayerTurnStarted(idx) {
        this.actionMenu.setVisibility(true);
    }

    _onPlayerActionResult(result) {
        this.actionMenu.setVisibility(false);

        let msg = result.message;
        if (!msg) {
            const player = this.battle_manager.getActiveParticipant().data;
            if (result.targetType === 'player') {
                msg = `¡${result.actionName} de ${player.name} sobre un aliado!\n${result.heal ? `Cura ${result.heal} HP.` : ''}`;
            } else {
                msg = `¡${result.actionName} de ${player.name}!\nCausa ${result.damage} de daño.`;
            }
        }

        if (result.isCrit) {
            msg += '\n¡GOLPE CRÍTICO!';
        }

        if (result.targetType === 'enemy' && this._enemySprites[result.targetIndex]) {
            const enemySpr = this._enemySprites[result.targetIndex];
            // Animaciones sobre el enemigo
            if (result.damage) {
                this._shakeSprite(enemySpr);
            }
            if (result.nerf) {
                const stat = this._getStatName(result.nerf.stat);
                this._nerfAnimation(enemySpr);
                this._showFloatingText(enemySpr, `${stat} -${result.nerf.amount}`, '#cc44ff');
            }
        } else if (result.targetType === 'player' && this._playerSprites[result.targetIndex]) {
            const spr = this._playerSprites[result.targetIndex];

            if (result.actionName === 'Guardia') {
                this._shieldAnimation(spr);
                this._showFloatingText(spr, 'DEFENSA', '#44aaff');
            } else if (result.actionName === 'Objeto' && result.usedItem) {
                let color = 0x22dd22;
                let text = '';
                let textCol = '#22dd22';

                if (result.usedItem.heal) {
                    text = `+${result.usedItem.heal} HP`;
                } else if (result.usedItem.recMp) {
                    color = 0x2266ff;
                    textCol = '#2266ff';
                    text = `+${result.usedItem.recMp} MP`;
                } else if (result.usedItem.buffAtt) {
                    color = 0xffcc00;
                    textCol = '#ffcc00';
                    text = `ATK +${result.usedItem.buffAtt}`;
                } else if (result.usedItem.buffDef) {
                    color = 0xffcc00;
                    textCol = '#ffcc00';
                    text = `DEF +${result.usedItem.buffDef}`;
                } else if (result.usedItem.buffSpd) {
                    color = 0xffcc00;
                    textCol = '#ffcc00';
                    text = `VEL +${result.usedItem.buffSpd}`;
                }

                this._powerUpSprite(spr, color);
                this._showFloatingText(spr, text, textCol);
            } else if (result.heal) {
                this._powerUpSprite(spr, 0x22dd22);
                this._showFloatingText(spr, `+${result.heal} HP`, '#22dd22');
            } else if (result.buff) {
                const stat = this._getStatName(result.buff.stat);
                this._powerUpSprite(spr, 0xffcc00);
                this._showFloatingText(spr, `${stat} +${result.buff.amount}`, '#ffcc00');
            } else if (result.nerf) {
                const stat = this._getStatName(result.nerf.stat);
                this._nerfAnimation(spr);
                this._showFloatingText(spr, `${stat} -${result.nerf.amount}`, '#cc44ff');
            } else {
                this._powerUpSprite(spr, 0xffffff);
            }
        }

        // Si la habilidad dio buff al jugador atacante (ej: Golpe Vigorizante)
        if (result.buff && result.attackerIndex !== undefined && this._playerSprites[result.attackerIndex] && result.targetType !== 'player') {
            const attackerSpr = this._playerSprites[result.attackerIndex];
            const stat = this._getStatName(result.buff.stat);
            this._powerUpSprite(attackerSpr, 0xffcc00);
            this._showFloatingText(attackerSpr, `${stat} +${result.buff.amount}`, '#ffcc00');
        }

        this._updateEnemiesHP();
        this._updatePlayerHUDs();

        this._setMessage(msg);
    }

    _onEnemyActionResult(result) {
        // Guardia del enemigo: animación de escudo sobre su propio sprite
        if (result.isGuard) {
            const enemySpr = this._enemySprites[result.guardEnemyIndex];
            if (enemySpr) {
                this._shieldAnimation(enemySpr);
                this._showFloatingText(enemySpr, 'DEFENSA', '#44aaff');
            }
            this._setMessage(result.message || `${result.targetName} se defiende.`);
            return;
        }

        let targetType = result.targetType ?? 'player';
        let targetIdx = result.targetIndex ?? -1;

        if (targetIdx === -1 && targetType === 'player') {
            const players = this.battle_manager.getAllPlayers();
            targetIdx = players.findIndex(p => p.name === result.targetName);
        }

        const targetSpr = (targetType === 'player') ? this._playerSprites[targetIdx] : this._enemySprites[targetIdx];

        if (targetSpr) {
            // Animación de daño
            if (result.damage > 0) {
                this._shakeSprite(targetSpr);
            }

            // Animación de nerf
            if (result.nerf) {
                const stat = this._getStatName(result.nerf.stat);
                this._nerfAnimation(targetSpr);
                this._showFloatingText(targetSpr, `${stat} -${result.nerf.amount}`, '#cc44ff');
            }

            // Animación de buff
            if (result.buff) {
                // Si es una habilidad que debilita al rival pero potencia al atacante (ej: Golpe Vigorizante)
                // la animación del buff debe ir al enemigo, no al jugador.
                const isAttackerBuff = result.damage > 0; // En este sistema, si hay daño y buff, el buff es para el atacante
                const buffStat = this._getStatName(result.buff.stat);

                if (isAttackerBuff && result.attackerIndex !== undefined && this._enemySprites[result.attackerIndex]) {
                    const attackerSpr = this._enemySprites[result.attackerIndex];
                    this._powerUpSprite(attackerSpr, 0xffcc00);
                    this._showFloatingText(attackerSpr, `${buffStat} +${result.buff.amount}`, '#ffcc00');
                } else {
                    this._powerUpSprite(targetSpr, 0xffcc00);
                    this._showFloatingText(targetSpr, `${buffStat} +${result.buff.amount}`, '#ffcc00');
                }
            }
            // Animación de curación
            if (result.heal) {
                this._powerUpSprite(targetSpr, 0x22dd22);
                this._showFloatingText(targetSpr, `+${result.heal} HP`, '#22dd22');
            }
        }

        this._updatePlayerHUDs();
        this._updateEnemiesHP();

        // Usar el mensaje de la habilidad si existe, o construir uno genérico
        let msg = result.message
            || `${result.actionName} contra ${result.targetName}.\n¡Causa ${result.damage} de daño!`;

        if (result.isCrit) msg += '\n¡GOLPE CRÍTICO!';

        this._setMessage(msg);
    }

    _onBattleEnd(result) {
        // Limpiar cualquier diálogo pendiente
        this._dialogPending = false;
        this._dialogCallback = null;
        if (this._typewriterEvent) { this._typewriterEvent.remove(false); this._typewriterEvent = null; }
        if (this._autoCloseEvent) { this._autoCloseEvent.remove(false); this._autoCloseEvent = null; }

        const msg = result.winner === 'player' ? '¡VICTORIA!' : result.winner === 'enemy' ? 'DERROTA...' : 'Has huido.';
        this._setMessage(msg);
        this.time.delayedCall(2000, () => {
            this.music_battle.stop();
            this.scene.start(this._originScene);
        });
    }

    // ── Updates ───────────────────────────────────────────────────────────────

    _updatePlayerHUDs() {
        if (!this._playerHUDs) return;
        this._playerHUDs.forEach((hud, index) => {
            const hpPct = hud.player.hpPercent;
            const mpPct = hud.player.mpPercent;

            hud.hpFill.displayWidth = hpPct * hud.barWidth;
            hud.hpFill.setFillStyle(this._hpColor(hpPct));

            hud.mpFill.displayWidth = mpPct * hud.barWidth;

            if (hud.player.isDead && this._playerSprites[index]) {
                this._playerSprites[index].setAlpha(0.2);
                hud.hpFill.setAlpha(0.2);
                hud.mpFill.setAlpha(0.2);
            }
        });
    }

    _updateEnemiesHP() {
        if (!this._enemyHUDs) return;
        this._enemyHUDs.forEach((hud, index) => {
            const pct = hud.enemy.hp / hud.enemy.maxHp;
            const actualPct = Math.max(0, pct);

            hud.hpFill.displayWidth = actualPct * hud.barWidth;
            hud.hpFill.setFillStyle(this._hpColor(actualPct));

            if (hud.enemy.isDead && this._enemySprites[index]) {
                this._enemySprites[index].setAlpha(0.2);
                hud.hpFill.setAlpha(0.2);
            }
        });
    }

    // ── Utils ─────────────────────────────────────────────────────────────────

    /**
     * Muestra un mensaje con efecto typewriter en el panel de diálogo.
     * Si lleva onConfirm, espera input del jugador para continuar.
     * Si no lleva onConfirm (mensaje informativo), se cierra solo tras mostrarse.
     * @param {string} msg
     * @param {Function} [onConfirm] Callback cuando el jugador confirma.
     */
    _setMessage(msg, onConfirm) {
        if (!msg || msg.trim() === '') return;

        // Cancelar typewriter anterior si existe
        if (this._typewriterEvent) {
            this._typewriterEvent.remove(false);
            this._typewriterEvent = null;
        }
        // Cancelar auto-cierre anterior si existe
        if (this._autoCloseEvent) {
            this._autoCloseEvent.remove(false);
            this._autoCloseEvent = null;
        }

        this._fullMessage = msg;
        this._dialogPending = !!onConfirm; // solo bloquea si hay callback
        this._dialogCallback = onConfirm || null;

        // Mostrar panel
        this._msgBoxBg.setVisible(true);
        this._msgBoxShadow.setVisible(true);
        this._msgText.setText('').setVisible(true);
        this._msgContinue.setVisible(false);

        // Efecto typewriter
        let charIndex = 0;
        const chars = msg.split('');
        this._typewriterEvent = this.time.addEvent({
            delay: 28,
            repeat: chars.length - 1,
            callback: () => {
                charIndex++;
                this._msgText.setText(chars.slice(0, charIndex).join(''));
                if (charIndex >= chars.length) {
                    this._typewriterEvent = null;
                    if (onConfirm || this._dialogPending) {
                        // Mensaje con acción (o _scheduleNextTurn llegó mientras se escribía)
                        this._msgContinue.setVisible(true);
                    } else {
                        // Mensaje informativo: auto-cerrar tras 1.2s
                        this._autoCloseEvent = this.time.delayedCall(1200, () => {
                            this._msgBoxBg.setVisible(false);
                            this._msgBoxShadow.setVisible(false);
                            this._msgText.setVisible(false);
                            this._msgContinue.setVisible(false);
                            this._autoCloseEvent = null;
                        });
                    }
                }
            }
        });
        // NOTA: los listeners de teclado se registran en _buildMessageBox(),
        // no aquí, para evitar duplicados entre batallas.
    }

    /**
     * Enlaza el callback de "siguiente turno" del BattleManager al sistema de diálogo.
     * Toma el control del mensaje activo: cancela el auto-cierre y espera input del jugador.
     * @param {Function} nextTurnFn
     */
    _scheduleNextTurn(nextTurnFn) {
        // Cancelar cualquier auto-cierre pendiente
        if (this._autoCloseEvent) {
            this._autoCloseEvent.remove(false);
            this._autoCloseEvent = null;
        }

        // Guardar el callback y bloquear el diálogo
        this._dialogCallback = nextTurnFn;
        this._dialogPending = true;

        if (this._msgBoxBg.visible) {
            // Hay un mensaje abierto: si el typewriter ya acabó, mostrar indicador ahora
            if (!this._typewriterEvent) {
                this._msgContinue.setVisible(true);
            }
            // Si el typewriter aún corre, el indicador aparecerá cuando termine
            // (la lógica del typewriter comprueba _dialogPending implícitamente
            //  al revisar si hay _dialogCallback al terminar)
        } else {
            // No hay mensaje visible: mostrar el panel con indicador de continuar
            this._msgBoxBg.setVisible(true);
            this._msgBoxShadow.setVisible(true);
            this._msgText.setText('▼').setVisible(true);
            this._msgContinue.setVisible(true);
        }
    }

    _hpColor(pct) {
        if (pct > 0.5) return 0x22dd22;
        if (pct > 0.25) return 0xffcc00;
        return 0xee2222;
    }

    _getStatName(stat) {
        if (!stat) return 'STAT';
        const stats = {
            'damage': 'ATK',
            'defense': 'DEF',
            'speed': 'VEL',
            'luck': 'SUERTE'
        };
        return stats[stat] || (typeof stat === 'string' ? stat.toUpperCase() : 'STAT');
    }

    _shakeSprite(sprite) {
        if (!sprite) return;
        const ox = sprite.x;
        this.tweens.add({
            targets: sprite,
            x: ox + 12,
            duration: 80,
            yoyo: true,
            repeat: 5,
            ease: 'Sine.easeInOut',
            onComplete: () => sprite.x = ox
        });
    }

    _powerUpSprite(sprite, color) {
        if (!sprite) return;
        const oy = sprite.y;

        sprite.setTintFill(color);
        this.tweens.add({
            targets: sprite,
            y: oy - 20,
            duration: 280,
            yoyo: true,
            ease: 'Sine.easeOut',
            onComplete: () => {
                sprite.clearTint();
                sprite.y = oy;
            }
        });
    }

    _showFloatingText(sprite, text, colorStr) {
        if (!sprite) return;
        const floatText = this.add.text(sprite.x, sprite.y - 50, text, {
            fontFamily: 'SFDistantGalaxy', fontSize: '26px', fill: colorStr,
            stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5).setDepth(22);

        // Fase 1: subir rápido
        this.tweens.add({
            targets: floatText,
            y: sprite.y - 100,
            duration: 400,
            ease: 'Power2.Out',
            onComplete: () => {
                // Fase 2: quedarse visible un momento y luego desvanecerse
                this.tweens.add({
                    targets: floatText,
                    y: sprite.y - 140,
                    alpha: 0,
                    duration: 900,
                    delay: 200,
                    ease: 'Power1.In',
                    onComplete: () => floatText.destroy()
                });
            }
        });
    }

    _shieldAnimation(sprite) {
        if (!sprite) return;

        // Óvalo de escudo que aparece y luego se expande
        const shield = this.add.ellipse(sprite.x, sprite.y, sprite.displayWidth * 1.1, sprite.displayHeight * 1.3, 0x44aaff, 0.6)
            .setDepth(sprite.depth + 1);

        this.tweens.add({
            targets: shield,
            alpha: 0,
            scaleX: 1.6,
            scaleY: 1.6,
            duration: 1100,
            ease: 'Sine.easeOut',
            onComplete: () => shield.destroy()
        });

        this._powerUpSprite(sprite, 0x44aaff);
    }

    _nerfAnimation(sprite) {
        if (!sprite) return;

        // Más partículas y más lentas para que se vea mejor
        const count = 9;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 35;
            const px = sprite.x + Math.cos(angle) * radius;
            const py = sprite.y + Math.sin(angle) * radius - 10;

            const particle = this.add.circle(px, py, 6, 0xaa22ff, 0.95)
                .setDepth(sprite.depth + 2);

            this.tweens.add({
                targets: particle,
                x: sprite.x + (Math.random() - 0.5) * 30,
                y: sprite.y + 80,
                alpha: 0,
                scaleX: 0.2,
                scaleY: 0.2,
                duration: 1000 + Math.random() * 400,
                delay: i * 80,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // Tinte morado temporal sobre el sprite
        sprite.setTintFill(0xaa22ff);
        this.time.delayedCall(600, () => sprite.clearTint());
    }
}