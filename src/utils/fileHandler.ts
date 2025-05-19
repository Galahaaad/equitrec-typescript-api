//TEMPORAIRE => DONNEES EN JSON POUR AVANCER LE TEMPS DE REMPLACEMENT PAR API

import fs from 'fs';
import path from 'path';

// Fonction pour lire un fichier JSON
export const readJsonFile = <T>(filePath: string): T => {
    const absolutePath = path.resolve(__dirname, '../data/json', filePath);

    if (!fs.existsSync(absolutePath)) {
        fs.writeFileSync(absolutePath, JSON.stringify([]));
        return [] as unknown as T;
    }

    const data = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(data) as T;
};

// Fonction pour écrire dans un fichier JSON
export const writeJsonFile = <T>(filePath: string, data: T): void => {
    const absolutePath = path.resolve(__dirname, '../data/json', filePath);
    fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2));
};
