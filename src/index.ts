import express, { Request, Response } from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

interface VerifiableCredential {
  '@context': string[]; // JSON-LD-Kontexte
  type: string[]; // Typen des Credentials
  issuer: {
    id: string; // DID oder URL des Ausstellers
  };
  issuanceDate: string; // Datum der Ausstellung (ISO-8601-Format)
  expirationDate?: string; // Optionales Ablaufdatum (ISO-8601-Format)
  credentialSubject: {
    id: string; // DID des Subjekts
    [key: string]: any; // Zusätzliche Claims über das Subjekt
  };
  proof: {
    type: string; // Art der Signatur (z. B. 'JwtProof2020')
    created: string; // Erstellungszeitpunkt der Signatur (ISO-8601-Format)
    verificationMethod: string; // DID-Key für die Verifizierung
    proofPurpose: string; // Zweck der Signatur (z. B. 'assertionMethod')
    [key: string]: any; // Weitere Felder je nach Signaturtyp
  };
}


let demoVC: VerifiableCredential;

// Middleware, um JSON-Requests zu parsen
app.use(express.json());

// Einfache GET-Route, um zu prüfen, ob der Server läuft
app.get('/', (req: Request, res: Response) => {
  res.send('Backend server is running!');
});

// POST-Route zur Verifizierung eines VC
app.post('/verify-credential', async (req: Request, res: Response) => {
  try {
    const { verifiableCredential } = req.body;

    // Anfrage an den VC-Service zum Verifizieren des Credentials
    const response = await axios.post('http://localhost:3000/verify-credential', {
      verifiableCredential,
    });

    // Ergebnis der Verifizierung zurückgeben
    res.json(response.data);
  } catch (error) {
    console.error('Error verifying credential:', (error as Error).message);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.get('/verify-demo-vc', async (req: Request, res: Response) => {
  try {
    // Hardcodiertes Demo-VC

    // Anfrage an den VC-Service zur Verifizierung des Demo-VCs
    const response = await axios.post('http://localhost:3000/verify-credential', {
      credential: demoVC,
    });

    // Ergebnis der Verifizierung zurückgeben
    res.json(response.data);
  } catch (error) {
    console.error('Error verifying demo credential:', (error as Error).message);
    res.status(500).json({ error: 'Verification of demo credential failed' });
  }
});

app.get('/generate-demo-vc', async (req: Request, res: Response) => {
  try {
    // Daten für das Demo-VC
    const subject = 'did:ethr:sepolia:0x0386529f311bf92c9e32282eaaecbfb346fca888e10683cc1c0a02aceb3dec6a5c';
    const claims = { name: 'Alice' };

    // Erstelle das VC über den VC-Service
    const response = await axios.post('http://localhost:3000/issue-credential', {
      subject,
      claims,
    });

    // Erfolgreich generiertes VC zurückgeben
    demoVC = response.data
    res.json(response.data);
  } catch (error) {
    console.error('Error generating demo VC:', (error as Error).message);
    res.status(500).json({ error: 'Demo VC generation failed' });
  }
});


// Server starten
app.listen(PORT, () => {
  console.log(`Backend server läuft auf http://localhost:${PORT}`);
});
