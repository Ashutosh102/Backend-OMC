import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import Stripe from 'stripe';


import connectDB from './mongodb/connect.js';
import userRouter from './routes/user.routes.js';
import propertyRouter from './routes/property.routes.js';
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.send({ message: 'Hello World!' });
})

app.use('/api/v1/users', userRouter);
app.use('/api/v1/channels', propertyRouter);

app.post('/create-checkout-session', async (req, res) => {
  const { propertyId, unit_amount , name} = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: name,
            },
            unit_amount: unit_amount*100, // Replace with the actual price of the property
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://omc-ownmycontent.netlify.app/payment/show', // Replace with your success URL
      cancel_url: 'https://omc-ownmycontent.netlify.app/', // Replace with your cancel URL
      metadata: {
        propertyId: propertyId,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the checkout session' });
  }
});


const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);

    app.listen(8080, () => console.log('Server started on port http://localhost:8080'));
  } catch (error) {
    console.log(error);
  }
}

startServer();