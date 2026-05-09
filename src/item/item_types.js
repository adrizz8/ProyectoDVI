/**
 * ITEM_TYPES
 * ----------
 * Diccionario de todos los objetos que existen en el juego.
 **/
export const ITEM_TYPES = {
    'pincho_tortilla': {
        id: 'pincho_tortilla',
        name: 'Pincho de Tortilla',
        type: 'consumable',
        heal: 8,
        description: 'Recupera 8 HP (Energía vital de la cafetería).'
    },
    'monster': {
        id: 'monster',
        name: 'Monster',
        type: 'consumable',
        recMp: 5,
        description: 'Restaura 5 MP (Concentración extrema).'
    },
    'menu_dia': {
        id: 'menu_dia',
        name: 'Menú del Día',
        type: 'consumable',
        heal: 10,
        recMp: 10,
        description: 'Restaura 10 HP y 10 MP (El banquete del estudiante).'
    },
    'tinto_verano': {
        id: 'tinto_verano',
        name: 'Tinto de Verano',
        type: 'consumable',
        buffAtt: 2,
        description: 'Aumenta el ataque en 2 (Efecto euforia).'
    },
    'palmera_chocolate': {
        id: 'palmera_chocolate',
        name: 'Palmera de Chocolate',
        type: 'consumable',
        buffDef: 2,
        description: 'Aumenta la defensa en 2 (Capa de grasa protectora).'
    },
    'cafe': {
        id: 'cafe',
        name: 'Café',
        type: 'consumable',
        buffSpd: 3,
        description: 'Aumenta la velocidad en 3 (Cafeína directa).'
    },
    'cigarro': {
        id: 'cigarro',
        name: 'Cigarro',
        type: 'consumable',
        buffAtt: 1,
        buffDef: 1,
        buffSpd: 1,
        buffLck: 1,
        description: 'Aumenta el ataque en 1, la defensa en 1, la velocidad en 1 y la suerte en 1.'
    },
    'teclado_mecanico': {
        id: 'teclado_mecanico',
        name: 'Teclado Mecánico',
        type: 'equipment',
        bonusStats: { damage: 2 },
        description: 'Arma periférica +3 daño (Switches Blue para más ruido).'
    },
    'sudadera_facu': {
        id: 'sudadera_facu',
        name: 'Sudadera de la Facu',
        type: 'equipment',
        bonusStats: { defense: 2 },
        description: 'Prenda reglamentaria que ofrece +3 defensa.'
    },
    'pincho_tortilla_viejo': {
        id: 'pincho_tortilla_viejo',
        name: 'Pincho Frío',
        type: 'consumable',
        heal: 2,
        description: 'Un pincho que lleva demasiado tiempo en la barra. Cura 5 HP.'
    },
    'regla_lhopital': {
        id: 'regla_lhopital',
        name: 'Regla de L\'Hôpital',
        type: 'consumable',
        buffLck: 2,
        description: 'Aumenta tu suerte en 2 en el próximo examen con esta chuleta de matemáticas.'
    },
    'compilador_amigable': {
        id: 'compilador_amigable',
        name: 'Compilador Amigable',
        type: 'consumable',
        recMp: 3,
        buffSpd: 3,
        description: 'Recupera 3 de Energía y aumenta la velocidad en 3 (Te lo dio el NPC de FP).'
    },
    'cerveza': {
        id: 'cerveza',
        name: 'Cerveza',
        type: 'consumable',
        heal: 5,
        recMp: 3,
        description: 'Una Mahou bien fría. Recupera 10 HP y 5 MP.'
    },
    'apuntes_ansi': {
        id: 'apuntes_ansi',
        name: 'Apuntes de Ansiedad',
        type: 'consumable',
        recMp: 6,
        description: 'Apuntes ilegibles. Restauran 8 Energía por el esfuerzo.'
    }
};
