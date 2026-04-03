-- ════════════════════════════════════════════════════
-- TUTTI FRUTTI — Tabla de palabras válidas
-- Ejecutar en Supabase SQL Editor
-- ════════════════════════════════════════════════════

-- 1. Crear la tabla
CREATE TABLE IF NOT EXISTS tutti_frutti_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  letter CHAR(1) NOT NULL,
  word TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (category, word)
);

-- 2. Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_tf_words_lookup 
  ON tutti_frutti_words(category, letter);

-- 3. RLS - todos los autenticados pueden leer
ALTER TABLE tutti_frutti_words ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tf_words_select" ON tutti_frutti_words;
CREATE POLICY "tf_words_select" ON tutti_frutti_words 
  FOR SELECT TO authenticated USING (true);

-- 4. Datos iniciales (tú puedes agregar más desde el dashboard de Supabase)

-- ═══ NOMBRES ═══
INSERT INTO tutti_frutti_words (category, letter, word) VALUES
-- A
('nombre', 'A', 'Ana'), ('nombre', 'A', 'Adriana'), ('nombre', 'A', 'Alejandra'),
('nombre', 'A', 'Alberto'), ('nombre', 'A', 'Alicia'), ('nombre', 'A', 'Andrea'),
('nombre', 'A', 'Angel'), ('nombre', 'A', 'Antonio'), ('nombre', 'A', 'Arturo'),
('nombre', 'A', 'Amelia'), ('nombre', 'A', 'Agustin'), ('nombre', 'A', 'Alma'),
-- B
('nombre', 'B', 'Beatriz'), ('nombre', 'B', 'Benjamin'), ('nombre', 'B', 'Bernardo'),
('nombre', 'B', 'Blanca'), ('nombre', 'B', 'Brenda'), ('nombre', 'B', 'Bruno'),
('nombre', 'B', 'Barbara'), ('nombre', 'B', 'Brandon'), ('nombre', 'B', 'Belen'),
-- C
('nombre', 'C', 'Carmen'), ('nombre', 'C', 'Carlos'), ('nombre', 'C', 'Carolina'),
('nombre', 'C', 'Camila'), ('nombre', 'C', 'Cesar'), ('nombre', 'C', 'Claudia'),
('nombre', 'C', 'Clara'), ('nombre', 'C', 'Cristina'), ('nombre', 'C', 'Catalina'),
-- D
('nombre', 'D', 'Diana'), ('nombre', 'D', 'Daniel'), ('nombre', 'D', 'David'),
('nombre', 'D', 'Dario'), ('nombre', 'D', 'Diego'), ('nombre', 'D', 'Daniela'),
-- E
('nombre', 'E', 'Elena'), ('nombre', 'E', 'Ernesto'), ('nombre', 'E', 'Enrique'),
('nombre', 'E', 'Eduardo'), ('nombre', 'E', 'Eva'), ('nombre', 'E', 'Emilia'),
('nombre', 'E', 'Estefania'), ('nombre', 'E', 'Esteban'),
-- F
('nombre', 'F', 'Fernanda'), ('nombre', 'F', 'Fernando'), ('nombre', 'F', 'Francisco'),
('nombre', 'F', 'Felipe'), ('nombre', 'F', 'Fatima'), ('nombre', 'F', 'Frida'),
-- G
('nombre', 'G', 'Gabriela'), ('nombre', 'G', 'Gabriel'), ('nombre', 'G', 'Gustavo'),
('nombre', 'G', 'Gloria'), ('nombre', 'G', 'Guadalupe'), ('nombre', 'G', 'German'),
-- H
('nombre', 'H', 'Helena'), ('nombre', 'H', 'Hector'), ('nombre', 'H', 'Hugo'),
('nombre', 'H', 'Hernan'), ('nombre', 'H', 'Hilda'),
-- I
('nombre', 'I', 'Isabel'), ('nombre', 'I', 'Ivan'), ('nombre', 'I', 'Irene'),
('nombre', 'I', 'Ignacio'), ('nombre', 'I', 'Ines'),
-- J
('nombre', 'J', 'Julia'), ('nombre', 'J', 'Jose'), ('nombre', 'J', 'Juan'),
('nombre', 'J', 'Jorge'), ('nombre', 'J', 'Jessica'), ('nombre', 'J', 'Joaquin'),
('nombre', 'J', 'Jimena'), ('nombre', 'J', 'Javier'), ('nombre', 'J', 'Jazmin'),
-- K
('nombre', 'K', 'Karla'), ('nombre', 'K', 'Karina'), ('nombre', 'K', 'Kevin'),
-- L
('nombre', 'L', 'Laura'), ('nombre', 'L', 'Luis'), ('nombre', 'L', 'Lucia'),
('nombre', 'L', 'Leonardo'), ('nombre', 'L', 'Lorena'), ('nombre', 'L', 'Lucas'),
-- M
('nombre', 'M', 'Maria'), ('nombre', 'M', 'Miguel'), ('nombre', 'M', 'Marcos'),
('nombre', 'M', 'Mario'), ('nombre', 'M', 'Monica'), ('nombre', 'M', 'Mariana'),
-- N
('nombre', 'N', 'Natalia'), ('nombre', 'N', 'Nicolas'), ('nombre', 'N', 'Nadia'),
('nombre', 'N', 'Nestor'), ('nombre', 'N', 'Norma'), ('nombre', 'N', 'Nancy'),
-- O
('nombre', 'O', 'Olivia'), ('nombre', 'O', 'Oscar'), ('nombre', 'O', 'Omar'),
('nombre', 'O', 'Orlando'), ('nombre', 'O', 'Olga'),
-- P
('nombre', 'P', 'Paula'), ('nombre', 'P', 'Pedro'), ('nombre', 'P', 'Pablo'),
('nombre', 'P', 'Patricia'), ('nombre', 'P', 'Paulina'), ('nombre', 'P', 'Pamela'),
-- R
('nombre', 'R', 'Rosa'), ('nombre', 'R', 'Roberto'), ('nombre', 'R', 'Ricardo'),
('nombre', 'R', 'Ramon'), ('nombre', 'R', 'Raquel'), ('nombre', 'R', 'Rodrigo'),
-- S
('nombre', 'S', 'Sofia'), ('nombre', 'S', 'Samuel'), ('nombre', 'S', 'Santiago'),
('nombre', 'S', 'Sebastian'), ('nombre', 'S', 'Sara'), ('nombre', 'S', 'Sandra'),
-- T
('nombre', 'T', 'Teresa'), ('nombre', 'T', 'Tomas'), ('nombre', 'T', 'Tatiana'),
-- U
('nombre', 'U', 'Ursula'), ('nombre', 'U', 'Ulises'),
-- V
('nombre', 'V', 'Valentina'), ('nombre', 'V', 'Victor'), ('nombre', 'V', 'Valeria'),
('nombre', 'V', 'Vanessa'), ('nombre', 'V', 'Veronica')
ON CONFLICT (category, word) DO NOTHING;

-- ═══ ANIMALES ═══
INSERT INTO tutti_frutti_words (category, letter, word) VALUES
('animal', 'A', 'Aguila'), ('animal', 'A', 'Abeja'), ('animal', 'A', 'Araña'),
('animal', 'A', 'Armadillo'), ('animal', 'A', 'Ardilla'), ('animal', 'A', 'Atun'),
('animal', 'B', 'Bufalo'), ('animal', 'B', 'Burro'), ('animal', 'B', 'Buho'),
('animal', 'B', 'Ballena'), ('animal', 'B', 'Boa'),
('animal', 'C', 'Cocodrilo'), ('animal', 'C', 'Caballo'), ('animal', 'C', 'Conejo'),
('animal', 'C', 'Cerdo'), ('animal', 'C', 'Camello'), ('animal', 'C', 'Canguro'),
('animal', 'C', 'Cobra'), ('animal', 'C', 'Colibri'),
('animal', 'D', 'Delfin'), ('animal', 'D', 'Dinosaurio'),
('animal', 'E', 'Elefante'), ('animal', 'E', 'Escorpion'), ('animal', 'E', 'Erizo'),
('animal', 'F', 'Foca'), ('animal', 'F', 'Flamenco'), ('animal', 'F', 'Falcon'),
('animal', 'G', 'Gato'), ('animal', 'G', 'Gorila'), ('animal', 'G', 'Gallina'),
('animal', 'G', 'Gaviota'), ('animal', 'G', 'Gusano'),
('animal', 'H', 'Halcon'), ('animal', 'H', 'Hipopotamo'), ('animal', 'H', 'Hiena'),
('animal', 'H', 'Hormiga'), ('animal', 'H', 'Hamster'),
('animal', 'I', 'Iguana'), ('animal', 'I', 'Impala'),
('animal', 'J', 'Jaguar'), ('animal', 'J', 'Jirafa'), ('animal', 'J', 'Jabali'),
('animal', 'K', 'Koala'), ('animal', 'K', 'Kiwi'),
('animal', 'L', 'Leon'), ('animal', 'L', 'Lobo'), ('animal', 'L', 'Leopardo'),
('animal', 'L', 'Lagarto'), ('animal', 'L', 'Loro'), ('animal', 'L', 'Liebre'),
('animal', 'M', 'Mono'), ('animal', 'M', 'Mariposa'), ('animal', 'M', 'Mosquito'),
('animal', 'M', 'Murcielago'), ('animal', 'M', 'Mapache'),
('animal', 'N', 'Narval'), ('animal', 'N', 'Nutria'),
('animal', 'O', 'Oso'), ('animal', 'O', 'Oveja'), ('animal', 'O', 'Orangutan'),
('animal', 'O', 'Orca'),
('animal', 'P', 'Puma'), ('animal', 'P', 'Perro'), ('animal', 'P', 'Pato'),
('animal', 'P', 'Pantera'), ('animal', 'P', 'Pinguino'), ('animal', 'P', 'Pulpo'),
('animal', 'R', 'Raton'), ('animal', 'R', 'Rana'), ('animal', 'R', 'Rinoceronte'),
('animal', 'S', 'Serpiente'), ('animal', 'S', 'Sapo'), ('animal', 'S', 'Salmon'),
('animal', 'T', 'Tigre'), ('animal', 'T', 'Tortuga'), ('animal', 'T', 'Tiburon'),
('animal', 'T', 'Toro'),
('animal', 'U', 'Urraca'),
('animal', 'V', 'Vibora'), ('animal', 'V', 'Vaca'), ('animal', 'V', 'Venado')
ON CONFLICT (category, word) DO NOTHING;

-- ═══ COLORES ═══
INSERT INTO tutti_frutti_words (category, letter, word) VALUES
('color', 'A', 'Azul'), ('color', 'A', 'Amarillo'), ('color', 'A', 'Ambar'),
('color', 'B', 'Blanco'), ('color', 'B', 'Beige'), ('color', 'B', 'Burdeos'),
('color', 'C', 'Celeste'), ('color', 'C', 'Cafe'), ('color', 'C', 'Crema'),
('color', 'C', 'Coral'), ('color', 'C', 'Carmesi'),
('color', 'D', 'Dorado'),
('color', 'E', 'Esmeralda'), ('color', 'E', 'Escarlata'),
('color', 'F', 'Fucsia'),
('color', 'G', 'Gris'), ('color', 'G', 'Granate'),
('color', 'I', 'Indigo'),
('color', 'J', 'Jade'),
('color', 'K', 'Kaki'),
('color', 'L', 'Lila'), ('color', 'L', 'Lavanda'),
('color', 'M', 'Morado'), ('color', 'M', 'Magenta'), ('color', 'M', 'Marron'),
('color', 'M', 'Menta'), ('color', 'M', 'Mostaza'),
('color', 'N', 'Negro'), ('color', 'N', 'Naranja'),
('color', 'O', 'Ocre'), ('color', 'O', 'Oliva'), ('color', 'O', 'Oro'),
('color', 'P', 'Plateado'), ('color', 'P', 'Purpura'),
('color', 'R', 'Rojo'), ('color', 'R', 'Rosa'), ('color', 'R', 'Rosado'),
('color', 'S', 'Salmon'), ('color', 'S', 'Sepia'),
('color', 'T', 'Turquesa'), ('color', 'T', 'Terracota'),
('color', 'V', 'Verde'), ('color', 'V', 'Violeta'), ('color', 'V', 'Vino')
ON CONFLICT (category, word) DO NOTHING;

-- ═══ PAISES ═══
INSERT INTO tutti_frutti_words (category, letter, word) VALUES
('pais', 'A', 'Argentina'), ('pais', 'A', 'Australia'), ('pais', 'A', 'Alemania'),
('pais', 'A', 'Austria'),
('pais', 'B', 'Bolivia'), ('pais', 'B', 'Brasil'), ('pais', 'B', 'Belgica'),
('pais', 'C', 'Chile'), ('pais', 'C', 'Colombia'), ('pais', 'C', 'Costa Rica'),
('pais', 'C', 'Cuba'), ('pais', 'C', 'Canada'), ('pais', 'C', 'China'),
('pais', 'D', 'Dinamarca'), ('pais', 'D', 'Dominicana'),
('pais', 'E', 'Ecuador'), ('pais', 'E', 'España'), ('pais', 'E', 'Egipto'),
('pais', 'E', 'El Salvador'),
('pais', 'F', 'Francia'), ('pais', 'F', 'Filipinas'), ('pais', 'F', 'Finlandia'),
('pais', 'G', 'Guatemala'), ('pais', 'G', 'Grecia'),
('pais', 'H', 'Honduras'), ('pais', 'H', 'Hungria'), ('pais', 'H', 'Haiti'),
('pais', 'I', 'Italia'), ('pais', 'I', 'India'), ('pais', 'I', 'Irlanda'),
('pais', 'J', 'Japon'), ('pais', 'J', 'Jamaica'),
('pais', 'K', 'Kenia'),
('pais', 'L', 'Libano'),
('pais', 'M', 'Mexico'), ('pais', 'M', 'Marruecos'),
('pais', 'N', 'Nicaragua'), ('pais', 'N', 'Nigeria'), ('pais', 'N', 'Noruega'),
('pais', 'O', 'Oman'),
('pais', 'P', 'Peru'), ('pais', 'P', 'Panama'), ('pais', 'P', 'Paraguay'),
('pais', 'P', 'Portugal'),
('pais', 'R', 'Rumania'), ('pais', 'R', 'Rusia'),
('pais', 'S', 'Suecia'), ('pais', 'S', 'Suiza'),
('pais', 'T', 'Turquia'),
('pais', 'U', 'Uruguay'), ('pais', 'U', 'Ucrania'),
('pais', 'V', 'Venezuela'), ('pais', 'V', 'Vietnam')
ON CONFLICT (category, word) DO NOTHING;

-- ═══ FRUTAS ═══
INSERT INTO tutti_frutti_words (category, letter, word) VALUES
('fruta', 'A', 'Arandano'), ('fruta', 'A', 'Aguacate'), ('fruta', 'A', 'Anana'),
('fruta', 'B', 'Banana'),
('fruta', 'C', 'Cereza'), ('fruta', 'C', 'Ciruela'), ('fruta', 'C', 'Coco'),
('fruta', 'D', 'Durazno'), ('fruta', 'D', 'Datil'),
('fruta', 'F', 'Frambuesa'), ('fruta', 'F', 'Fresa'),
('fruta', 'G', 'Guayaba'), ('fruta', 'G', 'Granada'), ('fruta', 'G', 'Guanabana'),
('fruta', 'H', 'Higo'),
('fruta', 'K', 'Kiwi'),
('fruta', 'L', 'Lima'), ('fruta', 'L', 'Limon'),
('fruta', 'M', 'Mango'), ('fruta', 'M', 'Manzana'), ('fruta', 'M', 'Melon'),
('fruta', 'M', 'Mandarina'), ('fruta', 'M', 'Mora'), ('fruta', 'M', 'Maracuya'),
('fruta', 'N', 'Naranja'), ('fruta', 'N', 'Nectarina'),
('fruta', 'P', 'Piña'), ('fruta', 'P', 'Pera'), ('fruta', 'P', 'Platano'),
('fruta', 'P', 'Papaya'),
('fruta', 'S', 'Sandia'),
('fruta', 'T', 'Toronja'), ('fruta', 'T', 'Tamarindo'),
('fruta', 'U', 'Uva')
ON CONFLICT (category, word) DO NOTHING;

-- ═══ OBJETOS ═══
INSERT INTO tutti_frutti_words (category, letter, word) VALUES
('objeto', 'A', 'Anillo'), ('objeto', 'A', 'Almohada'), ('objeto', 'A', 'Alfombra'),
('objeto', 'B', 'Botella'), ('objeto', 'B', 'Bolsa'), ('objeto', 'B', 'Billetera'),
('objeto', 'C', 'Cuchara'), ('objeto', 'C', 'Cuchillo'), ('objeto', 'C', 'Celular'),
('objeto', 'C', 'Camara'), ('objeto', 'C', 'Caja'),
('objeto', 'D', 'Dado'), ('objeto', 'D', 'Disco'), ('objeto', 'D', 'Despertador'),
('objeto', 'E', 'Espejo'), ('objeto', 'E', 'Escalera'), ('objeto', 'E', 'Escoba'),
('objeto', 'F', 'Florero'), ('objeto', 'F', 'Foco'),
('objeto', 'G', 'Gorra'), ('objeto', 'G', 'Gafas'), ('objeto', 'G', 'Globo'),
('objeto', 'H', 'Hamaca'), ('objeto', 'H', 'Horno'),
('objeto', 'I', 'Iman'), ('objeto', 'I', 'Impresora'),
('objeto', 'J', 'Jarra'), ('objeto', 'J', 'Jabon'),
('objeto', 'L', 'Lapiz'), ('objeto', 'L', 'Lampara'), ('objeto', 'L', 'Llave'),
('objeto', 'L', 'Lentes'), ('objeto', 'L', 'Libro'),
('objeto', 'M', 'Maleta'), ('objeto', 'M', 'Mesa'), ('objeto', 'M', 'Mochila'),
('objeto', 'M', 'Moneda'), ('objeto', 'M', 'Martillo'),
('objeto', 'N', 'Navaja'), ('objeto', 'N', 'Nevera'),
('objeto', 'O', 'Olla'),
('objeto', 'P', 'Paraguas'), ('objeto', 'P', 'Peine'), ('objeto', 'P', 'Plato'),
('objeto', 'P', 'Pelota'),
('objeto', 'R', 'Reloj'), ('objeto', 'R', 'Regla'), ('objeto', 'R', 'Radio'),
('objeto', 'S', 'Silla'), ('objeto', 'S', 'Sarten'), ('objeto', 'S', 'Sombrero'),
('objeto', 'T', 'Tijeras'), ('objeto', 'T', 'Tenedor'), ('objeto', 'T', 'Taza'),
('objeto', 'T', 'Toalla'),
('objeto', 'V', 'Vaso'), ('objeto', 'V', 'Vela')
ON CONFLICT (category, word) DO NOTHING;
