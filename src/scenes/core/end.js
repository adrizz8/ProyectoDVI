import Phaser from 'phaser'

/**
 * Escena de fin de juego. Cuando se han recogido todas las estrellas, se presenta un
 * texto que indica que el juego se ha acabado.
 * Si se pulsa cualquier tecla, se vuelve a iniciar el juego.
 */
export default class End extends Phaser.Scene {
  /**
   * Constructor de la escena
   */
  constructor() {
    super({ key: 'end' });
  }

    create() {

        const centerX = this.scale.width / 2;

        // Texto de créditos
        this.creditsText = this.add.text(centerX, 220,
            '\n\n' +
            'Juego desarrollado por:\n\n' +
            'Adrián Rodríguez Margallo\n' +
            'Carla Acebes Montalvillo\n'+
            'Ismael Lucas Parada\n'+
            'Azazel Cabello Gómez\n',
            
            {
                fontSize: '28px',
                fill: '#ffffff',
                align: 'center'
            }
        )
        .setOrigin(0.5)
        .setAlign('center');

        // Texto para continuar, oculto al principio
        this.continueText = this.add.text(centerX, 430,
            'Pulsa cualquier tecla para volver a jugar',
            {
                fontSize: '22px',
                fill: '#ffffff',
                align: 'center'
            }
        )
        .setOrigin(0.5)
        .setAlign('center')
        .setVisible(false);

        // Al principio no se puede pasar
        this.canSkip = false;

        // Después de 3 segundos, dejamos pasar los créditos
        this.time.delayedCall(3000, () => {
            this.canSkip = true;
            this.continueText.setVisible(true);
        });

        // Listener de teclado
        this.input.keyboard.on('keydown', () => {
            if (!this.canSkip) return;

            this.scene.start('TitleScene');
        });
    }

}