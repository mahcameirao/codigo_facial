const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "sua_chave_secreta_super_segura_123";

async function test() {
    // 1. Criar um token fake mas válido para o teste
    const token = jwt.sign({ userId: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6' }, JWT_SECRET);

    try {
        console.log("Chamando /payment/create-checkout-session...");
        const response = await axios.post('http://localhost:3000/payment/create-checkout-session', {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("✅ Sucesso:", response.data);
    } catch (error) {
        console.error("❌ Erro da API:", error.response?.status, error.response?.data);
    }
}

test();
