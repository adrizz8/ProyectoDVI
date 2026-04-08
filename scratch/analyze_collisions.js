import fs from 'fs';

const mapPath = 'c:/Users/Usuario/OneDrive/Escritorio/ING.INFORMATICA/4.CUARTO/DVI/ProyectoDVI/assets/images/cafeteria.json';
const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const collisionLayer = mapData.layers.find(l => l.name === 'colisiones');

const width = 38;
const height = 20;

process.stdout.write("    ");
for (let x = 0; x < width; x++) process.stdout.write((x % 10).toString());
process.stdout.write("\n");

for (let y = 0; y < height; y++) {
    process.stdout.write(y.toString().padStart(3, ' ') + ": ");
    for (let x = 0; x < width; x++) {
        const val = collisionLayer.data[y * width + x];
        if (val === 0) {
            process.stdout.write(".");
        } else {
            process.stdout.write("#");
        }
    }
    process.stdout.write("\n");
}
