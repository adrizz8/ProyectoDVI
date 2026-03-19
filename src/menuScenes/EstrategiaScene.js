import Phaser from 'phaser';
import GameManager from '../manager.js';
import { HABILITIES } from '../battleScene/habilities.js';

/**
 * EstrategiaScene
 * ---------------
 * Pantalla donde se visualizan los personajes con sus stats, habilidades,
 * PS (HP), PM (MP), estado y nivel.
 */
export default class EstrategiaScene extends Phaser.Scene {
    constructor() {
        super('EstrategiaScene');
    }

    create() {
        const gm = GameManager.getInstance();

        // Fondo
        this.add.rectangle(608, 320, 1216, 640, 0x222233);

        // Título
        this.add.text(608, 30, 'ESTRATEGIA', {
            fontSize: '32px',
            fill: '#f5d442',
            fontFamily: 'Distant Galaxy', 
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Obtener los personajes
        const personajes = Object.entries(gm.playerStats);
        const caracteresPorFila = 2; // Mostrar 2 personajes por fila
        const startX = 150;
        const startY = 100;
        const espacioX = 560;
        const espacioY = 340;

        // Crear cards para cada personaje
        personajes.forEach((entry, index) => {
            const [nombrePers, stats] = entry;
            const fila = Math.floor(index / caracteresPorFila);
            const columna = index % caracteresPorFila;
            const x = startX + columna * espacioX;
            const y = startY + fila * espacioY;

            this.crearCardPersonaje(x, y, nombrePers, stats);
        });

        // Instrucciones
        this.add.text(608, 620, 'Presiona ESPACIO para volver', {
            fontSize: '14px',
            fill: '#aaaaaa',
            fontFamily: 'Distant Galaxy',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Controles
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.stop();
            if (this.scene.isPaused('MenuPrincipal')) {
                this.scene.resume('MenuPrincipal');
            }
        });
    }

    /**
     * Crea una card visual para un personaje
     */
    crearCardPersonaje(x, y, nombre, stats) {
        // Fondo de card
        const cardWidth = 480;
        const cardHeight = 280;
        const card = this.add.rectangle(x + cardWidth / 2, y + cardHeight / 2, cardWidth, cardHeight, 0x1a1a2e, 0.8);
        card.setStrokeStyle(2, 0xf5d442);

        let textoY = y + 15;

        // Nombre del personaje
        this.add.text(x + 15, textoY, nombre.toUpperCase(), {
            fontSize: '16px',
            fill: '#f5d442',
            fontFamily: 'Distant Galaxy',
            fontStyle: 'bold'
        });

        // Separador
        this.add.line(x + 15, textoY + 20, x + 15, textoY + 20, x + cardWidth - 30, textoY + 20, 0xf5d442);

        textoY += 35;

        // Stats principales (HP, MP, Nivel, Velocidad)
        const statsTexto = [
            `PS: ${stats.hp}/${stats.maxHp}`,
            `PM: ${stats.mp}/${stats.maxMp}`,
            `Nivel: ${stats.level}`,
            `Defensa: ${stats.defense} | Velocidad: ${stats.baseSpeed}`
        ];

        statsTexto.forEach(stat => {
            this.add.text(x + 15, textoY, stat, {
                fontSize: '12px',
                fill: '#ffffff',
                fontFamily: 'Distant Galaxy',
                fontStyle: 'bold'
            });
            textoY += 18;
        });

        // Experiencia
        textoY += 2;
        this.add.text(x + 15, textoY, `EXP: ${stats.exp}/${stats.expNext}`, {
            fontSize: '12px',
            fill: '#90ee90',
            fontFamily: 'Distant Galaxy',
            fontStyle: 'bold'
        });

        textoY += 22;

        // Título Habilidades
        this.add.text(x + 15, textoY, 'Habilidades:', {
            fontSize: '11px',
            fill: '#87ceeb',
            fontFamily: 'Distant Galaxy',
            fontStyle: 'bold'
        });

        textoY += 16;

        // Lista de habilidades
        if (stats.habilidades && stats.habilidades.length > 0) {
            stats.habilidades.slice(0, 4).forEach(nombreHab => {
                const hab = HABILITIES[nombreHab];
                const costoMP = hab ? `(${hab.cost} MP)` : '';
                const textoHab = `• ${nombreHab} ${costoMP}`;

                this.add.text(x + 20, textoY, textoHab, {
                    fontSize: '10px',
                    fill: '#e0e0e0',
                    fontFamily: 'Distant Galaxy',
                    fontStyle: 'bold'
                });

                textoY += 14;
            });

            // Si hay más de 4 habilidades, mostrar indicador
            if (stats.habilidades.length > 4) {
                this.add.text(x + 20, textoY, `... y ${stats.habilidades.length - 4} más`, {
                    fontSize: '9px',
                    fill: '#aaaaaa',
                    fontFamily: 'Distant Galaxy',
                    fontStyle: 'bold'
                });
            }
        } else {
            this.add.text(x + 20, textoY, 'Sin habilidades', {
                fontSize: '10px',
                fill: '#aaaaaa',
                fontFamily: 'Distant Galaxy',
                fontStyle: 'bold'
            });
        }
    }

    /**
     * Formatea el nombre del personaje para que sea más legible
     */
    formatearNombre(nombre) {
        return nombre.replace(/([\d])/g, ' $1').trim();
    }
}
