const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../config/database');

class PaymentController {
    static async createCheckoutSession(req, res, next) {
        try {
            const { userId } = req.user;
            console.log(`💳 Iniciando Checkout para usuário: ${userId}`);

            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                console.log(`❌ Usuário ${userId} não encontrado no banco`);
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            console.log(`📡 Criando sessão no Stripe para ${user.email}...`);
            let session;
            try {
                session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [
                        {
                            price_data: {
                                currency: 'brl',
                                product_data: {
                                    name: 'Plano Pro - Da Make ao Método',
                                    description: 'Acesso completo às ferramentas de visagismo e proporção áurea.',
                                },
                                unit_amount: 3790, // R$ 37,90 em centavos
                            },
                            quantity: 1,
                        },
                    ],
                    mode: 'payment',
                    success_url: `${process.env.FRONTEND_URL}/results?success=true`,
                    cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
                    client_reference_id: userId,
                    customer_email: user.email,
                    payment_intent_data: {
                        metadata: {
                            userId: userId
                        }
                    }
                });
            } catch (stripeError) {
                console.warn("⚠️ Falha ao criar sessão com múltiplos métodos (provavelmente PIX/Boleto inativos). Tentando apenas cartão...");
                console.error("Erro original do Stripe:", stripeError.message);

                // Tenta novamente apenas com cartão
                session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [
                        {
                            price_data: {
                                currency: 'brl',
                                product_data: {
                                    name: 'Plano Pro - Da Make ao Método',
                                    description: 'Acesso completo às ferramentas de visagismo e proporção áurea.',
                                },
                                unit_amount: 3790,
                            },
                            quantity: 1,
                        },
                    ],
                    mode: 'payment',
                    success_url: `${process.env.FRONTEND_URL}/results?success=true`,
                    cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
                    client_reference_id: userId,
                    customer_email: user.email,
                    payment_intent_data: {
                        metadata: {
                            userId: userId
                        }
                    }
                });
            }

            console.log(`✅ Sessão criada com sucesso: ${session.id}`);
            res.status(200).json({ url: session.url });
        } catch (error) {
            console.error("❌ Erro fatal na API de Pagamento:", error.message);
            res.status(500).json({ error: error.message || 'Erro interno ao processar pagamento' });
        }
    }

    static async webhook(req, res) {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error(`Webhook Error: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.client_reference_id;

            try {
                await prisma.user.update({
                    where: { id: userId },
                    data: { plan: 'pro' }
                });
                console.log(`✅ Usuário ${userId} atualizado para o plano PRO`);
            } catch (error) {
                console.error(`❌ Erro ao atualizar usuário ${userId}:`, error.message);
            }
        }

        res.json({ received: true });
    }
}

module.exports = PaymentController;
