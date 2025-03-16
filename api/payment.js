require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

// console.log("Razorpay Key ID:", process.env.RAZORPAY_TEST_KEY_ID);
// console.log("Razorpay Key Secret:", process.env.RAZORPAY_TEST_KEY_SECRET);
const { Router } = require("express");
const paymentRouter = Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { db, pgpHelpers } = require("../utils/database");
const { getOneConfig } = require('./services/admin-service')

paymentRouter.get("/getKey", async (req, res) => {
    try {
        const key = (await getOneConfig('RasorPay_Key'))["config_value"];
        if (!key) {
            return res.status(500).json({ error: "Razorpay Key ID is missing" });
        }
        res.status(200).json({ key: key });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create an order
paymentRouter.post("/create-order", async (req, res) => {
    const { amount, currency, userId } = req.body;

    const options = {
        amount: amount * 100, // Razorpay accepts paise
        currency,
        receipt: `receipt_${userId}`,
        payment_capture: 1
    };

    try {
        const razorpay = new Razorpay({
            key_id: (await getOneConfig('RasorPay_Key'))["config_value"],
            key_secret: (await getOneConfig('RasorPay_Secret'))["config_value"],
        });

        const order = await razorpay.orders.create(options);
        if (!order) {
            return res.status(500).send("Error");
        }
        // Save orderId and payment status in DB with user details
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

// Verify Payment and Update Status
paymentRouter.post("/verify-payment", async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userId } =
        req.body;
    console.log("Received verification request:", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId,
    });

    const secret = (await getOneConfig('RasorPay_Secret'))["config_value"];;
    const generatedSignature = crypto.createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
    // const sha = crypto.createHmac("sha256", secret);
    // //order_id + "|" + razorpay_payment_id
    // sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    // const digest = sha.digest("hex");


    if (generatedSignature === razorpay_signature) {
        // await db.none(
        //     `INSERT INTO payment_details (rz_order_id, rz_payment_id, rz_signature, userId)
        //      VALUES ($1, $2, $3, $4)`,
        //     [razorpay_order_id, razorpay_payment_id, razorpay_signature, userId]
        // );

        //Update Player's Payment Status
        await db.none(`UPDATE player SET payment_status = TRUE WHERE id = $1`, [userId]);

        // Update paymentStatus = true in the database for userId
        res.json({ success: true, message: "Payment verified" });
    } else {
        res.status(400).json({ success: false, message: "Payment verification failed" });
    }
});


module.exports = paymentRouter;
