import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // 1. SZIGORÚ TÍPUSOK: Letiltja az 'any' használatát. Enterprise backend kódnál mindig pontosan tudnunk kell, mi van a memóriában és az adatbázisban.
      '@typescript-eslint/no-explicit-any': 'error',
      // 2. DEPENDENCY INJECTION: A NestJS-ben (ugyanúgy, mint Angularban) a service-ek beinjektálása gyakran egy üres konstruktort eredményez: `constructor(private repo: Repository) {}`.
      // Ez kikapcsolja a linter hisztijét az "üres függvények" miatt.
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      // 3. NESTJS DEKORÁTOROK: A controllerekben gyakran vannak olyan paraméterek, amiket deklarálunk (pl. req, res), de az adott metódusban esetleg mégsem használunk.
      // Csak figyelmeztetést dob, DE ha a változó neve aláhúzással kezdődik (pl. _req), akkor ignorálja.
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];