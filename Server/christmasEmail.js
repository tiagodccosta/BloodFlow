const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
});

const firebaseAccount = JSON.parse(Buffer.from(process.env.FIREBASE_ACCOUNT_KEY, 'base64').toString('utf-8'));

admin.initializeApp({
    credential: admin.credential.cert(firebaseAccount),
});

const imagePath = path.resolve(__dirname, "./christmasEmailImage.jpeg");
const imageContent = fs.readFileSync(imagePath);

async function sendChristmasEmails() {
  try {
        const authUsers = await admin.auth().listUsers();
        const userList = authUsers.users;

        for (const user of userList) {
            const email = user.email;
            const uid = user.uid;

            if (!email) {
                console.log(`Skipping user with UID: ${uid} (No email found)`);
                continue;
            }

            const userDoc = await admin.firestore().collection("users").doc(uid).get();
            if (!userDoc.exists) {
                console.log(`No Firestore document found for UID: ${uid}`);
                continue;
            }

            const username = userDoc.data().username;

        const mailOptions = {
        from: `"BloodFlow Team" ${process.env.EMAIL_USER}`,
        to: email,
        subject: "Happy Holidays from BloodFlow! 🎄",
        html: `
                <div style="background-color: #ffe6e6; padding: 30px; border-radius: 15px; font-family: 'Arial', sans-serif; color: #4a4a4a; max-width: 600px; margin: auto;">
                    <div style="text-align: center; margin-bottom: 20px;">
                    <img src="cid:christmasImage" alt="Happy Holidays" style="width: 300px; height: auto; border-radius: 10px;">
                    </div>
                    <p style="font-size: 20px; text-align: center; font-weight: bold; color: #b22222;">
                    Dear ${username},
                    </p>
                    <p style="font-size: 18px; line-height: 1.8; text-align: justify;">
                    As the year comes to a close, we at <span style="font-weight: bold; color: #b22222;">BloodFlow</span> want to extend our heartfelt gratitude for your trust and support throughout 2024. Just like a drop of blood tells a bigger story, every connection we’ve made has contributed to a brighter future in healthcare.
                    </p>
                    <p style="font-size: 18px; line-height: 1.8; text-align: justify;">
                    This Christmas, may your holiday season be filled with joy, and may the coming year bring good health, happiness, and success—because every moment is worth cherishing.
                    </p>
                    <p style="font-size: 18px; line-height: 1.8; text-align: justify;">
                    Cheers to a prosperous and healthy 2025! 🎁🩸
                    </p>
                    <p style="font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; color: #8b0000;">
                    Warm wishes,<br>The BloodFlow Team
                    </p>
                    <div style="text-align: center; margin-top: 30px;">
                        <img src="cid:bloodflowLogo" alt="BloodFlow Logo" style="width: 120px; height: auto;">
                    </div>
                </div>
        `,
        attachments: [
            {
            filename: "christmasEmailImage.jpeg",
            content: imageContent,
            cid: "christmasImage",
            },
            {
                filename: "bloodflowLogo.png",
                path: path.resolve(__dirname, "./logo.png"),
                cid: "bloodflowLogo", 
            },
        ],
        };

        await transporter.sendMail(mailOptions);
        console.log(`Christmas email sent to ${email}`);
        }
    } catch (error) {
        console.error("Error sending test email:", error);
    }
}

sendChristmasEmails();
