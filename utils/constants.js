import path from 'path';
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const __dirname = path.resolve(currentDir, '..');

