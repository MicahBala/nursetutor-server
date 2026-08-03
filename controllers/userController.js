// controllers/userController.js
import admin from '../config/firebaseAdmin.js';
import User from '../models/User.js';

export const syncUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name } = decodedToken;

        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            user = await User.create({
                firebaseUid: uid,
                email: email,
                displayName: name || '',
            });
            console.log(`✨ New user created: ${email}`);
        } else {
            console.log(`✅ Existing user logged in: ${email}`);
        }

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
            { returnDocument: 'after' } // <-- Mongoose Deprecation Fix!
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
        const { reference, firebaseUid, topicId, amount } = req.body;

        if (!reference || !firebaseUid || !topicId || !amount) {
            return res.status(400).json({ error: 'Missing payment details' });
        }

        const merchantCode = process.env.QUICKTELLER_MERCHANT_CODE; // Add this to your backend .env

        // 1. Call Interswitch's live gettransaction.json endpoint
        const iswResponse = await fetch(`https://webpay.interswitchng.com/collections/api/v1/gettransaction.json?merchantcode=${merchantCode}&transactionreference=${reference}&amount=${amount}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const iswData = await iswResponse.json();

        // 2. Interswitch returns ResponseCode "00" for a successful transaction
        if (iswData.ResponseCode === '00' || iswData.ResponseCode === '00') {

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
                { returnDocument: 'after' }
            );

            return res.status(200).json({ message: 'Payment verified and topic unlocked!', user: updatedUser });
        } else {
            console.error("Quickteller Verification Failed:", iswData);
            return res.status(400).json({ error: `Payment verification failed: ${iswData.ResponseDescription || 'Unknown Error'}` });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ error: 'Server error during verification' });
    }
};