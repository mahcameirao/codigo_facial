require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`📡 Servidor rodando na porta ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.log('Error Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
});
