import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

app.get('/status', (req: Request, res: Response) => {
    res.status(200).send({message: 'API Equitrec disponible'});
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
})