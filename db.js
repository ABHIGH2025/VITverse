const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/vitverse', {})
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.error(" MongoDB connection error:", err));

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));


const StudentSchema = new mongoose.Schema({
    studentId: String,
    fullName: String,
    email: String,
    bio: String,
    password: String,
    notificationPreferences: [String]
});
const MarketplaceSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number
});
const EventSchema = new mongoose.Schema({
    title: String,
    date: Date,
    description: String
});
const MessageSchema = new mongoose.Schema({
    senderId: String,
    recipientId: String,
    content: String
});
const GroupSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: String
});
const NewsSchema = new mongoose.Schema({
    title: String,
    content: String
});


const Student = mongoose.model('Student', StudentSchema);
const Marketplace = mongoose.model('Marketplace', MarketplaceSchema);
const Event = mongoose.model('Event', EventSchema);
const Message = mongoose.model('Message', MessageSchema);
const Group = mongoose.model('Group', GroupSchema);
const News = mongoose.model('News', NewsSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});
app.get('/news', (req, res) => {
    res.sendFile(path.join(__dirname, 'news.html'));
});
app.get('/marketplace', (req, res) => {
    res.sendFile(path.join(__dirname, 'marketplace.html'));
});
app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'events.html'));
});
app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'settings.html'));
});
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});
app.get('/message', (req, res) => {
    res.sendFile(path.join(__dirname, 'message.html'));
});
app.get('/group', (req, res) => {
    res.sendFile(path.join(__dirname, 'group.html'));
});

app.post('/addUser', async (req, res) => {
    try {
        const {
            studentId,
            fullName,
            email,
            bio,
            password
        } = req.body;
        if (!studentId || !fullName || !email || !bio || !password) {
            return res.status(400).send("All fields are required.");
        }
        const existingUser = await Student.findOne({
            email
        });
        if (existingUser) {
            return res.status(400).send("Email already in use.");
        }
        const user = new Student({
            studentId,
            fullName,
            email,
            bio,
            password
        });
        await user.save();
        res.send("User created successfully.");
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).send("Error adding user.");
    }
});

app.post('/login', async (req, res) => {
    const {
        email,
        password
    } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required fields."
        });
    }
    try {
        const user = await Student.findOne({
            email
        });
        if (!user) {
            console.log(` Login attempt for non-existent user: ${email}`);
            return res.status(404).json({
                success: false,
                message: "Account not found. Please sign up."
            });
        }
        if (user.password !== password) {
            console.log(` Failed login attempt for: ${email}`);
            return res.status(401).json({
                success: false,
                message: "Incorrect password. Please try again."
            });
        }
        req.session.studentId = user.studentId;
        console.log(`Successful login for: ${user.email}`);
        return res.json({
            success: true,
            message: "Authentication successful. Redirecting..."
        });
    } catch (error) {
        console.error(" Server error during login:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later."
        });
    }
});

app.get('/marketplace/items', async (req, res) => {
    try {
        const products = await Marketplace.find();
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error fetching products."
        });
    }
});
app.post('/marketplace/add', async (req, res) => {
    try {
        const {
            name,
            description,
            price
        } = req.body;
        const product = new Marketplace({
            name,
            description,
            price
        });
        await product.save();
        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error adding product."
        });
    }
});
app.delete('/marketplace/delete/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        await Marketplace.findByIdAndDelete(id);
        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error deleting product."
        });
    }
});

app.get('/events/items', async (req, res) => {
    try {
        const events = await Event.find({});
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error fetching events."
        });
    }
});
app.post('/events/add', async (req, res) => {
    try {
        const {
            title,
            date,
            description
        } = req.body;
        const newEvent = new Event({
            title,
            date,
            description
        });
        await newEvent.save();
        res.json({
            success: true,
            message: 'Event added successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error adding event."
        });
    }
});
app.delete('/events/delete/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        await Event.findByIdAndDelete(id);
        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error deleting event."
        });
    }
});

app.get('/messages/items', async (req, res) => {
    try {
        const messages = await Message.find({});
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error fetching messages."
        });
    }
});
app.post('/messages/add', async (req, res) => {
    try {
        const {
            senderId,
            recipientId,
            content
        } = req.body;
        const newMessage = new Message({
            senderId,
            recipientId,
            content
        });
        await newMessage.save();
        res.json({
            success: true,
            message: 'Message sent successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error sending message."
        });
    }
});
app.delete('/messages/delete/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        await Message.findByIdAndDelete(id);
        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error deleting message."
        });
    }
});
app.get('/groups/items', async (req, res) => {
    try {
        const groups = await Group.find();
        res.json(groups);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error fetching groups."
        });
    }
});
app.post('/groups/add', async (req, res) => {
    try {
        const {
            name,
            description,
            category
        } = req.body;
        const group = new Group({
            name,
            description,
            category
        });
        await group.save();
        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error adding group."
        });
    }
});
app.delete('/groups/delete/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        await Group.findByIdAndDelete(id);
        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error deleting group."
        });
    }
});

app.get('/news/items', async (req, res) => {
    try {
        const newsItems = await News.find();
        res.json(newsItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error fetching news."
        });
    }
});
app.post('/news/add', async (req, res) => {
    try {
        const {
            title,
            content
        } = req.body;
        const newsItem = new News({
            title,
            content
        });
        await newsItem.save();
        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error adding news."
        });
    }
});
app.delete('/news/delete/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        await News.findByIdAndDelete(id);
        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error deleting news."
        });
    }
});

app.post('/updateProfile', async (req, res) => {
    const {
        studentId
    } = req.session;
    if (!studentId) return res.status(401).send("Unauthorized.");
    try {
        const {
            fullName,
            email,
            bio
        } = req.body;
        const user = await Student.findOne({
            studentId
        });
        if (!user) return res.status(404).send("User not found.");
        user.fullName = fullName;
        user.email = email;
        user.bio = bio;
        await user.save();
        return res.send("Profile updated successfully.");
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).send("Server Error");
    }
});

app.post('/updateSettings', async (req, res) => {
    const {
        studentId
    } = req.session;
    if (!studentId) return res.status(401).send("Unauthorized.");
    try {
        const {
            currentPassword,
            newPassword,
            confirmNewPassword,
            notificationPreferences
        } = req.body;
        const user = await Student.findOne({
            studentId
        });
        if (!user) return res.status(404).send("User not found.");
        if (user.password !== currentPassword) {
            return res.status(400).send("Incorrect current password.");
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).send("New password and confirm password do not match.");
        }
        user.password = newPassword;
        user.notificationPreferences = Array.isArray(notificationPreferences) ? notificationPreferences : notificationPreferences;
        await user.save();
        return res.send("Settings updated successfully.");
    } catch (error) {
        console.error(" Server error during settings update:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
