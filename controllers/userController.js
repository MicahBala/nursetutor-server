// controllers/userController.js
import admin from '../config/firebaseAdmin.js';
import User from '../models/User.js';

export const syncUser = async (req, res) => {
    try {
        // 1. Grab the token sent from the React frontend in the headers
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // 2. Ask Google to verify the token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name } = decodedToken;

        // 3. Check MongoDB: Does this user exist?
        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            // 4. If they don't exist, create a brand new profile in MongoDB
            user = await User.create({
                firebaseUid: uid,
                email: email,
                displayName: name || '',
                // Note: mockExamCredits defaults to 0 based on our Schema!
            });
            console.log(`✨ New user created: ${email}`);
        } else {
            console.log(`✅ Existing user logged in: ${email}`);
        }

        // 5. Send the user's database profile back to React
        res.status(200).json(user);

    } catch (error) {
        console.error('Error syncing user:', error.message);
        res.status(500).json({ error: 'Server error during authentication' });
    }
};

export const unlockTopic = async (req, res) => {
    try {
        const { firebaseUid, topicId } = req.body;

        if (!firebaseUid || !topicId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Calculate the exact expiration date (Current Date + 30 Days)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        // Update the user document
        const updatedUser = await User.findOneAndUpdate(
            { firebaseUid: firebaseUid },
            {
                $push: { // Use $push instead of $addToSet so they can rebuy it if it expires
                    courseSubscriptions: {
                        courseId: topicId,
                        purchasedAt: new Date(),
                        expiresAt: expirationDate // Save the expiration date to the DB!
                    }
                }
            },
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'Topic unlocked!', user: updatedUser });
    } catch (error) {
        console.error("Error unlocking topic:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { reference, firebaseUid, topicId } = req.body;

        if (!reference || !firebaseUid || !topicId) {
            return res.status(400).json({ error: 'Missing payment details' });
        }

        // 1. Secretly ask Paystack: "Is this transaction real?"
        // (Using native Node.js fetch)
        const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Your secret key
                'Content-Type': 'application/json'
            }
        });

        const paystackData = await paystackResponse.json();

        // 2. Check if Paystack confirms the payment was successful
        if (paystackData.status && paystackData.data.status === 'success') {

            // SECURITY BONUS: In a massive app, you would also check if paystackData.data.amount 
            // matches the actual price of the course here, so users can't pay 1 Naira for a 500 Naira course!

            // 3. Unlock the course (using our 30-day expiration math)
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);

            const updatedUser = await User.findOneAndUpdate(
                { firebaseUid: firebaseUid },
                {
                    $push: {
                        courseSubscriptions: {
                            courseId: topicId,
                            purchasedAt: new Date(),
                            expiresAt: expirationDate
                        }
                    }
                },
                { new: true }
            );

            return res.status(200).json({ message: 'Payment verified and topic unlocked!', user: updatedUser });
        } else {
            return res.status(400).json({ error: 'Payment verification failed with Paystack.' });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ error: 'Server error during verification' });
    }
};