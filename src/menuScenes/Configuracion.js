import Phaser from 'phaser';
import GameManager from '../manager.js';

export default class EstrategiaScene extends Phaser.Scene {
    constructor() {
        super('Configuracion');
    }

    create(data) {
        this.scene.bringToTop('Configuracion');
        this.gm = GameManager.getInstance();


        const sceneWidth = this.scale.width;
        const sceneHeight = this.scale.height;
        const centerX = sceneWidth / 2;
        const centerY = sceneHeight / 2;

        this.background = this.add.image(centerX, centerY, 'configuracion');

        this.add.text(centerX, 60, 'CONFIGURACIÓN', {
            fontSize: '48px',
            fill: '#000000',
            fontFamily: 'Pixelify Sans',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.volumeValue = this.sound.volume ?? 1;

        this.textSpeedOptions = ['Lento', 'Medio', 'Rápido'];
        this.textSpeedIndex = this.gm.TextIndex ;
        this.textSpeed = this.gm.TextMode;

        this.isFullscreenChecked = this.scale.isFullscreen;

        /*
        this.scale.on('enterfullscreen', this.handleEnterFullscreen, this);
        this.scale.on('leavefullscreen', this.handleLeaveFullscreen, this);*/


        // Volumen
        const sliderX = 760;
        const sliderY = 220;
        const sliderWidth = 550;
        const sliderHeight = 16;

        const minX = sliderX - sliderWidth / 2;
        const maxX = sliderX + sliderWidth / 2;

        this.add.text(sliderX - 430, sliderY, 'Volumen', {
            fontSize: '32px',
            fill: '#000000',
            fontFamily: 'Pixelify Sans',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.sliderBg = this.add.rectangle(
            sliderX,
            sliderY,
            sliderWidth,
            sliderHeight,
            0x333333
        ).setOrigin(0.5);

        this.sliderFill = this.add.rectangle(
            minX,
            sliderY,
            sliderWidth * this.volumeValue,
            sliderHeight,
            0x7d73ff
        ).setOrigin(0, 0.5);

        this.knob = this.add.circle(
            minX + sliderWidth * this.volumeValue,
            sliderY,
            16,
            0xffffff
        ).setInteractive({ draggable: true });

        this.input.setDraggable(this.knob);

        this.input.on('drag', (pointer, gameObject, dragX) => {
            if (gameObject !== this.knob) return;

            dragX = Phaser.Math.Clamp(dragX, minX, maxX);
            this.knob.x = dragX;

            this.volumeValue = (dragX - minX) / sliderWidth;
            this.sliderFill.width = sliderWidth * this.volumeValue;

            this.sound.volume = this.volumeValue;
            this.gm.Volume = this.volumeValue;
        });


        // Texto
        const textSpeedY = 320;

        this.add.text(330, textSpeedY, 'Text Speed', {
            fontSize: '32px',
            fill: '#000000',
            fontFamily: 'Pixelify Sans',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.textSpeedValueText = this.add.text(760, textSpeedY, this.textSpeed, {
            fontSize: '30px',
            fill: '#000000',
            fontFamily: 'Pixelify Sans',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.textSpeedLeft = this.add.text(640, textSpeedY, '<', {
            fontSize: '38px',
            fill: '#000000',
            fontFamily: 'Pixelify Sans',
            fontStyle: 'bold'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.textSpeedRight = this.add.text(880, textSpeedY, '>', {
            fontSize: '38px',
            fill: '#000000',
            fontFamily: 'Pixelify Sans',
            fontStyle: 'bold'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.textSpeedLeft.on('pointerdown', () => {
            this.textSpeedIndex--;
            if (this.textSpeedIndex < 0) {
                this.textSpeedIndex = this.textSpeedOptions.length - 1;
            }
            this.updateTextSpeed();
        });

        this.textSpeedRight.on('pointerdown', () => {
            this.textSpeedIndex++;
            if (this.textSpeedIndex >= this.textSpeedOptions.length) {
                this.textSpeedIndex = 0;
            }
            this.updateTextSpeed();
        });

        /*
        const fullscreenY = 420;

        this.add.text(330, fullscreenY, 'Pantalla Completa', {
            fontSize: '32px',
            fill: '#000000',
            fontFamily: 'Pixelify Sans',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.checkboxSize = 32;

        this.checkboxBox = this.add.rectangle(
            700,
            fullscreenY,
            this.checkboxSize,
            this.checkboxSize,
            0xffffff
        )
            .setStrokeStyle(3, 0x000000)
            .setInteractive({ useHandCursor: true });

        this.checkboxTick = this.add.text(700, fullscreenY, 'X', {
            fontSize: '28px',
            fill: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.checkboxHitArea = this.add.rectangle(
            700,
            fullscreenY,
            60,
            60,
            0x000000,
            0
        ).setInteractive({ useHandCursor: true });

        this.updateFullscreenCheckbox();

        this.checkboxBox.on('pointerdown', () => {
            this.toggleFullscreen();
        });

        this.checkboxTick.setInteractive({ useHandCursor: true });
        this.checkboxTick.on('pointerdown', () => {
            this.toggleFullscreen();
        });

        this.checkboxHitArea.on('pointerdown', () => {
            this.toggleFullscreen();
        });

        */

        this.add.text(centerX, sceneHeight - 20, 'Presiona ESPACIO para volver', {
            fontSize: '14px',
            fill: '#000000',
            fontFamily: 'Pixelify Sans',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        console.log(data);
        if((!data || !Object.keys(data).length)){
            this.input.keyboard.on('keydown-SPACE', () => {
                this.scene.stop();
                this.scene.start('MenuPrincipal');
                this.scene.bringToTop('MenuPrincipal');
            });
        }else{
            this.input.keyboard.on('keydown-SPACE', () => {
                this.scene.stop();
                this.scene.start('TitleScene');
               
                
            });
        }
        
    }

    getTextSpeed() {
        if (this.textSpeed === 'Lento') return 40;
        if (this.textSpeed === 'Medio') return 25;
        return 15;
    }

    updateTextSpeed() {
        this.textSpeed = this.textSpeedOptions[this.textSpeedIndex];
        this.textSpeedValueText.setText(this.textSpeed);

        this.gm.TextMode = this.textSpeed;
        this.gm.TextIndex = this.textSpeedIndex;
        this.gm.TextNum = this.getTextSpeed();
    }

    toggleFullscreen() {
        try {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        } catch (error) {
            console.error('Error al cambiar fullscreen:', error);
        }
    }

    handleEnterFullscreen() {
        this.isFullscreenChecked = true;
        this.gm.Fullscreen = true;
        this.updateFullscreenCheckbox();
    }

    handleLeaveFullscreen() {
        this.isFullscreenChecked = false;
        this.gm.Fullscreen = false;
        this.updateFullscreenCheckbox();
    }

    updateFullscreenCheckbox() {
        this.checkboxTick.setVisible(this.isFullscreenChecked);
    }

    shutdown() {
        this.scale.off('enterfullscreen', this.handleEnterFullscreen, this);
        this.scale.off('leavefullscreen', this.handleLeaveFullscreen, this);
    }

    destroy() {
        this.shutdown();
    }
}