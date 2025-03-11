
export interface Word {
  id: string;
  german: string;
  italian: string;
  level: number; // 0-5, higher means better known
  lastSeen: number; // timestamp
}

export const initialWords: Word[] = [
  { id: '1', german: 'Hallo', italian: 'Ciao', level: 0, lastSeen: Date.now() },
  { id: '2', german: 'Auf Wiedersehen', italian: 'Arrivederci', level: 0, lastSeen: Date.now() },
  { id: '3', german: 'Danke', italian: 'Grazie', level: 0, lastSeen: Date.now() },
  { id: '4', german: 'Bitte', italian: 'Per favore', level: 0, lastSeen: Date.now() },
  { id: '5', german: 'Ja', italian: 'Sì', level: 0, lastSeen: Date.now() },
  { id: '6', german: 'Nein', italian: 'No', level: 0, lastSeen: Date.now() },
  { id: '7', german: 'Guten Morgen', italian: 'Buongiorno', level: 0, lastSeen: Date.now() },
  { id: '8', german: 'Guten Abend', italian: 'Buonasera', level: 0, lastSeen: Date.now() },
  { id: '9', german: 'Wie geht\'s?', italian: 'Come stai?', level: 0, lastSeen: Date.now() },
  { id: '10', german: 'Ich verstehe', italian: 'Capisco', level: 0, lastSeen: Date.now() },
  { id: '11', german: 'Ich verstehe nicht', italian: 'Non capisco', level: 0, lastSeen: Date.now() },
  { id: '12', german: 'Wo ist...?', italian: 'Dov\'è...?', level: 0, lastSeen: Date.now() },
  { id: '13', german: 'Wasser', italian: 'Acqua', level: 0, lastSeen: Date.now() },
  { id: '14', german: 'Brot', italian: 'Pane', level: 0, lastSeen: Date.now() },
  { id: '15', german: 'Wein', italian: 'Vino', level: 0, lastSeen: Date.now() },
];
