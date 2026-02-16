
const express = require("express");
const session = require("express-session");
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const axios = require("axios");
const http = require("http");
const socketIO = require("socket.io");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const sqlite3 = require("better-sqlite3");
const config = require("./config");
const multer = require("multer");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: config.system.timeouts.sessionMaxAge
    }
}));

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const ticketsDir = path.join(dataDir, "tickets");
if (!fs.existsSync(ticketsDir)) {
    fs.mkdirSync(ticketsDir);
}

const postsMediaDir = path.join(dataDir, "posts_media");
if (!fs.existsSync(postsMediaDir)) {
    fs.mkdirSync(postsMediaDir);
}

const videosDir = path.join(dataDir, "videos");
if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir);
}

const imagesDir = path.join(dataDir, "images");
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

app.use("/data/posts_media", express.static(postsMediaDir));
app.use("/data/videos", express.static(videosDir));
app.use("/data/images", express.static(imagesDir));

const dbPath = path.join(dataDir, "database.db");
const db = sqlite3(dbPath);
global.db = db;

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        discriminator TEXT,
        avatar TEXT,
        global_name TEXT,
        lastSeen INTEGER,
        points INTEGER DEFAULT 0,
        status TEXT DEFAULT 'offline',
        verified INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS store_admins (
        id TEXT PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS store_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS store_products (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT,
        video TEXT,
        download_link TEXT,
        expiry_days INTEGER,
        role_id TEXT,
        views INTEGER DEFAULT 0,
        purchases INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (category_id) REFERENCES store_categories(id)
    );

    CREATE TABLE IF NOT EXISTS store_purchases (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        price REAL NOT NULL,
        paypal_order_id TEXT,
        purchase_date INTEGER DEFAULT (strftime('%s', 'now')),
        expiry_date INTEGER,
        renewal_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'completed',
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES store_products(id)
    );

    CREATE TABLE IF NOT EXISTS store_discount_codes (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount_percent REAL NOT NULL,
        active INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    );

    CREATE TABLE IF NOT EXISTS banned (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        username TEXT NOT NULL,
        avatar TEXT,
        adminId TEXT NOT NULL,
        adminName TEXT NOT NULL,
        reason TEXT,
        timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS points (
        adminId TEXT PRIMARY KEY,
        points INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ratings (
        id TEXT PRIMARY KEY,
        ticketId TEXT NOT NULL,
        ticketTitle TEXT NOT NULL,
        userId TEXT NOT NULL,
        username TEXT NOT NULL,
        userAvatar TEXT,
        adminId TEXT,
        adminName TEXT,
        adminAvatar TEXT,
        rating INTEGER NOT NULL,
        comment TEXT,
        timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
        userId TEXT PRIMARY KEY,
        sessionData TEXT NOT NULL,
        expires INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ticket_viewers (
        ticketId TEXT NOT NULL,
        userId TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        PRIMARY KEY (ticketId, userId)
    );

    CREATE TABLE IF NOT EXISTS discord_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        messages_count INTEGER DEFAULT 0,
        joins_count INTEGER DEFAULT 0,
        leaves_count INTEGER DEFAULT 0,
        total_members INTEGER DEFAULT 0,
        timestamp INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        media_path TEXT,
        media_type TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS post_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        parent_id TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (parent_id) REFERENCES post_comments(id)
    );

    CREATE TABLE IF NOT EXISTS post_likes (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        reaction TEXT DEFAULT 'like',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS post_notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        post_id TEXT,
        comment_id TEXT,
        from_user_id TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (from_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_daily_limits (
        user_id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        posts_count INTEGER DEFAULT 0,
        last_post_time INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS post_views (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS comment_likes (
        id TEXT PRIMARY KEY,
        comment_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (comment_id) REFERENCES post_comments(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(comment_id, user_id)
    );
`);

try {
    db.exec("ALTER TABLE store_products ADD COLUMN views INTEGER DEFAULT 0");
} catch (error) {}

try {
    db.exec("ALTER TABLE store_products ADD COLUMN purchases INTEGER DEFAULT 0");
} catch (error) {}

try {
    db.exec("ALTER TABLE store_products ADD COLUMN downloads INTEGER DEFAULT 0");
} catch (error) {}

try {
    db.exec("ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 0");
} catch (error) {}

try {
    db.exec("ALTER TABLE posts ADD COLUMN views_count INTEGER DEFAULT 0");
} catch (error) {}

try {
    db.exec("ALTER TABLE store_products ADD COLUMN role_id TEXT");
} catch (error) {}

try {
    db.exec("ALTER TABLE store_purchases ADD COLUMN renewal_count INTEGER DEFAULT 0");
} catch (error) {}

const defaultDiscountCodes = [
    { code: "ADMIN10", discount: 0.1 },
    { code: "WELCOME20", discount: 0.2 },
    { code: "SAVE15", discount: 0.15 },
    { code: "PREMIUM30", discount: 0.3 }
];

defaultDiscountCodes.forEach(discountCode => {
    try {
        db.prepare("INSERT OR IGNORE INTO store_discount_codes (id, code, discount_percent) VALUES (?, ?, ?)")
          .run(uuidv4(), discountCode.code, discountCode.discount);
    } catch (error) {}
});

const settingsCheck = db.prepare("SELECT COUNT(*) as count FROM settings").get();
if (settingsCheck.count === 0) {
    let settingsStmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    settingsStmt.run("background", process.env.EMBED_BACKGROUND);
    settingsStmt.run("logo", process.env.EMBED_LOGO);
    settingsStmt.run("music", "");
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadDir = file.mimetype.startsWith("video/") ? videosDir : imagesDir;
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
        fieldSize: 100 * 1024 * 1024
    },
    fileFilter(req, file, cb) {
        let allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mov|avi|mkv|3gp|flv|wmv|webp|m4v|mpeg|mpg/;
        let extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        let mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Invalid file type. Only images and videos are allowed."));
    }
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

let dailyStats = {
    messages: 0,
    joins: 0,
    leaves: 0,
    totalMembers: 0
};

async function updateDiscordStats() {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const today = new Date().toISOString().split('T')[0];
        
        dailyStats.totalMembers = guild.memberCount;
        
        const existingStats = db.prepare("SELECT * FROM discord_stats WHERE date = ?").get(today);
        
        if (existingStats) {
            db.prepare("UPDATE discord_stats SET messages_count = ?, joins_count = ?, leaves_count = ?, total_members = ? WHERE date = ?")
              .run(dailyStats.messages, dailyStats.joins, dailyStats.leaves, dailyStats.totalMembers, today);
        } else {
            db.prepare("INSERT INTO discord_stats (date, messages_count, joins_count, leaves_count, total_members) VALUES (?, ?, ?, ?, ?)")
              .run(today, dailyStats.messages, dailyStats.joins, dailyStats.leaves, dailyStats.totalMembers);
        }
    } catch (error) {
        console.error("Error updating Discord stats:", error);
    }
}

function initializeDailyStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = db.prepare("SELECT * FROM discord_stats WHERE date = ?").get(today);
    
    if (todayStats) {
        dailyStats.messages = todayStats.messages_count;
        dailyStats.joins = todayStats.joins_count;
        dailyStats.leaves = todayStats.leaves_count;
        dailyStats.totalMembers = todayStats.total_members;
    }
}

async function sendTicketMessage() {
    try {
        const channel = await client.channels.fetch(process.env.TICKET_CHANNEL_ID);
        const messages = await channel.messages.fetch({ limit: 10 });
        
        if (messages.size > 0) {
            await channel.bulkDelete(messages);
        }
        
        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(config.messages.ticketEmbedTitle)
                    .setDescription(config.messages.ticketEmbedDescription)
                    .setColor(config.visual.colors.primary)
                    .setImage(process.env.EMBED_BACKGROUND)
                    .setThumbnail(process.env.EMBED_LOGO)
                    .setTimestamp()
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("open_ticket")
                            .setLabel(config.messages.ticketButtonLabel)
                            .setStyle(ButtonStyle.Primary)
                    )
            ]
        });
        
        console.log("Ticket message sent successfully");
    } catch (error) {
        console.error("Error sending ticket message:", error);
    }
}
// Community Server TovStudio
async function checkAdminStatus(userId) {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        const isAdmin = member.roles.cache.has(process.env.ADMIN_ROLE_ID);
        
        if (isAdmin) {
            const existingAdmin = db.prepare("SELECT COUNT(*) as count FROM admins WHERE id = ?").get(userId);
            if (existingAdmin.count === 0) {
                db.prepare("INSERT OR IGNORE INTO admins (id) VALUES (?)").run(userId);
                const adminCount = db.prepare("SELECT COUNT(*) as count FROM admins").get();
                console.log(`${adminCount.count} admins saved to database`);
            }
        }
        
        return isAdmin;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

async function checkStoreAdminStatus(userId) {
    try {
        if (!process.env.ROLESTORE_ID) {
            console.log("ROLESTORE_ID not configured, checking admin status instead");
            return await checkAdminStatus(userId);
        }
        
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        const isStoreAdmin = member.roles.cache.has(process.env.ROLESTORE_ID);
        
        if (isStoreAdmin) {
            const existingStoreAdmin = db.prepare("SELECT COUNT(*) as count FROM store_admins WHERE id = ?").get(userId);
            if (existingStoreAdmin.count === 0) {
                db.prepare("INSERT OR IGNORE INTO store_admins (id) VALUES (?)").run(userId);
                const storeAdminCount = db.prepare("SELECT COUNT(*) as count FROM store_admins").get();
                console.log(`${storeAdminCount.count} store admins saved to database`);
            }
        }
        
        return isStoreAdmin;
    } catch (error) {
        console.error("Error checking store admin status:", error);
        return false;
    }
}

async function checkVerificationStatus(userId) {
    try {
        if (!process.env.VERIFICATION_ROLE_ID) return false;
        
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        const isVerified = member.roles.cache.has(process.env.VERIFICATION_ROLE_ID);
        
        if (isVerified) {
            db.prepare("UPDATE users SET verified = 1 WHERE id = ?").run(userId);
        }
        
        return isVerified;
    } catch (error) {
        console.error("Error checking verification status:", error);
        return false;
    }
}

async function checkUserRoles(userId) {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        
        let roles = {
            youtube: false,
            tiktok: false,
            store: false,
            vip: false,
            verified: false
        };
        
        if (process.env.YOUTUBE_ROLE_ID && member.roles.cache.has(process.env.YOUTUBE_ROLE_ID)) {
            roles.youtube = true;
        }
        
        if (process.env.TIKTOK_ROLE_ID && member.roles.cache.has(process.env.TIKTOK_ROLE_ID)) {
            roles.tiktok = true;
        }
        
        if (process.env.ServerBooster_ROLE_ID && member.roles.cache.has(process.env.ServerBooster_ROLE_ID)) {
            roles.store = true;
        }
        
        if (process.env.VIP_ROLE_ID && member.roles.cache.has(process.env.VIP_ROLE_ID)) {
            roles.vip = true;
        }
        
        if (process.env.VERIFICATION_ROLE_ID && member.roles.cache.has(process.env.VERIFICATION_ROLE_ID)) {
            roles.verified = true;
            db.prepare("UPDATE users SET verified = 1 WHERE id = ?").run(userId);
        }
        
        return roles;
    } catch (error) {
        console.error("Error checking user roles:", error);
        return {
            youtube: false,
            tiktok: false,
            store: false,
            vip: false,
            verified: false
        };
    }
}

async function checkRoleExists(roleId) {
    try {
        if (!roleId) return false;
        
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const role = await guild.roles.fetch(roleId);
        
        return !!role;
    } catch (error) {
        console.error("Error checking role exists:", error);
        return false;
    }
}

async function giveRoleToUser(userId, roleId) {
    try {
        if (!roleId) return true;
        
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        const role = await guild.roles.fetch(roleId);
        
        if (!role) {
            console.error(`Role ${roleId} not found`);
            return false;
        }
        
        if (!member.roles.cache.has(roleId)) {
            await member.roles.add(role);
            console.log(`Role ${roleId} added to user ${userId}`);
        }
        
        return true;
    } catch (error) {
        console.error("Error giving role to user:", error);
        return false;
    }
}

async function removeRoleFromUser(userId, roleId) {
    try {
        if (!roleId) return true;
        
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        const role = await guild.roles.fetch(roleId);
        
        if (!role) return true;
        
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(role);
            console.log(`Role ${roleId} removed from user ${userId}`);
        }
        
        return true;
    } catch (error) {
        console.error("Error removing role from user:", error);
        return false;
    }
}

async function sendPurchaseNotificationToUser(userId, product, purchase) {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
        const settings = getSettings();
        
        const embed = new EmbedBuilder()
            .setTitle("🎉 Purchase Completed Successfully!")
            .setDescription(`Hello ${user.global_name || user.username}!\n\nYour purchase has been completed successfully ✅`)
            .addFields(
                { name: "📦 Product", value: product.title, inline: true },
                { name: "💰 Price Paid", value: `$${purchase.price}`, inline: true },
                { name: "🗓️ Purchase Date", value: new Date().toLocaleDateString("en-US"), inline: true },
                { name: "📋 Description", value: product.description.substring(0, 200) + (product.description.length > 200 ? "..." : ""), inline: false }
            )
            .setColor("#48bb78")
            .setThumbnail(product.image || settings.logo)
            .setTimestamp();
        
        if (product.expiry_days) {
            const expiryDate = new Date(Date.now() + (product.expiry_days * 24 * 60 * 60 * 1000));
            embed.addFields({ name: "⏰ Expires", value: expiryDate.toLocaleDateString("en-US"), inline: true });
        } else {
            embed.addFields({ name: "♾️ Valid", value: "Forever", inline: true });
        }
        
        if (product.download_link) {
            embed.addFields({ name: "📥 Download Link", value: product.download_link, inline: false });
        }
        
        if (product.role_id) {
            embed.addFields({ name: "🏷️ Role", value: "Role has been added to your account!", inline: true });
        }
        
        await member.send({ embeds: [embed] });
    } catch (error) {
        console.error("Error sending purchase notification to user:", error);
    }
}

async function sendPurchaseNotificationToAdmins(userId, product, purchase) {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
        const settings = getSettings();
        
        const embed = new EmbedBuilder()
            .setTitle("💸 New Purchase!")
            .setDescription("A new purchase has been completed in the store")
            .addFields(
                { name: "👤 Buyer", value: `${user.global_name || user.username} (${user.id})`, inline: true },
                { name: "📦 Product", value: product.title, inline: true },
                { name: "💰 Price", value: `$${purchase.price}`, inline: true },
                { name: "🆔 Order ID", value: purchase.paypal_order_id, inline: true },
                { name: "🗓️ Date", value: new Date().toLocaleDateString("en-US"), inline: true }
            )
            .setColor("#7e69ab")
            .setThumbnail(user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : settings.logo)
            .setTimestamp();
        
        if (product.expiry_days) {
            embed.addFields({ name: "⏰ Validity Period", value: `${product.expiry_days} days`, inline: true });
        }
        
        const storeAdmins = db.prepare("SELECT id FROM store_admins").all();
        for (const admin of storeAdmins) {
            try {
                const adminMember = await guild.members.fetch(admin.id);
                await adminMember.send({ embeds: [embed] });
            } catch (error) {
                console.error(`Failed to send notification to admin ${admin.id}:`, error);
            }
        }
    } catch (error) {
        console.error("Error sending purchase notification to admins:", error);
    }
}

async function sendExpiryWarningNotification(userId, product, purchase, daysLeft) {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
        const settings = getSettings();
        
        const embed = new EmbedBuilder()
            .setTitle("⚠️ Warning: Subscription Expiring Soon!")
            .setDescription(`Hello ${user.global_name || user.username}!\n\nYour subscription for the following product is about to expire.`)
            .addFields(
                { name: "📦 Product", value: product.title, inline: true },
                { name: "⏰ Days Left", value: `${daysLeft} days`, inline: true },
                { name: "💰 Original Price", value: `$${product.price}`, inline: true },
                { name: "🗓️ Expiry Date", value: new Date(purchase.expiry_date).toLocaleDateString("en-US"), inline: true }
            )
            .setColor("#f6ad55")
            .setThumbnail(product.image || settings.logo)
            .setTimestamp()
            .setFooter({ text: "You can renew your subscription through the store" });
        
        await member.send({ embeds: [embed] });
    } catch (error) {
        console.error("Error sending expiry warning notification:", error);
    }
}

async function sendExpiryNotification(userId, product, purchase) {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
        const settings = getSettings();
        
        const embed = new EmbedBuilder()
            .setTitle("❌ Subscription Expired!")
            .setDescription(`Hello ${user.global_name || user.username}!\n\nYour subscription for the following product has expired.`)
            .addFields(
                { name: "📦 Product", value: product.title, inline: true },
                { name: "🗓️ Expiry Date", value: new Date(purchase.expiry_date).toLocaleDateString("en-US"), inline: true },
                { name: "💰 To Renew", value: `$${product.price}`, inline: true }
            )
            .setColor("#f56565")
            .setThumbnail(product.image || settings.logo)
            .setTimestamp()
            .setFooter({ text: "You can repurchase from the store to regain access" });
        
        if (product.role_id) {
            embed.addFields({ name: "🏷️ Role", value: "Role has been removed from your account", inline: true });
        }
        
        await member.send({ embeds: [embed] });
    } catch (error) {
        console.error("Error sending expiry notification:", error);
    }
}

function checkExpiringPurchases() {
    try {
        const now = Date.now();
        
        const expiringPurchases = db.prepare(`
            SELECT sp.*, p.title, p.image, p.price, p.role_id 
            FROM store_purchases sp 
            JOIN store_products p ON sp.product_id = p.id 
            WHERE sp.expiry_date IS NOT NULL 
            AND sp.expiry_date > ? 
            AND sp.expiry_date <= ? 
            AND sp.status = 'completed'
        `).all(now, now + (5 * 24 * 60 * 60 * 1000));
        
        expiringPurchases.forEach(purchase => {
            const daysLeft = Math.ceil((purchase.expiry_date - now) / (24 * 60 * 60 * 1000));
            sendExpiryWarningNotification(purchase.user_id, purchase, purchase, daysLeft);
        });
        
        const expiredPurchases = db.prepare(`
            SELECT sp.*, p.title, p.image, p.price, p.role_id 
            FROM store_purchases sp 
            JOIN store_products p ON sp.product_id = p.id 
            WHERE sp.expiry_date IS NOT NULL 
            AND sp.expiry_date <= ? 
            AND sp.status = 'completed'
        `).all(now);
        
        expiredPurchases.forEach(async (purchase) => {
            await sendExpiryNotification(purchase.user_id, purchase, purchase);
            
            if (purchase.role_id) {
                await removeRoleFromUser(purchase.user_id, purchase.role_id);
            }
            
            db.prepare("UPDATE store_purchases SET status = 'expired' WHERE id = ?").run(purchase.id);
        });
    } catch (error) {
        console.error("Error checking expiring purchases:", error);
    }
}

function isUserBanned(userId) {
    try {
        return db.prepare("SELECT COUNT(*) as count FROM banned WHERE userId = ?").get(userId).count > 0;
    } catch (error) {
        console.error("Error checking banned status:", error);
        return false;
    }
}

function checkAuth(req, res, next) {
    if (req.session && req.session.user) {
        if (isUserBanned(req.session.user.id)) {
            return res.status(403).json({ error: "You are banned from the system" });
        }
        return next();
    }
    res.status(401).json({ error: "Unauthorized" });
}

async function sendAdminNotification(ticket, message = null) {
    try {
        const channel = await client.channels.fetch(process.env.ADMIN_CHANNEL_ID);
        
        if (message) {
            await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`New message in ticket: ${ticket.title}`)
                        .setDescription(`${message.username}: ${message.content.substring(0, 100)}${message.content.length > 100 ? "..." : ""}`)
                        .setColor(config.visual.colors.info)
                        .setTimestamp()
                ]
            });
        } else {
            const settings = getSettings();
            const user = db.prepare("SELECT * FROM users WHERE id = ?").get(ticket.userId);
            const avatarUrl = user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png";
            
            await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(config.messages.newTicketTitle)
                        .setDescription(config.messages.newTicketDescription(ticket.title, ticket.type, ticket.username))
                        .setColor(config.visual.colors.success)
                        .setThumbnail(avatarUrl)
                        .setTimestamp()
                ]
            });
            
            const admins = db.prepare("SELECT id FROM admins").all();
            const guild = await client.guilds.fetch(process.env.GUILD_ID);
            
            for (const admin of admins) {
                try {
                    const adminMember = await guild.members.fetch(admin.id);
                    await adminMember.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(config.messages.newTicketTitle)
                                .setDescription(config.messages.newTicketDescription(ticket.title, ticket.type, ticket.username))
                                .setColor(config.visual.colors.success)
                                .setThumbnail(avatarUrl)
                                .setTimestamp()
                                .setURL`https://${process.env.HOST}`(`http://${process.env.HOST || "localhost"}:${process.env.PORT}`)
                        ]
                    });
                } catch (error) {
                    console.error(`Failed to send DM to admin ${admin.id}:`, error);
                }
            }
        }
    } catch (error) {
        console.error("Error sending admin notification:", error);
    }
}

async function sendUserNotification(userId, ticketId, message) {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        
        if (member) {
            const settings = getSettings();
            const ticket = JSON.parse(fs.readFileSync(path.join(ticketsDir, `${ticketId}.json`)));
            const avatarUrl = message.avatar ? `https://cdn.discordapp.com/avatars/${message.userId}/${message.avatar}.png` : settings.logo;
            
            const embed = new EmbedBuilder()
                .setTitle(config.messages.newResponseTitle(ticket.title))
                .setDescription(message.content.substring(0, 200) + (message.content.length > 200 ? "..." : ""))
                .setColor(config.visual.colors.info)
                .setThumbnail(avatarUrl)
                .setAuthor({ name: message.username, iconURL: avatarUrl })
                .setTimestamp()
                .setURL`https://${process.env.HOST}`(`http://${process.env.HOST || "localhost"}:${process.env.PORT}`);
            
            if (message.attachments && message.attachments.length > 0) {
                embed.setImage(message.attachments[0]);
            }
            
            await member.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error("Error sending user notification:", error);
    }
}

async function sendTicketStatusNotification(userId, ticket, status, admin) {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        
        if (member) {
            const settings = getSettings();
            const avatarUrl = admin.avatar ? `https://cdn.discordapp.com/avatars/${admin.id}/${admin.avatar}.png` : settings.logo;
            
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(config.messages.ticketStatusUpdateTitle(ticket.title))
                        .setDescription(config.messages.ticketStatusUpdateDescription(config.messages.statusLabelsEnglish[status] || config.messages.statusLabelsEnglish["on-hold"]))
                        .setColor(config.visual.statusColors[status] || config.visual.statusColors["on-hold"])
                        .setThumbnail(avatarUrl)
                        .setAuthor({ name: admin.username, iconURL: avatarUrl })
                        .setTimestamp()
                        .setURL`https://${process.env.HOST}`(`https://${process.env.HOST}`)
                ]
            });
        }
    } catch (error) {
        console.error("Error sending ticket status notification:", error);
    }
}

async function sendTicketAcceptedNotification(userId, ticket, admin) {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        
        if (member) {
            const settings = getSettings();
            const avatarUrl = admin.avatar ? `https://cdn.discordapp.com/avatars/${admin.id}/${admin.avatar}.png` : settings.logo;
            
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(config.messages.ticketAcceptedTitle(ticket.title))
                        .setDescription(config.messages.ticketAcceptedDescription(admin.username))
                        .setColor(config.visual.colors.ticketAccepted)
                        .setThumbnail(avatarUrl)
                        .setAuthor({ name: admin.username, iconURL: avatarUrl })
                        .setTimestamp()
                        .setURL`https://${process.env.HOST}`(`https://${process.env.HOST}`)
                ]
            });
        }
    } catch (error) {
        console.error("Error sending ticket accepted notification:", error);
    }
}

async function sendBanNotification(userId, reason, admin) {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);
        
        if (member) {
            const settings = getSettings();
            const avatarUrl = admin.avatar ? `https://cdn.discordapp.com/avatars/${admin.id}/${admin.avatar}.png` : settings.logo;
            
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(config.messages.banNotificationTitle)
                        .setDescription(config.messages.banNotificationDescription(admin.username, reason))
                        .setColor(config.visual.colors.error)
                        .setThumbnail(avatarUrl)
                        .setAuthor({ name: admin.username, iconURL: avatarUrl })
                        .setTimestamp()
                ]
            });
        }
    } catch (error) {
        console.error("Error sending ban notification:", error);
    }
}

function updateAdminPoints(adminId) {
    try {
        db.prepare("INSERT OR IGNORE INTO points (adminId, points) VALUES (?, 0)").run(adminId);
        db.prepare("UPDATE points SET points = points + 1 WHERE adminId = ?").run(adminId);
    } catch (error) {
        console.error("Error updating admin points:", error);
    }
}

function getSettings() {
    const settings = db.prepare("SELECT key, value FROM settings").all();
    const settingsObj = {};
    settings.forEach(setting => {
        settingsObj[setting.key] = setting.value;
    });
    return settingsObj;
}

function addTicketViewer(ticketId, userId) {
    try {
        db.prepare("INSERT OR IGNORE INTO ticket_viewers (ticketId, userId, timestamp) VALUES (?, ?, ?)")
          .run(ticketId, userId, Date.now());
    } catch (error) {
        console.error("Error adding ticket viewer:", error);
    }
}

function getTicketViewers(ticketId) {
    try {
        return db.prepare("SELECT tv.userId, u.username, u.avatar FROM ticket_viewers tv JOIN users u ON tv.userId = u.id WHERE ticketId = ? ORDER BY tv.timestamp DESC").all(ticketId);
    } catch (error) {
        console.error("Error getting ticket viewers:", error);
        return [];
    }
}

function saveMediaFromBase64(base64Data, filename) {
    try {
        if (!base64Data) {
            throw new Error("No base64 data provided");
        }
        
        let cleanBase64 = base64Data.toString().trim();
        let mimeType = "video/mp4";
        let base64String = cleanBase64;
        
        const dataUrlMatch = cleanBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (dataUrlMatch) {
            mimeType = dataUrlMatch[1];
            base64String = dataUrlMatch[2];
        }
        
        base64String = base64String.replace(/\s/g, '');
        
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64String)) {
            throw new Error("Invalid base64 characters detected");
        }
        
        const buffer = Buffer.from(base64String, 'base64');
        
        if (buffer.length === 0) {
            throw new Error("Empty buffer after base64 decode");
        }
        
        let extension = ".mp4";
        if (mimeType.includes("webm")) extension = ".webm";
        else if (mimeType.includes("mov") || mimeType.includes("quicktime")) extension = ".mov";
        else if (mimeType.includes("avi")) extension = ".avi";
        else if (mimeType.includes("mkv")) extension = ".mkv";
        else if (mimeType.includes("png")) extension = ".png";
        else if (mimeType.includes("gif")) extension = ".gif";
        else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) extension = ".jpg";
        else if (mimeType.includes("webp")) extension = ".webp";
        
        let mediaType, targetDir;
        if (mimeType.startsWith("video/") || [".mp4", ".webm", ".mov", ".avi", ".mkv"].includes(extension)) {
            mediaType = "video";
            targetDir = videosDir;
        } else if (extension === ".gif") {
            mediaType = "gif";
            targetDir = imagesDir;
        } else {
            mediaType = "image";
            targetDir = imagesDir;
        }
        
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        const finalFilename = `${filename}${extension}`;
        const filePath = path.join(targetDir, finalFilename);
        
        fs.writeFileSync(filePath, buffer);
        
        if (!fs.existsSync(filePath)) {
            throw new Error("File was not saved successfully");
        }
        
        const fileSize = fs.statSync(filePath).size;
        
        return {
            filename: finalFilename,
            mediaType: mediaType,
            path: filePath,
            size: fileSize
        };
    } catch (error) {
        console.error("Error in saveMediaFromBase64:", error);
        throw error;
    }
}

function createPostNotification(userId, type, postId, fromUserId, commentId = null) {
    try {
        const notificationId = uuidv4();
        db.prepare("INSERT INTO post_notifications (id, user_id, type, post_id, comment_id, from_user_id) VALUES (?, ?, ?, ?, ?, ?)")
          .run(notificationId, userId, type, postId, commentId, fromUserId);
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}

function checkPostLimit(userId) {
    try {
        const today = new Date().toISOString().split('T')[0];
        let userLimit = db.prepare("SELECT * FROM user_daily_limits WHERE user_id = ? AND date = ?").get(userId, today);
        
        if (!userLimit) {
            db.prepare("INSERT OR REPLACE INTO user_daily_limits (user_id, date, posts_count, last_post_time) VALUES (?, ?, 0, 0)")
              .run(userId, today);
            userLimit = { posts_count: 0, last_post_time: 0 };
        }
        
        const now = Date.now();
        const timeSinceLastPost = now - userLimit.last_post_time;
        
        if (userLimit.posts_count >= 50) {
            return { allowed: false, reason: "Daily post limit exceeded" };
        }
        
        if (timeSinceLastPost < 300000 && userLimit.last_post_time > 0) { // 5 minutes
            return { allowed: false, reason: "Please wait 5 minutes before posting again" };
        }
        
        return { allowed: true };
    } catch (error) {
        console.error("Error in checkPostLimit:", error);
        return { allowed: true };
    }
}

function updatePostLimit(userId) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const now = Date.now();
        
        db.prepare(`
            INSERT OR REPLACE INTO user_daily_limits (user_id, date, posts_count, last_post_time) 
            VALUES (?, ?, COALESCE((SELECT posts_count FROM user_daily_limits WHERE user_id = ? AND date = ?), 0) + 1, ?)
        `).run(userId, today, userId, today, now);
    } catch (error) {
        console.error("Error updating post limit:", error);
    }
}

function getMediaType(filename, mimetype) {
    const extension = path.extname(filename).toLowerCase();
    
    if (mimetype && mimetype.startsWith("video") || [".mp4", ".webm", ".mov", ".avi", ".mkv", ".3gp", ".flv", ".wmv", ".m4v", ".mpeg", ".mpg"].includes(extension)) {
        return "video";
    } else if (extension === ".gif" || (mimetype && mimetype.includes("gif"))) {
        return "gif";
    } else {
        return "image";
    }
}

function getMediaUrl(filename, mediaType) {
    if (!filename) return null;
    
    if (mediaType === "video") {
        return `/data/videos/${filename}`;
    } else if (mediaType === "gif" || mediaType === "image") {
        return `/data/images/${filename}`;
    } else {
        return `/data/posts_media/${filename}`;
    }
}

client.login(process.env.BOT_TOKEN);

client.on("ready", async () => {
    console.log("Discord bot logged in successfully");
    initializeDailyStats();
    await sendTicketMessage();
    updateDiscordStats();
    
    setInterval(updateDiscordStats, 5 * 60 * 1000);
    
    setInterval(checkExpiringPurchases, 24 * 60 * 60 * 1000);
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton() && interaction.customId === "open_ticket") {
        await interaction.reply({
            content: config.messages.ticketButtonResponse(process.env.HOST, process.env.PORT),
            ephemeral: true
        });
    }
});

client.on("messageCreate", (message) => {
    if (!message.author.bot && message.guild && message.guild.id === process.env.GUILD_ID) {
        dailyStats.messages++;
        io.emit("user_activity", { action: "message" });
    }
});

client.on("guildMemberAdd", (member) => {
    if (member.guild.id === process.env.GUILD_ID) {
        dailyStats.joins++;
        dailyStats.totalMembers = member.guild.memberCount;
        io.emit("user_activity", { action: "join" });
    }
});

client.on("guildMemberRemove", (member) => {
    if (member.guild.id === process.env.GUILD_ID) {
        dailyStats.leaves++;
        dailyStats.totalMembers = member.guild.memberCount;
        io.emit("user_activity", { action: "leave" });
    }
});

app.get("/api/social/highlights", checkAuth, (req, res) => {
    try {
        const topLikedPost = db.prepare(`
            SELECT p.*, u.username, u.global_name, u.avatar, u.verified, 
                   (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY likes_count DESC 
            LIMIT 1
        `).get();
        
        const topViewedVideo = db.prepare(`
            SELECT p.*, u.username, u.global_name, u.avatar, u.verified 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.media_type = 'video' 
            ORDER BY p.views_count DESC 
            LIMIT 1
        `).get();
        
        const mostActiveUser = db.prepare(`
            SELECT u.*, COUNT(p.id) as posts_count 
            FROM users u 
            JOIN posts p ON u.id = p.user_id 
            GROUP BY u.id 
            ORDER BY posts_count DESC 
            LIMIT 1
        `).get();
        
        const highlights = {
            topLikedPost: topLikedPost ? {
                ...topLikedPost,
                avatar_url: topLikedPost.avatar ? `https://cdn.discordapp.com/avatars/${topLikedPost.user_id}/${topLikedPost.avatar}.png` : null
            } : null,
            topViewedVideo: topViewedVideo ? {
                ...topViewedVideo,
                avatar_url: topViewedVideo.avatar ? `https://cdn.discordapp.com/avatars/${topViewedVideo.user_id}/${topViewedVideo.avatar}.png` : null
            } : null,
            mostActiveUser: mostActiveUser || null
        };
        
        res.json(highlights);
    } catch (error) {
        console.error("Error getting social highlights:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/posts", checkAuth, (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const offset = page * 5;
        
        const posts = db.prepare(`
            SELECT p.*, u.username, u.global_name, u.avatar, u.verified, 
                   COALESCE(p.views_count, 0) as views_count 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            GROUP BY p.id 
            ORDER BY p.created_at DESC 
            LIMIT ? OFFSET ?
        `).all(5, offset);
        
        const postsWithDetails = posts.map(async (post) => {
            let reactions = {};
            let userReaction = null;
            let reactionsCount = 0;
            let commentsCount = 0;
            
            try {
                const reactionStats = db.prepare("SELECT reaction, COUNT(*) as count FROM post_likes WHERE post_id = ? GROUP BY reaction").all(post.id);
                reactionStats.forEach(stat => {
                    reactions[stat.reaction] = stat.count;
                    reactionsCount += stat.count;
                });
                
                const userReactionData = db.prepare("SELECT reaction FROM post_likes WHERE post_id = ? AND user_id = ?").get(post.id, req.session.user.id);
                if (userReactionData) {
                    userReaction = userReactionData.reaction;
                }
                
                commentsCount = db.prepare("SELECT COUNT(*) as count FROM post_comments WHERE post_id = ?").get(post.id).count;
            } catch (error) {
                console.error("Error getting reactions:", error);
            }
            
            const userRoles = await checkUserRoles(post.user_id);
            
            return {
                ...post,
                avatar_url: post.avatar ? `https://cdn.discordapp.com/avatars/${post.user_id}/${post.avatar}.png` : null,
                verification_badge: post.verified ? process.env.VERIFICATION_BADGE_URL : null,
                roles: userRoles,
                media_url: post.media_path ? getMediaUrl(post.media_path, post.media_type) : null,
                reactions: reactions,
                user_reaction: userReaction,
                reactions_count: reactionsCount,
                comments_count: commentsCount
            };
        });
        
        Promise.all(postsWithDetails).then(posts => {
            res.json(posts);
        }).catch(error => {
            console.error("Error processing posts:", error);
            res.status(500).json({ error: "Server error" });
        });
    } catch (error) {
        console.error("Error getting posts:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/posts", checkAuth, upload.single("media"), (req, res) => {
    try {
        const { content, type, media_data } = req.body;
        const userId = req.session.user.id;
        
        if (!content && !req.file && !media_data) {
            return res.status(400).json({ error: "Content or media is required" });
        }
        
        if (content && content.length > 1000) {
            return res.status(400).json({ error: "Content must be 1000 characters or less" });
        }
        
        const limitCheck = checkPostLimit(userId);
        if (!limitCheck.allowed) {
            return res.status(429).json({ error: limitCheck.reason });
        }
        
        const postId = uuidv4();
        let mediaPath = null;
        let mediaType = "text";
        
        if (req.file) {
            mediaPath = req.file.filename;
            mediaType = getMediaType(req.file.originalname, req.file.mimetype);
        } else if (media_data) {
            try {
                const savedMedia = saveMediaFromBase64(media_data, postId);
                mediaPath = savedMedia.filename;
                mediaType = savedMedia.mediaType;
            } catch (error) {
                console.error("Error processing base64 media:", error);
                return res.status(400).json({ error: `Failed to process media: ${error.message}` });
            }
        }
        
        try {
            db.prepare("INSERT INTO posts (id, user_id, content, type, media_path, media_type, views_count) VALUES (?, ?, ?, ?, ?, ?, 0)")
              .run(postId, userId, content || "", mediaType, mediaPath, mediaType);
            
            updatePostLimit(userId);
        } catch (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error" });
        }
        
        checkUserRoles(userId).then(userRoles => {
            const newPost = db.prepare("SELECT p.*, u.username, u.global_name, u.avatar, u.verified FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?").get(postId);
            
            const postResponse = {
                ...newPost,
                avatar_url: newPost.avatar ? `https://cdn.discordapp.com/avatars/${newPost.user_id}/${newPost.avatar}.png` : null,
                verification_badge: newPost.verified ? process.env.VERIFICATION_BADGE_URL : null,
                roles: userRoles,
                reactions: {},
                user_reaction: null,
                reactions_count: 0,
                comments_count: 0,
                views_count: 0,
                media_url: newPost.media_path ? getMediaUrl(newPost.media_path, newPost.media_type) : null
            };
            
            io.emit("new_post", postResponse);
            res.status(201).json(postResponse);
        }).catch(error => {
            console.error("Error checking user roles:", error);
            res.status(500).json({ error: "Server error" });
        });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
});

app.delete("/api/posts/:id", checkAuth, (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user.id;
        
        const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        
        if (post.user_id !== userId && !req.session.isAdmin) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        
        if (post.media_path) {
            const mediaDir = post.media_type === "video" ? videosDir : imagesDir;
            const mediaPath = path.join(mediaDir, post.media_path);
            try {
                if (fs.existsSync(mediaPath)) {
                    fs.unlinkSync(mediaPath);
                }
            } catch (error) {
                console.error("Error deleting media file:", error);
            }
        }
        
        db.prepare("DELETE FROM post_likes WHERE post_id = ?").run(postId);
        db.prepare("DELETE FROM post_comments WHERE post_id = ?").run(postId);
        db.prepare("DELETE FROM post_views WHERE post_id = ?").run(postId);
        db.prepare("DELETE FROM post_notifications WHERE post_id = ?").run(postId);
        db.prepare("DELETE FROM posts WHERE id = ?").run(postId);
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/posts/:id/reaction", checkAuth, (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user.id;
        const { reaction } = req.body;
        
        if (!["like", "love", "laugh", "angry", "sad", "wow"].includes(reaction)) {
            return res.status(400).json({ error: "Invalid reaction type" });
        }
        
        const existingReaction = db.prepare("SELECT reaction FROM post_likes WHERE post_id = ? AND user_id = ?").get(postId, userId);
        
        if (existingReaction) {
            if (existingReaction.reaction === reaction) {
                db.prepare("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?").run(postId, userId);
            } else {
                db.prepare("UPDATE post_likes SET reaction = ? WHERE post_id = ? AND user_id = ?").run(reaction, postId, userId);
            }
        } else {
            const reactionId = uuidv4();
            db.prepare("INSERT INTO post_likes (id, post_id, user_id, reaction) VALUES (?, ?, ?, ?)").run(reactionId, postId, userId, reaction);
            
            const post = db.prepare("SELECT user_id FROM posts WHERE id = ?").get(postId);
            if (post && post.user_id !== userId) {
                createPostNotification(post.user_id, "reaction", postId, userId);
            }
        }
        
        let reactions = {};
        const reactionStats = db.prepare("SELECT reaction, COUNT(*) as count FROM post_likes WHERE post_id = ? GROUP BY reaction").all(postId);
        reactionStats.forEach(stat => {
            reactions[stat.reaction] = stat.count;
        });
        
        const userReactionData = db.prepare("SELECT reaction FROM post_likes WHERE post_id = ? AND user_id = ?").get(postId, userId);
        const reactionsCount = Object.values(reactions).reduce((sum, count) => sum + count, 0);
        
        io.emit("post_reaction_update", {
            post_id: postId,
            reactions: reactions,
            user_reaction: userReactionData?.reaction || null,
            reactions_count: reactionsCount,
            user_id: userId
        });
        
        res.json({
            reactions: reactions,
            user_reaction: userReactionData?.reaction || null,
            reactions_count: reactionsCount
        });
    } catch (error) {
        console.error("Error handling reaction:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/posts/:id/reactions", checkAuth, (req, res) => {
    try {
        const postId = req.params.id;
        
        const reactions = db.prepare(`
            SELECT u.username, u.global_name, u.avatar, u.verified, pl.user_id, pl.reaction 
            FROM post_likes pl 
            JOIN users u ON pl.user_id = u.id 
            WHERE pl.post_id = ? 
            ORDER BY pl.created_at DESC
        `).all(postId);
        
        Promise.all(reactions.map(async (reaction) => {
            const userRoles = await checkUserRoles(reaction.user_id);
            return {
                ...reaction,
                avatar_url: reaction.avatar ? `https://cdn.discordapp.com/avatars/${reaction.user_id}/${reaction.avatar}.png` : null,
                verification_badge: reaction.verified ? process.env.VERIFICATION_BADGE_URL : null,
                roles: userRoles
            };
        })).then(reactions => {
            res.json(reactions);
        }).catch(error => {
            console.error("Error getting user roles:", error);
            res.status(500).json({ error: "Server error" });
        });
    } catch (error) {
        console.error("Error getting reactions:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/posts/:id/view", checkAuth, (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user.id;
        
        const existingView = db.prepare("SELECT id FROM post_views WHERE post_id = ? AND user_id = ?").get(postId, userId);
        
        if (existingView) {
            const currentViews = db.prepare("SELECT COALESCE(views_count, 0) as views_count FROM posts WHERE id = ?").get(postId);
            res.json({ success: true, views_count: currentViews.views_count });
        } else {
            const viewId = uuidv4();
            db.prepare("INSERT INTO post_views (id, post_id, user_id) VALUES (?, ?, ?)").run(viewId, postId, userId);
            db.prepare("UPDATE posts SET views_count = COALESCE(views_count, 0) + 1 WHERE id = ?").run(postId);
            
            const updatedViews = db.prepare("SELECT COALESCE(views_count, 0) as views_count FROM posts WHERE id = ?").get(postId);
            
            io.emit("post_view_update", {
                post_id: postId,
                views_count: updatedViews.views_count
            });
            
            res.json({ success: true, views_count: updatedViews.views_count });
        }
    } catch (error) {
        console.error("Error updating post views:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/posts/:id/comments", checkAuth, (req, res) => {
    try {
        const postId = req.params.id;
        const page = parseInt(req.query.page) || 0;
        const offset = page * 5;
        
        const totalComments = db.prepare("SELECT COUNT(*) as count FROM post_comments WHERE post_id = ? AND parent_id IS NULL").get(postId).count;
        
        const comments = db.prepare(`
            SELECT c.*, u.username, u.global_name, u.avatar, u.verified 
            FROM post_comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.post_id = ? AND c.parent_id IS NULL 
            ORDER BY c.created_at ASC 
            LIMIT ? OFFSET ?
        `).all(postId, 5, offset);
        
        const commentsWithDetails = Promise.all(comments.map(async (comment) => {
            const replies = db.prepare(`
                SELECT c.*, u.username, u.global_name, u.avatar, u.verified 
                FROM post_comments c 
                JOIN users u ON c.user_id = u.id 
                WHERE c.parent_id = ? 
                ORDER BY c.created_at ASC 
                LIMIT 3
            `).all(comment.id);
            
            const totalReplies = db.prepare("SELECT COUNT(*) as count FROM post_comments WHERE parent_id = ?").get(comment.id).count;
            
            const likesCount = db.prepare("SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?").get(comment.id).count;
            const userLiked = db.prepare("SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?").get(comment.id, req.session.user.id);
            
            const userRoles = await checkUserRoles(comment.user_id);
            
            const repliesWithRoles = await Promise.all(replies.map(async (reply) => {
                const replyUserRoles = await checkUserRoles(reply.user_id);
                return {
                    ...reply,
                    avatar_url: reply.avatar ? `https://cdn.discordapp.com/avatars/${reply.user_id}/${reply.avatar}.png` : null,
                    verification_badge: reply.verified ? process.env.VERIFICATION_BADGE_URL : null,
                    roles: replyUserRoles
                };
            }));
            
            return {
                ...comment,
                avatar_url: comment.avatar ? `https://cdn.discordapp.com/avatars/${comment.user_id}/${comment.avatar}.png` : null,
                verification_badge: comment.verified ? process.env.VERIFICATION_BADGE_URL : null,
                roles: userRoles,
                likes_count: likesCount,
                user_liked: !!userLiked,
                replies: repliesWithRoles,
                total_replies: totalReplies,
                has_more_replies: totalReplies > 3
            };
        }));
        
        commentsWithDetails.then(comments => {
            res.json({
                comments: comments,
                has_more: (offset + 5) < totalComments,
                total_count: totalComments
            });
        }).catch(error => {
            console.error("Error processing comments:", error);
            res.status(500).json({ error: "Server error" });
        });
    } catch (error) {
        console.error("Error getting comments:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/posts/:id/comments", checkAuth, (req, res) => {
    try {
        const postId = req.params.id;
        const { content, parent_id } = req.body;
        const userId = req.session.user.id;
        
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: "Content is required" });
        }
        
        if (content.length > 150) {
            return res.status(400).json({ error: "Comment must be 150 characters or less" });
        }
        
        const commentId = uuidv4();
        db.prepare("INSERT INTO post_comments (id, post_id, user_id, content, parent_id) VALUES (?, ?, ?, ?, ?)")
          .run(commentId, postId, userId, content, parent_id || null);
        
        const post = db.prepare("SELECT user_id FROM posts WHERE id = ?").get(postId);
        if (post && post.user_id !== userId) {
            createPostNotification(post.user_id, "comment", postId, userId, commentId);
        }
        
        checkUserRoles(userId).then(userRoles => {
            const newComment = db.prepare(`
                SELECT c.*, u.username, u.global_name, u.avatar, u.verified 
                FROM post_comments c 
                JOIN users u ON c.user_id = u.id 
                WHERE c.id = ?
            `).get(commentId);
            
            const commentResponse = {
                ...newComment,
                avatar_url: newComment.avatar ? `https://cdn.discordapp.com/avatars/${newComment.user_id}/${newComment.avatar}.png` : null,
                verification_badge: newComment.verified ? process.env.VERIFICATION_BADGE_URL : null,
                roles: userRoles,
                likes_count: 0,
                user_liked: false,
                replies: [],
                total_replies: 0,
                has_more_replies: false
            };
            
            io.emit("new_comment", {
                post_id: postId,
                comment: commentResponse
            });
            
            res.status(201).json(commentResponse);
        }).catch(error => {
            console.error("Error checking user roles:", error);
            res.status(500).json({ error: "Server error" });
        });
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/comments/:id/like", checkAuth, (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.session.user.id;
        
        const existingLike = db.prepare("SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?").get(commentId, userId);
        
        if (existingLike) {
            db.prepare("DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?").run(commentId, userId);
        } else {
            const likeId = uuidv4();
            db.prepare("INSERT INTO comment_likes (id, comment_id, user_id) VALUES (?, ?, ?)").run(likeId, commentId, userId);
        }
        
        const likesCount = db.prepare("SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?").get(commentId).count;
        const isLiked = !existingLike;
        
        res.json({
            likes_count: likesCount,
            is_liked: isLiked
        });
    } catch (error) {
        console.error("Error toggling comment like:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/api/comments/:id", checkAuth, (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.session.user.id;
        
        const comment = db.prepare("SELECT * FROM post_comments WHERE id = ?").get(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        
        if (comment.user_id !== userId && !req.session.isAdmin) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        
        db.prepare("DELETE FROM post_comments WHERE id = ? OR parent_id = ?").run(commentId, commentId);
        db.prepare("DELETE FROM comment_likes WHERE comment_id = ?").run(commentId);
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/posts/:postId/comments/:commentId/replies", checkAuth, (req, res) => {
    try {
        const commentId = req.params.commentId;
        const page = parseInt(req.query.page) || 0;
        const offset = page * 5;
        
        const totalReplies = db.prepare("SELECT COUNT(*) as count FROM post_comments WHERE parent_id = ?").get(commentId).count;
        
        const replies = db.prepare(`
            SELECT c.*, u.username, u.global_name, u.avatar, u.verified 
            FROM post_comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.parent_id = ? 
            ORDER BY c.created_at ASC 
            LIMIT ? OFFSET ?
        `).all(commentId, 5, offset);
        
        Promise.all(replies.map(async (reply) => {
            const userRoles = await checkUserRoles(reply.user_id);
            return {
                ...reply,
                avatar_url: reply.avatar ? `https://cdn.discordapp.com/avatars/${reply.user_id}/${reply.avatar}.png` : null,
                verification_badge: reply.verified ? process.env.VERIFICATION_BADGE_URL : null,
                roles: userRoles
            };
        })).then(replies => {
            res.json({
                replies: replies,
                has_more: (offset + 5) < totalReplies,
                total_count: totalReplies
            });
        }).catch(error => {
            console.error("Error getting user roles:", error);
            res.status(500).json({ error: "Server error" });
        });
    } catch (error) {
        console.error("Error getting replies:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/notifications", checkAuth, (req, res) => {
    try {
        const userId = req.session.user.id;
        
        const notifications = db.prepare(`
            SELECT n.*, u.username, u.avatar, p.content as post_content 
            FROM post_notifications n 
            JOIN users u ON n.from_user_id = u.id 
            LEFT JOIN posts p ON n.post_id = p.id 
            WHERE n.user_id = ? 
            ORDER BY n.created_at DESC 
            LIMIT 50
        `).all(userId);
        
        res.json(notifications);
    } catch (error) {
        console.error("Error getting notifications:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/notifications/mark-read", checkAuth, (req, res) => {
    try {
        const userId = req.session.user.id;
        
        db.prepare("UPDATE post_notifications SET read = 1 WHERE user_id = ?").run(userId);
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/discord/stats", (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const todayStats = db.prepare("SELECT * FROM discord_stats WHERE date = ?").get(today);
        const yesterdayStats = db.prepare("SELECT * FROM discord_stats WHERE date = ?").get(yesterday);
        const last7DaysStats = db.prepare("SELECT * FROM discord_stats WHERE date >= date('now', '-7 days') ORDER BY date DESC").all();
        
        res.json({
            today: todayStats || {
                messages_count: dailyStats.messages,
                joins_count: dailyStats.joins,
                leaves_count: dailyStats.leaves,
                total_members: dailyStats.totalMembers
            },
            yesterday: yesterdayStats || {
                messages_count: 0,
                joins_count: 0,
                leaves_count: 0,
                total_members: 0
            },
            last7Days: last7DaysStats,
            current: dailyStats
        });
    } catch (error) {
        console.error("Error getting Discord stats:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/auth/discord", (req, res) => {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    res.redirect(authUrl);
});
// Community Server TovStudio # === https://discord.com/invite/CfvKc2aqxj
app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.redirect("/?error=no_code");
    }
    
    try {
        const tokenResponse = await axios.post("https://discord.com/api/oauth2/token", new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: process.env.REDIRECT_URI
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        
        const { access_token, refresh_token } = tokenResponse.data;
        
        const userResponse = await axios.get("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        
        const guildsResponse = await axios.get("https://discord.com/api/users/@me/guilds", {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        
        const isInGuild = guildsResponse.data.some(guild => guild.id === process.env.GUILD_ID);
        if (!isInGuild) {
            return res.redirect("/?error=not_in_guild");
        }
        
        if (isUserBanned(userResponse.data.id)) {
            return res.redirect("/?error=banned");
        }
        
        req.session.user = {
            id: userResponse.data.id,
            username: userResponse.data.username,
            discriminator: userResponse.data.discriminator,
            avatar: userResponse.data.avatar,
            global_name: userResponse.data.global_name,
            accessToken: access_token,
            refreshToken: refresh_token
        };
        // Community Server TovStudio
        req.session.save((error) => {
            if (error) {
                console.error("Error saving session:", error);
                return res.redirect("/?error=session_error");
            }
            
            try {
                const sessionData = {
                    user: req.session.user,
                    expires: Date.now() + config.system.timeouts.sessionMaxAge
                };
                
                db.prepare("INSERT OR REPLACE INTO sessions (userId, sessionData, expires) VALUES (?, ?, ?)")
                  .run(userResponse.data.id, JSON.stringify(sessionData), sessionData.expires);
                
                const existingUser = db.prepare("SELECT * FROM users WHERE id = ?").get(userResponse.data.id);
                
                if (existingUser) {
                    db.prepare("UPDATE users SET username = ?, avatar = ?, global_name = ?, lastSeen = ?, status = 'online' WHERE id = ?")
                      .run(userResponse.data.username, userResponse.data.avatar, userResponse.data.global_name, Date.now(), userResponse.data.id);
                } else {
                    db.prepare("INSERT INTO users (id, username, discriminator, avatar, global_name, lastSeen, points, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'online')")
                      .run(userResponse.data.id, userResponse.data.username, userResponse.data.discriminator, userResponse.data.avatar, userResponse.data.global_name, Date.now(), 0);
                }
                
                checkAdminStatus(userResponse.data.id).then(isAdmin => {
                    if (isAdmin) {
                        req.session.isAdmin = true;
                        req.session.save();
                    }
                    
                    checkVerificationStatus(userResponse.data.id).then(isVerified => {
                        if (isVerified) {
                            req.session.user.verified = true;
                            req.session.save();
                        }
                        
                        io.emit("active_users_update");
                        res.redirect("/?set_user_id=" + userResponse.data.id);
                    }).catch(console.error);
                }).catch(console.error);
            } catch (error) {
                console.error("Error saving session to database:", error);
                res.redirect("/?error=db_error");
            }
        });
    } catch (error) {
        console.error("OAuth error:", error.response?.data || error.message);
        res.redirect("/?error=oauth_error");
    }
});

app.get("/auth/check-session", (req, res) => {
    const sessionId = req.query.id;
    
    if (!sessionId) {
        return res.status(400).json({ error: "No session ID provided" });
    }
    
    try {
        const savedSession = db.prepare("SELECT sessionData, expires FROM sessions WHERE userId = ?").get(sessionId);
        
        if (savedSession && savedSession.expires > Date.now()) {
            const sessionData = JSON.parse(savedSession.sessionData);
            
            if (isUserBanned(sessionData.user.id)) {
                return res.json({ authenticated: false, banned: true });
            }
            
            req.session.user = sessionData.user;
            
            checkAdminStatus(sessionData.user.id).then(isAdmin => {
                req.session.isAdmin = isAdmin;
                
                checkVerificationStatus(sessionData.user.id).then(isVerified => {
                    req.session.user.verified = isVerified;
                    
                    req.session.save((error) => {
                        if (error) {
                            console.error("Error saving session:", error);
                            return res.status(500).json({ error: "Session save error" });
                        }
                        
                        db.prepare("UPDATE sessions SET expires = ? WHERE userId = ?")
                          .run(Date.now() + config.system.timeouts.sessionMaxAge, sessionId);
                        
                        db.prepare("UPDATE users SET status = 'online', lastSeen = ? WHERE id = ?")
                          .run(Date.now(), sessionId);
                        
                        res.json({
                            authenticated: true,
                            user: sessionData.user,
                            isAdmin: isAdmin
                        });
                    });
                }).catch(error => {
                    console.error("Error checking verification status:", error);
                    res.json({
                        authenticated: true,
                        user: sessionData.user,
                        isAdmin: isAdmin
                    });
                });
            }).catch(error => {
                console.error("Error checking admin status:", error);
                res.json({
                    authenticated: true,
                    user: sessionData.user,
                    isAdmin: false
                });
            });
        } else {
            if (savedSession) {
                db.prepare("DELETE FROM sessions WHERE userId = ?").run(sessionId);
            }
            res.json({ authenticated: false });
        }
    } catch (error) {
        console.error("Error checking saved session:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/auth/status", (req, res) => {
    if (req.session && req.session.user) {
        if (isUserBanned(req.session.user.id)) {
            return res.json({ authenticated: false, banned: true });
        }
        
        db.prepare("UPDATE users SET status = 'online', lastSeen = ? WHERE id = ?")
          .run(Date.now(), req.session.user.id);
        
        res.json({
            authenticated: true,
            user: req.session.user,
            isAdmin: req.session.isAdmin || false
        });
    } else {
        res.json({ authenticated: false });
    }
});

app.get("/auth/logout", (req, res) => {
    if (req.session && req.session.user) {
        try {
            db.prepare("DELETE FROM sessions WHERE userId = ?").run(req.session.user.id);
            db.prepare("UPDATE users SET status = 'offline' WHERE id = ?").run(req.session.user.id);
            io.emit("user_disconnected", { userId: req.session.user.id });
        } catch (error) {
            console.error("Error removing session from database:", error);
        }
    }
    
    req.session.destroy((error) => {
        if (error) {
            console.error("Error destroying session:", error);
        }
        res.redirect("/");
    });
});

app.get("/api/store/admin-check", checkAuth, (req, res) => {
    checkStoreAdminStatus(req.session.user.id).then(isStoreAdmin => {
        res.json({ isStoreAdmin });
    }).catch(() => {
        res.json({ isStoreAdmin: false });
    });
});

app.get("/api/store/stats", checkAuth, (req, res) => {
    try {
        const totalProducts = db.prepare("SELECT COUNT(*) as count FROM store_products").get();
        const totalCategories = db.prepare("SELECT COUNT(*) as count FROM store_categories").get();
        const totalSales = db.prepare("SELECT COUNT(*) as count FROM store_purchases").get();
        const totalRevenue = db.prepare("SELECT COALESCE(SUM(price), 0) as total FROM store_purchases").get();
        
        res.json({
            totalProducts: totalProducts.count,
            totalCategories: totalCategories.count,
            totalSales: totalSales.count,
            totalRevenue: totalRevenue.total
        });
    } catch (error) {
        console.error("Error getting store stats:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/store/categories", (req, res) => {
    try {
        const categories = db.prepare(`
            SELECT sc.*, COUNT(sp.id) as product_count 
            FROM store_categories sc 
            LEFT JOIN store_products sp ON sc.id = sp.category_id 
            GROUP BY sc.id 
            ORDER BY sc.name
        `).all();
        
        res.json(categories);
    } catch (error) {
        console.error("Error getting categories:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/store/categories", checkAuth, (req, res) => {
    checkStoreAdminStatus(req.session.user.id).then(isStoreAdmin => {
        if (!isStoreAdmin) {
            return res.status(403).json({ error: "Store admin access required" });
        }
        
        try {
            const { name, description } = req.body;
            
            if (!name) {
                return res.status(400).json({ error: "Category name is required" });
            }
            
            const categoryId = uuidv4();
            db.prepare("INSERT INTO store_categories (id, name, description) VALUES (?, ?, ?)")
              .run(categoryId, name, description || null);
            
            res.json({ success: true, id: categoryId });
        } catch (error) {
            console.error("Error creating category:", error);
            res.status(500).json({ error: "Server error" });
        }
    }).catch(() => {
        res.status(500).json({ error: "Server error" });
    });
});

app.put("/api/store/categories/:id", checkAuth, (req, res) => {
    checkStoreAdminStatus(req.session.user.id).then(isStoreAdmin => {
        if (!isStoreAdmin) {
            return res.status(403).json({ error: "Store admin access required" });
        }
        
        try {
            const categoryId = req.params.id;
            const { name, description } = req.body;
            
            if (!name) {
                return res.status(400).json({ error: "Category name is required" });
            }
            
            db.prepare("UPDATE store_categories SET name = ?, description = ? WHERE id = ?")
              .run(name, description || null, categoryId);
            
            res.json({ success: true });
        } catch (error) {
            console.error("Error updating category:", error);
            res.status(500).json({ error: "Server error" });
        }
    }).catch(() => {
        res.status(500).json({ error: "Server error" });
    });
});

app.delete("/api/store/categories/:id", checkAuth, (req, res) => {
    checkStoreAdminStatus(req.session.user.id).then(isStoreAdmin => {
        if (!isStoreAdmin) {
            return res.status(403).json({ error: "Store admin access required" });
        }
        
        try {
            const categoryId = req.params.id;
            
            const productCount = db.prepare("SELECT COUNT(*) as count FROM store_products WHERE category_id = ?").get(categoryId);
            if (productCount.count > 0) {
                return res.status(400).json({ error: "Cannot delete category with products" });
            }
            
            db.prepare("DELETE FROM store_categories WHERE id = ?").run(categoryId);
            
            res.json({ success: true });
        } catch (error) {
            console.error("Error deleting category:", error);
            res.status(500).json({ error: "Server error" });
        }
    }).catch(() => {
        res.status(500).json({ error: "Server error" });
    });
});

app.get("/api/store/products", (req, res) => {
    try {
        const category = req.query.category;
        
        let products;
        if (category) {
            products = db.prepare("SELECT * FROM store_products WHERE category_id = ? ORDER BY created_at DESC").all(category);
        } else {
            products = db.prepare("SELECT * FROM store_products ORDER BY created_at DESC").all();
        }
        
        res.json(products);
    } catch (error) {
        console.error("Error getting products:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/store/products", checkAuth, async (req, res) => {
    const isStoreAdmin = await checkStoreAdminStatus(req.session.user.id);
    if (!isStoreAdmin) {
        return res.status(403).json({ error: "Store admin access required" });
    }
    
    try {
        const { categoryId, newCategory, title, description, price, image, video, downloadLink, expiryDays, roleId } = req.body;
        
        if (!categoryId && !newCategory) {
            return res.status(400).json({ error: "Category is required" });
        }
        
        if (!title || !description || !price) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        if (roleId && roleId.trim()) {
            const roleExists = await checkRoleExists(roleId.trim());
            if (!roleExists) {
                return res.status(400).json({ error: "Role ID not found in Discord server. Please check the role ID and try again." });
            }
        }
        
        let finalCategoryId;
        if (newCategory) {
            finalCategoryId = uuidv4();
            db.prepare("INSERT INTO store_categories (id, name) VALUES (?, ?)").run(finalCategoryId, newCategory);
        } else {
            finalCategoryId = categoryId;
        }
        
        const productId = uuidv4();
        db.prepare(`
            INSERT INTO store_products (id, category_id, title, description, price, image, video, download_link, expiry_days, role_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(productId, finalCategoryId, title, description, parseFloat(price), image || null, video || null, downloadLink || null, expiryDays ? parseInt(expiryDays) : null, roleId ? roleId.trim() : null);
        
        res.json({ success: true, id: productId });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.put("/api/store/products/:id", checkAuth, async (req, res) => {
    const isStoreAdmin = await checkStoreAdminStatus(req.session.user.id);
    if (!isStoreAdmin) {
        return res.status(403).json({ error: "Store admin access required" });
    }
    
    try {
        const productId = req.params.id;
        const { categoryId, title, description, price, image, video, downloadLink, expiryDays, roleId } = req.body;
        
        if (!title || !description || !price || !categoryId) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        if (roleId && roleId.trim()) {
            const roleExists = await checkRoleExists(roleId.trim());
            if (!roleExists) {
                return res.status(400).json({ error: "Role ID not found in Discord server. Please check the role ID and try again." });
            }
        }
        
        db.prepare(`
            UPDATE store_products 
            SET category_id = ?, title = ?, description = ?, price = ?, image = ?, video = ?, download_link = ?, expiry_days = ?, role_id = ?, updated_at = strftime('%s', 'now') 
            WHERE id = ?
        `).run(categoryId, title, description, parseFloat(price), image || null, video || null, downloadLink || null, expiryDays ? parseInt(expiryDays) : null, roleId ? roleId.trim() : null, productId);
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/api/store/products/:id", checkAuth, (req, res) => {
    checkStoreAdminStatus(req.session.user.id).then(isStoreAdmin => {
        if (!isStoreAdmin) {
            return res.status(403).json({ error: "Store admin access required" });
        }
        
        try {
            const productId = req.params.id;
            
            db.prepare("DELETE FROM store_products WHERE id = ?").run(productId);
            
            res.json({ success: true });
        } catch (error) {
            console.error("Error deleting product:", error);
            res.status(500).json({ error: "Server error" });
        }
    }).catch(() => {
        res.status(500).json({ error: "Server error" });
    });
});

app.post("/api/store/purchase", checkAuth, async (req, res) => {
    try {
        const { productId, paypalOrderId, amount, discountCode } = req.body;
        const userId = req.session.user.id;
        
        if (!productId || !paypalOrderId) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        const product = db.prepare("SELECT * FROM store_products WHERE id = ?").get(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        let finalPrice = product.price;
        let discountPercent = 0;
        
        if (discountCode) {
            const discount = db.prepare("SELECT * FROM store_discount_codes WHERE code = ? AND active = 1").get(discountCode);
            if (discount) {
                discountPercent = discount.discount_percent;
                finalPrice = finalPrice * (1 - discountPercent);
            }
        }
        
        const isStoreAdmin = await checkStoreAdminStatus(userId);
        if (isStoreAdmin && amount === 0) {
            const purchaseId = uuidv4();
            const expiryDate = product.expiry_days ? Date.now() + (product.expiry_days * 24 * 60 * 60 * 1000) : null;
            
            db.prepare("INSERT INTO store_purchases (id, user_id, product_id, price, paypal_order_id, expiry_date) VALUES (?, ?, ?, ?, ?, ?)")
              .run(purchaseId, userId, productId, 0, "ADMIN_FREE_" + Date.now(), expiryDate);
            
            db.prepare("UPDATE store_products SET purchases = purchases + 1 WHERE id = ?").run(productId);
            
            if (product.role_id) {
                await giveRoleToUser(userId, product.role_id);
            }
            
            await sendPurchaseNotificationToUser(userId, product, { price: 0, paypal_order_id: "ADMIN_FREE_" + Date.now() });
            await sendPurchaseNotificationToAdmins(userId, product, { price: 0, paypal_order_id: "ADMIN_FREE_" + Date.now() });
            
            return res.json({ success: true, purchaseId });
        }
        
        if (Math.abs(parseFloat(amount) - finalPrice) > 0.01) {
            return res.status(400).json({ error: "Price mismatch" });
        }
        
        const purchaseId = uuidv4();
        const expiryDate = product.expiry_days ? Date.now() + (product.expiry_days * 24 * 60 * 60 * 1000) : null;
        
        db.prepare("INSERT INTO store_purchases (id, user_id, product_id, price, paypal_order_id, expiry_date) VALUES (?, ?, ?, ?, ?, ?)")
          .run(purchaseId, userId, productId, parseFloat(amount), paypalOrderId, expiryDate);
        
        db.prepare("UPDATE store_products SET purchases = purchases + 1 WHERE id = ?").run(productId);
        
        if (product.role_id) {
            await giveRoleToUser(userId, product.role_id);
        }
        
        await sendPurchaseNotificationToUser(userId, product, { price: parseFloat(amount), paypal_order_id: paypalOrderId });
        await sendPurchaseNotificationToAdmins(userId, product, { price: parseFloat(amount), paypal_order_id: paypalOrderId });
        
        res.json({ success: true, purchaseId });
    } catch (error) {
        console.error("Error processing purchase:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/store/renew/:purchaseId", checkAuth, async (req, res) => {
    try {
        const { purchaseId } = req.params;
        const { paypalOrderId, amount, discountCode } = req.body;
        const userId = req.session.user.id;
        
        if (!paypalOrderId) {
            return res.status(400).json({ error: "Missing PayPal order ID" });
        }
        
        const purchase = db.prepare(`
            SELECT sp.*, p.* 
            FROM store_purchases sp 
            JOIN store_products p ON sp.product_id = p.id 
            WHERE sp.id = ? AND sp.user_id = ?
        `).get(purchaseId, userId);
        
        if (!purchase) {
            return res.status(404).json({ error: "Purchase not found" });
        }
        
        let finalPrice = purchase.price;
        let discountPercent = 0;
        
        if (discountCode) {
            const discount = db.prepare("SELECT * FROM store_discount_codes WHERE code = ? AND active = 1").get(discountCode);
            if (discount) {
                discountPercent = discount.discount_percent;
                finalPrice = finalPrice * (1 - discountPercent);
            }
        }
        
        if (Math.abs(parseFloat(amount) - finalPrice) > 0.01) {
            return res.status(400).json({ error: "Price mismatch" });
        }
        
        const renewalCount = purchase.renewal_count + 1;
        const newExpiryDate = purchase.expiry_days ? 
            (purchase.expiry_date && purchase.expiry_date > Date.now() ? purchase.expiry_date : Date.now()) + (purchase.expiry_days * 24 * 60 * 60 * 1000) : 
            null;
        
        db.prepare("UPDATE store_purchases SET expiry_date = ?, renewal_count = ?, status = 'completed' WHERE id = ?")
          .run(newExpiryDate, renewalCount, purchaseId);
        
        const renewalId = uuidv4();
        db.prepare("INSERT INTO store_purchases (id, user_id, product_id, price, paypal_order_id, expiry_date, renewal_count) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .run(renewalId, userId, purchase.product_id, parseFloat(amount), paypalOrderId, newExpiryDate, renewalCount);
        
        if (purchase.role_id) {
            await giveRoleToUser(userId, purchase.role_id);
        }
        
        await sendPurchaseNotificationToUser(userId, purchase, { price: parseFloat(amount), paypal_order_id: paypalOrderId, isRenewal: true });
        await sendPurchaseNotificationToAdmins(userId, purchase, { price: parseFloat(amount), paypal_order_id: paypalOrderId, isRenewal: true });
        
        res.json({ success: true, renewalId });
    } catch (error) {
        console.error("Error renewing subscription:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/store/discount-codes", checkAuth, (req, res) => {
    checkStoreAdminStatus(req.session.user.id).then(isStoreAdmin => {
        if (!isStoreAdmin) {
            return res.status(403).json({ error: "Store admin access required" });
        }
        
        try {
            const discountCodes = db.prepare("SELECT * FROM store_discount_codes ORDER BY created_at DESC").all();
            res.json(discountCodes);
        } catch (error) {
            console.error("Error getting discount codes:", error);
            res.status(500).json({ error: "Server error" });
        }
    }).catch(() => {
        res.status(500).json({ error: "Server error" });
    });
});

app.post("/api/store/discount-codes", checkAuth, (req, res) => {
    checkStoreAdminStatus(req.session.user.id).then(isStoreAdmin => {
        if (!isStoreAdmin) {
            return res.status(403).json({ error: "Store admin access required" });
        }
        
        try {
            const { code, discount } = req.body;
            
            if (!code || !discount) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            
            if (discount <= 0 || discount >= 1) {
                return res.status(400).json({ error: "Discount must be between 0 and 1" });
            }
            
            const discountId = uuidv4();
            db.prepare("INSERT INTO store_discount_codes (id, code, discount_percent) VALUES (?, ?, ?)")
              .run(discountId, code.toUpperCase(), parseFloat(discount));
            
            res.json({ success: true, id: discountId });
        } catch (error) {
            if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
                return res.status(400).json({ error: "Discount code already exists" });
            }
            console.error("Error creating discount code:", error);
            res.status(500).json({ error: "Server error" });
        }
    }).catch(() => {
        res.status(500).json({ error: "Server error" });
    });
});

app.put("/api/store/discount-codes/:id/toggle", checkAuth, (req, res) => {
    checkStoreAdminStatus(req.session.user.id).then(isStoreAdmin => {
        if (!isStoreAdmin) {
            return res.status(403).json({ error: "Store admin access required" });
        }
        
        try {
            const discountId = req.params.id;
            const discount = db.prepare("SELECT active FROM store_discount_codes WHERE id = ?").get(discountId);
            
            if (!discount) {
                return res.status(404).json({ error: "Discount code not found" });
            }
            
            const newActive = discount.active ? 0 : 1;
            db.prepare("UPDATE store_discount_codes SET active = ? WHERE id = ?").run(newActive, discountId);
            
            res.json({ success: true, active: !!newActive });
        } catch (error) {
            console.error("Error toggling discount code:", error);
            res.status(500).json({ error: "Server error" });
        }
    }).catch(() => {
        res.status(500).json({ error: "Server error" });
    });
});

app.delete("/api/store/discount-codes/:id", checkAuth, (req, res) => {
    checkStoreAdminStatus(req.session.user.id).then(isStoreAdmin => {
        if (!isStoreAdmin) {
            return res.status(403).json({ error: "Store admin access required" });
        }
        
        try {
            const discountId = req.params.id;
            
            db.prepare("DELETE FROM store_discount_codes WHERE id = ?").run(discountId);
            
            res.json({ success: true });
        } catch (error) {
            console.error("Error deleting discount code:", error);
            res.status(500).json({ error: "Server error" });
        }
    }).catch(() => {
        res.status(500).json({ error: "Server error" });
    });
});

app.post("/api/store/discount/validate", checkAuth, (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: "Missing discount code" });
        }
        
        const discount = db.prepare("SELECT * FROM store_discount_codes WHERE code = ? AND active = 1").get(code.toUpperCase());
        
        if (discount) {
            res.json({ valid: true, discount: discount.discount_percent });
        } else {
            res.json({ valid: false });
        }
    } catch (error) {
        console.error("Error validating discount code:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/store/purchases", checkAuth, (req, res) => {
    try {
        const userId = req.session.user.id;
        
        const purchases = db.prepare(`
            SELECT sp.*, p.title, p.image, p.download_link, p.price as original_price, p.expiry_days 
            FROM store_purchases sp 
            JOIN store_products p ON sp.product_id = p.id 
            WHERE sp.user_id = ? AND sp.status != 'expired' 
            ORDER BY sp.purchase_date DESC
        `).all(userId).map(purchase => {
            const now = Date.now();
            const isExpired = purchase.expiry_date && purchase.expiry_date <= now;
            const daysLeft = purchase.expiry_date ? Math.ceil((purchase.expiry_date - now) / (24 * 60 * 60 * 1000)) : null;
            const canRenew = purchase.expiry_days && daysLeft !== null && daysLeft <= 5;
            
            return {
                ...purchase,
                purchaseDate: purchase.purchase_date * 1000,
                expiryDate: purchase.expiry_date ? purchase.expiry_date : null,
                downloadLink: purchase.download_link,
                isExpired,
                daysLeft,
                canRenew
            };
        });
        
        res.json(purchases);
    } catch (error) {
        console.error("Error getting purchases:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/store/product/:id/view", checkAuth, (req, res) => {
    try {
        const productId = req.params.id;
        
        db.prepare("UPDATE store_products SET views = views + 1 WHERE id = ?").run(productId);
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error updating product views:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/store/product/:id/download", checkAuth, (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user.id;
        
        const purchase = db.prepare("SELECT COUNT(*) as count FROM store_purchases WHERE user_id = ? AND product_id = ?").get(userId, productId);
        
        if (purchase.count > 0) {
            db.prepare("UPDATE store_products SET downloads = downloads + 1 WHERE id = ?").run(productId);
            res.json({ success: true });
        } else {
            res.status(403).json({ error: "Product not purchased" });
        }
    } catch (error) {
        console.error("Error updating product downloads:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/store/analytics", checkAuth, (req, res) => {
    checkStoreAdminStatus(req.session.user.id).then(isStoreAdmin => {
        if (!isStoreAdmin) {
            return res.status(403).json({ error: "Store admin access required" });
        }
        
        try {
            const overview = db.prepare("SELECT COALESCE(SUM(price), 0) as totalRevenue, COUNT(*) as totalSales FROM store_purchases").get();
            
            const topProducts = db.prepare(`
                SELECT sp.*, sc.name as category_name 
                FROM store_products sp 
                LEFT JOIN store_categories sc ON sp.category_id = sc.id 
                ORDER BY sp.purchases DESC 
                LIMIT 10
            `).all();
            
            const categoryStats = db.prepare(`
                SELECT sc.*, COUNT(sp.id) as product_count, COALESCE(SUM(sp.purchases), 0) as total_sales, COALESCE(SUM(sp.views), 0) as total_views 
                FROM store_categories sc 
                LEFT JOIN store_products sp ON sc.id = sp.category_id 
                GROUP BY sc.id 
                ORDER BY total_sales DESC
            `).all();
            
            const salesByMonth = db.prepare(`
                SELECT strftime('%Y-%m', datetime(purchase_date, 'unixepoch')) as month, COUNT(*) as sales, SUM(price) as revenue 
                FROM store_purchases 
                WHERE purchase_date > strftime('%s', 'now', '-12 months') 
                GROUP BY month 
                ORDER BY month DESC
            `).all();
            
            res.json({
                totalRevenue: overview.totalRevenue,
                totalSales: overview.totalSales,
                topProducts,
                categoryStats,
                salesByMonth
            });
        } catch (error) {
            console.error("Error getting analytics:", error);
            res.status(500).json({ error: "Server error" });
        }
    }).catch(() => {
        res.status(500).json({ error: "Server error" });
    });
});

app.get("/api/tickets", checkAuth, (req, res) => {
    const userId = req.session.user.id;
    const isAdmin = req.session.isAdmin;
    
    let tickets = [];
    
    fs.readdirSync(ticketsDir).forEach(file => {
        if (file.endsWith(".json")) {
            const ticket = JSON.parse(fs.readFileSync(path.join(ticketsDir, file)));
            if (isAdmin || ticket.userId === userId || ticket.type === "public") {
                tickets.push(ticket);
            }
        }
    });
    
    res.json(tickets);
});

app.post("/api/tickets", checkAuth, (req, res) => {
    const { title, description, type, attachments } = req.body;
    const userId = req.session.user.id;
    const username = req.session.user.global_name || req.session.user.username;
    
    if (!title || !description || !type) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const userTickets = [];
    const ticketFiles = fs.readdirSync(ticketsDir);
    
    ticketFiles.forEach(file => {
        if (file.endsWith(".json")) {
            const ticket = JSON.parse(fs.readFileSync(path.join(ticketsDir, file)));
            if (ticket.userId === userId) {
                userTickets.push(ticket);
            }
        }
    });
    
    userTickets.sort((a, b) => b.createdAt - a.createdAt);
    
    if (userTickets.length > 0) {
        const lastTicket = userTickets[0];
        const timeSinceLastTicket = Date.now() - config.system.timeouts.ticketRateLimit;
        
        if (lastTicket.createdAt > timeSinceLastTicket) {
            return res.status(429).json({
                error: "Rate limit exceeded",
                message: config.messages.rateLimitExceeded
            });
        }
    }
    
    const ticketId = uuidv4();
    const ticket = {
        id: ticketId,
        title,
        description,
        type,
        status: "open",
        userId,
        username,
        avatar: req.session.user.avatar,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        attachments: attachments || [],
        frozen: false,
        viewers: [{
            userId,
            username,
            avatar: req.session.user.avatar
        }]
    };
    
    fs.writeFileSync(path.join(ticketsDir, `${ticketId}.json`), JSON.stringify(ticket, null, 2));
    
    addTicketViewer(ticketId, userId);
    sendAdminNotification(ticket);
    io.emit("new_ticket", ticket);
    
    res.status(201).json(ticket);
});

app.get("/api/tickets/:id", checkAuth, (req, res) => {
    const ticketId = req.params.id;
    const userId = req.session.user.id;
    const isAdmin = req.session.isAdmin;
    
    try {
        const ticketPath = path.join(ticketsDir, `${ticketId}.json`);
        
        if (!fs.existsSync(ticketPath)) {
            return res.status(404).json({ error: "Ticket not found" });
        }
        
        const ticket = JSON.parse(fs.readFileSync(ticketPath));
        
        if (!isAdmin && ticket.userId !== userId && ticket.type !== "public") {
            return res.status(403).json({ error: "Permission denied" });
        }
        
        addTicketViewer(ticketId, userId);
        
        const viewers = getTicketViewers(ticketId);
        ticket.viewers = viewers;
        
        fs.writeFileSync(ticketPath, JSON.stringify(ticket, null, 2));
        
        res.json(ticket);
    } catch (error) {
        console.error("Error getting ticket:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/tickets/:id/viewers", checkAuth, (req, res) => {
    const ticketId = req.params.id;
    
    try {
        const viewers = getTicketViewers(ticketId);
        res.json(viewers);
    } catch (error) {
        console.error("Error getting ticket viewers:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/api/tickets/:id", checkAuth, (req, res) => {
    const ticketId = req.params.id;
    
    if (!req.session.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
    }
    
    try {
        const ticketPath = path.join(ticketsDir, `${ticketId}.json`);
        
        if (!fs.existsSync(ticketPath)) {
            return res.status(404).json({ error: "Ticket not found" });
        }
        
        fs.unlinkSync(ticketPath);
        io.emit("ticket_deleted", ticketId);
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting ticket:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/api/ticket-viewers/:id", checkAuth, (req, res) => {
    const ticketId = req.params.id;
    
    if (!req.session.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
    }
    
    try {
        db.prepare("DELETE FROM ticket_viewers WHERE ticketId = ?").run(ticketId);
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting ticket viewers:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/api/ticket-viewers/:ticketId/:userId", checkAuth, (req, res) => {
    const ticketId = req.params.ticketId;
    const userId = req.params.userId;
    
    if (!req.session.isAdmin && userId !== req.session.user.id) {
        return res.status(403).json({ error: "Permission denied" });
    }
    
    try {
        db.prepare("DELETE FROM ticket_viewers WHERE ticketId = ? AND userId = ?").run(ticketId, userId);
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting ticket viewer:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/sounds/notification.mp3", (req, res) => {
    res.redirect("https://files.catbox.moe/wzac7y.mp3");
});

app.get("/api/sounds/message.mp3", (req, res) => {
    res.redirect("https://files.catbox.moe/a6vhkl.mp3");
});

app.get("/api/sounds/rating.mp3", (req, res) => {
    res.redirect("https://files.catbox.moe/ghzmdo.mp3");
});

const messageTimestamps = {};

app.post("/api/tickets/:id/messages", checkAuth, async (req, res) => {
    const ticketId = req.params.id;
    const { message, attachments, replyTo } = req.body;
    const userId = req.session.user.id;
    const username = req.session.user.global_name || req.session.user.username;
    const isAdmin = req.session.isAdmin;
    
    try {
        const ticketPath = path.join(ticketsDir, `${ticketId}.json`);
        
        if (!fs.existsSync(ticketPath)) {
            return res.status(404).json({ error: "Ticket not found" });
        }
        
        const ticket = JSON.parse(fs.readFileSync(ticketPath));
        
        if (!isAdmin && ticket.userId !== userId && ticket.type !== "public") {
            return res.status(403).json({ error: "Permission denied" });
        }
        
        if (ticket.status !== "open" || ticket.frozen) {
            return res.status(400).json({
                error: ticket.frozen ? "Ticket is frozen" : "Ticket is not open"
            });
        }
        
        if (message && message.length > config.system.limits.maxMessageLength) {
            return res.status(400).json({
                error: "Message too long",
                message: config.messages.messageTooLong
            });
        }
        
        if (attachments && attachments.length > 0) {
            for (const attachment of attachments) {
                if (Math.ceil(attachment.length * 3 / 4) > config.system.limits.maxAttachmentSize) {
                    return res.status(400).json({
                        error: "Attachment too large",
                        message: config.messages.attachmentTooLarge
                    });
                }
            }
        }
        
        const now = Date.now();
        const lastMessageTime = messageTimestamps[userId] || 0;
        const timeSinceLastMessage = now - lastMessageTime;
        
        if (timeSinceLastMessage < config.system.timeouts.messageRateLimit) {
            return res.status(429).json({
                error: "Rate limit exceeded",
                message: config.messages.messageRateLimit((config.system.timeouts.messageRateLimit - timeSinceLastMessage) / 1000)
            });
        }
        
        messageTimestamps[userId] = now;
        
        const messageObj = {
            id: uuidv4(),
            userId,
            username,
            avatar: req.session.user.avatar,
            isAdmin: isAdmin || false,
            content: message,
            attachments: attachments || [],
            createdAt: Date.now(),
            reactions: {},
            replyTo: replyTo || null
        };
        
        ticket.messages.push(messageObj);
        ticket.updatedAt = Date.now();
        
        fs.writeFileSync(ticketPath, JSON.stringify(ticket, null, 2));
        
        io.to(ticketId).emit("new_message", messageObj);
        
        if (isAdmin) {
            sendUserNotification(ticket.userId, ticketId, messageObj);
            updateAdminPoints(userId);
        } else {
            sendAdminNotification(ticket, messageObj);
        }
        
        res.status(201).json(messageObj);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/tickets/:ticketId/messages/:messageId/reactions", checkAuth, (req, res) => {
    const ticketId = req.params.ticketId;
    const messageId = req.params.messageId;
    const { emoji } = req.body;
    const userId = req.session.user.id;
    
    try {
        const ticketPath = path.join(ticketsDir, `${ticketId}.json`);
        
        if (!fs.existsSync(ticketPath)) {
            return res.status(404).json({ error: "Ticket not found" });
        }
        
        const ticket = JSON.parse(fs.readFileSync(ticketPath));
        const message = ticket.messages.find(msg => msg.id === messageId);
        
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }
        
        if (!message.reactions) {
            message.reactions = {};
        }
        
        if (!message.reactions[emoji]) {
            message.reactions[emoji] = [];
        }
        
        const userIndex = message.reactions[emoji].indexOf(userId);
        if (userIndex > -1) {
            message.reactions[emoji].splice(userIndex, 1);
        } else {
            message.reactions[emoji].push(userId);
        }
        
        if (message.reactions[emoji].length === 0) {
            delete message.reactions[emoji];
        }
        
        fs.writeFileSync(ticketPath, JSON.stringify(ticket, null, 2));
        
        io.to(ticketId).emit("reaction_update", {
            ticketId,
            messageId,
            reactions: message.reactions
        });
        
        res.json({ success: true, reactions: message.reactions });
    } catch (error) {
        console.error("Error toggling reaction:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.put("/api/tickets/:id/status", checkAuth, (req, res) => {
    const ticketId = req.params.id;
    const { status, type } = req.body;
    const userId = req.session.user.id;
    const isAdmin = req.session.isAdmin;
    
    if (status && !["open", "closed", "on-hold", "frozen"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }
    
    if (type && !["public", "private"].includes(type)) {
        return res.status(400).json({ error: "Invalid type" });
    }
    
    try {
        const ticketPath = path.join(ticketsDir, `${ticketId}.json`);
        
        if (!fs.existsSync(ticketPath)) {
            return res.status(404).json({ error: "Ticket not found" });
        }
        
        const ticket = JSON.parse(fs.readFileSync(ticketPath));
        
        if (!isAdmin && ticket.userId !== userId) {
            return res.status(403).json({ error: "Permission denied" });
        }
        
        if (status) {
            if (status === "frozen") {
                ticket.frozen = true;
            } else {
                ticket.status = status;
                ticket.frozen = false;
            }
        }
        
        if (type) {
            ticket.type = type;
        }
        
        ticket.updatedAt = Date.now();
        
        fs.writeFileSync(ticketPath, JSON.stringify(ticket, null, 2));
        
        if (status) {
            io.to(ticketId).emit("status_update", {
                ticketId,
                status: ticket.status,
                frozen: ticket.frozen
            });
        }
        
        if (type) {
            io.to(ticketId).emit("type_update", {
                ticketId,
                type: ticket.type
            });
        }
        
        if (status && isAdmin && ticket.userId !== userId) {
            const admin = {
                id: userId,
                username: req.session.user.global_name || req.session.user.username,
                avatar: req.session.user.avatar
            };
            
            sendTicketStatusNotification(ticket.userId, ticket, status, admin);
            updateAdminPoints(userId);
        }
        
        res.json({
            success: true,
            status: status ? ticket.status : undefined,
            frozen: status ? ticket.frozen : undefined,
            type: type ? ticket.type : undefined
        });
    } catch (error) {
        console.error("Error updating ticket:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/tickets/:id/accept", checkAuth, (req, res) => {
    const ticketId = req.params.id;
    const userId = req.session.user.id;
    
    if (!req.session.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
    }
    
    try {
        const ticketPath = path.join(ticketsDir, `${ticketId}.json`);
        
        if (!fs.existsSync(ticketPath)) {
            return res.status(404).json({ error: "Ticket not found" });
        }
        
        const ticket = JSON.parse(fs.readFileSync(ticketPath));
        
        ticket.accepted = true;
        ticket.acceptedBy = {
            id: userId,
            username: req.session.user.global_name || req.session.user.username,
            avatar: req.session.user.avatar
        };
        ticket.acceptedAt = Date.now();
        
        addTicketViewer(ticketId, userId);
        
        fs.writeFileSync(ticketPath, JSON.stringify(ticket, null, 2));
        
        io.emit("ticket_accepted", {
            ticketId,
            acceptedBy: ticket.acceptedBy
        });
        
        const admin = {
            id: userId,
            username: req.session.user.global_name || req.session.user.username,
            avatar: req.session.user.avatar
        };
        
        sendTicketAcceptedNotification(ticket.userId, ticket, admin);
        updateAdminPoints(userId);
        
        res.json({ success: true, ticket });
    } catch (error) {
        console.error("Error accepting ticket:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/tickets/:id/rate", checkAuth, (req, res) => {
    const ticketId = req.params.id;
    const userId = req.session.user.id;
    const { rating, comment } = req.body;
    
    if (rating === undefined || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Invalid rating" });
    }
    
    try {
        const ticketPath = path.join(ticketsDir, `${ticketId}.json`);
        
        if (!fs.existsSync(ticketPath)) {
            return res.status(404).json({ error: "Ticket not found" });
        }
        
        const ticket = JSON.parse(fs.readFileSync(ticketPath));
        
        if (ticket.userId !== userId) {
            return res.status(403).json({ error: "Permission denied" });
        }
        
        if (ticket.status !== "closed") {
            return res.status(400).json({ error: "Can only rate closed tickets" });
        }
        
        ticket.rating = {
            rating,
            comment: comment || "",
            timestamp: Date.now()
        };
        
        fs.writeFileSync(ticketPath, JSON.stringify(ticket, null, 2));
        
        const ratingId = uuidv4();
        db.prepare(`
            INSERT INTO ratings (id, ticketId, ticketTitle, userId, username, userAvatar, adminId, adminName, adminAvatar, rating, comment, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(ratingId, ticketId, ticket.title, userId, ticket.username, ticket.avatar, ticket.acceptedBy?.id || null, ticket.acceptedBy?.username || "System Admin", ticket.acceptedBy?.avatar || null, rating, comment || "", Date.now());
        
        io.emit("new_rating", { id: ratingId, ticketId });
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error rating ticket:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/users/:id/ban", checkAuth, (req, res) => {
    const targetUserId = req.params.id;
    const adminId = req.session.user.id;
    const { reason } = req.body;
    
    if (!req.session.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
    }
    
    try {
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(targetUserId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        const existingBan = db.prepare("SELECT COUNT(*) as count FROM banned WHERE userId = ?").get(targetUserId);
        if (existingBan.count > 0) {
            return res.status(400).json({ error: "User is already banned" });
        }
        
        db.prepare("INSERT INTO banned (userId, username, avatar, adminId, adminName, reason, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .run(targetUserId, user.username, user.avatar, adminId, req.session.user.global_name || req.session.user.username, reason || "No reason provided", Date.now());
        
        db.prepare("UPDATE users SET status = 'offline' WHERE id = ?").run(targetUserId);
        db.prepare("DELETE FROM sessions WHERE userId = ?").run(targetUserId);
        
        const admin = {
            id: adminId,
            username: req.session.user.global_name || req.session.user.username,
            avatar: req.session.user.avatar
        };
        
        sendBanNotification(targetUserId, reason, admin);
        io.emit("user_banned", { userId: targetUserId });
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error banning user:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/users/:id/unban", checkAuth, (req, res) => {
    const targetUserId = req.params.id;
    
    if (!req.session.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
    }
    
    try {
        const existingBan = db.prepare("SELECT COUNT(*) as count FROM banned WHERE userId = ?").get(targetUserId);
        if (existingBan.count === 0) {
            return res.status(404).json({ error: "User is not banned" });
        }
        
        db.prepare("DELETE FROM banned WHERE userId = ?").run(targetUserId);
        io.emit("user_unbanned", { userId: targetUserId });
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error unbanning user:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/settings", (req, res) => {
    try {
        const settings = getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.put("/api/settings", checkAuth, (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
    }
    
    const { background, logo, music } = req.body;
    
    try {
        if (background) {
            db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("background", background);
        }
        
        if (logo) {
            db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("logo", logo);
        }
        
        if (music !== undefined) {
            db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("music", music);
        }
        
        const settings = getSettings();
        io.emit("settings_update", settings);
        
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/users/active", checkAuth, async (req, res) => {
    try {
        const activeUsers = db.prepare("SELECT u.*, COALESCE(p.points, 0) as points FROM users u LEFT JOIN points p ON u.id = p.adminId WHERE u.lastSeen > ?");
        const activeThreshold = Date.now() - config.system.timeouts.activeUserThreshold;
        const users = activeUsers.all(activeThreshold);
        
        const usersWithRoles = await Promise.all(users.map(async (user) => {
            const userRoles = await checkUserRoles(user.id);
            return { ...user, roles: userRoles };
        }));
        
        res.json(usersWithRoles);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/users/all", checkAuth, async (req, res) => {
    try {
        const allUsers = db.prepare("SELECT u.*, COALESCE(p.points, 0) as points FROM users u LEFT JOIN points p ON u.id = p.adminId").all();
        
        const usersWithRoles = await Promise.all(allUsers.map(async (user) => {
            const userRoles = await checkUserRoles(user.id);
            return { ...user, roles: userRoles };
        }));
        
        res.json(usersWithRoles);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/admins/active", checkAuth, async (req, res) => {
    try {
        const activeAdmins = db.prepare("SELECT u.*, COALESCE(p.points, 0) as points FROM users u JOIN admins a ON u.id = a.id LEFT JOIN points p ON u.id = p.adminId WHERE u.lastSeen > ?");
        const activeThreshold = Date.now() - config.system.timeouts.activeUserThreshold;
        const admins = activeAdmins.all(activeThreshold);
        
        const adminsWithRoles = await Promise.all(admins.map(async (admin) => {
            const userRoles = await checkUserRoles(admin.id);
            return { ...admin, roles: userRoles };
        }));
        
        res.json(adminsWithRoles);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/banned", (req, res) => {
    try {
        const bannedUsers = db.prepare("SELECT * FROM banned").all();
        res.json(bannedUsers);
    } catch (error) {
        console.error("Error getting banned users:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/ratings", checkAuth, (req, res) => {
    try {
        const ratings = db.prepare("SELECT * FROM ratings").all();
        res.json(ratings);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/statistics", checkAuth, (req, res) => {
    try {
        let tickets = [];
        
        fs.readdirSync(ticketsDir).forEach(file => {
            if (file.endsWith(".json")) {
                const ticket = JSON.parse(fs.readFileSync(path.join(ticketsDir, file)));
                tickets.push(ticket);
            }
        });
        
        const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get();
        const activeUsersQuery = db.prepare("SELECT COUNT(*) as count FROM users WHERE lastSeen > ?");
        const activeThreshold = Date.now() - config.system.timeouts.activeUserThreshold;
        const activeUsers = activeUsersQuery.get(activeThreshold);
        
        const totalAdmins = db.prepare("SELECT COUNT(*) as count FROM admins").get();
        const activeAdminsQuery = db.prepare("SELECT COUNT(*) as count FROM users u JOIN admins a ON u.id = a.id WHERE u.lastSeen > ?");
        const activeAdmins = activeAdminsQuery.get(activeThreshold);
        
        const topAdmins = db.prepare("SELECT u.id, u.username, u.global_name, u.avatar, p.points FROM points p JOIN users u ON p.adminId = u.id JOIN admins a ON u.id = a.id ORDER BY p.points DESC LIMIT 10").all();
        
        const statistics = {
            tickets: {
                total: tickets.length,
                open: tickets.filter(t => t.status === "open").length,
                closed: tickets.filter(t => t.status === "closed").length,
                onHold: tickets.filter(t => t.status === "on-hold").length,
                frozen: tickets.filter(t => t.frozen).length
            },
            users: {
                total: totalUsers.count,
                active: activeUsers.count
            },
            admins: {
                total: totalAdmins.count,
                active: activeAdmins.count
            },
            topUsers: topAdmins
        };
        
        res.json(statistics);
    } catch (error) {
        console.error("Error getting statistics:", error);
        res.status(500).json({ error: "Server error" });
    }
});

io.on("connection", (socket) => {
    console.log(`New socket connection: ${socket.id}`);
    
    socket.on("join_ticket", (ticketId) => {
        socket.join(ticketId);
        console.log(`Socket ${socket.id} joined ticket: ${ticketId}`);
    });
    
    socket.on("leave_ticket", (ticketId) => {
        socket.leave(ticketId);
        console.log(`Socket ${socket.id} left ticket: ${ticketId}`);
    });
    
    socket.on("message_read", (data) => {
        try {
            const { ticketId, messageId, readBy } = data;
            const ticketPath = path.join(ticketsDir, `${ticketId}.json`);
            
            if (fs.existsSync(ticketPath)) {
                const ticket = JSON.parse(fs.readFileSync(ticketPath));
                const message = ticket.messages.find(msg => msg.id === messageId);
                
                if (message) {
                    if (!message.readBy) {
                        message.readBy = [];
                    }
                    
                    if (!message.readBy.includes(readBy)) {
                        message.readBy.push(readBy);
                        fs.writeFileSync(ticketPath, JSON.stringify(ticket, null, 2));
                    }
                    
                    io.to(ticketId).emit("message_read", {
                        ticketId,
                        messageId,
                        readBy
                    });
                }
            }
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    });
    
    socket.on("user_connected", (data) => {
        if (data.userId) {
            console.log(`User ${data.userId} connected`);
            db.prepare("UPDATE users SET status = 'online', lastSeen = ? WHERE id = ?").run(Date.now(), data.userId);
            io.emit("user_connected", { userId: data.userId });
            io.emit("active_users_update");
        }
    });
    
    socket.on("update_user_status", ({ userId, status }) => {
        if (userId) {
            try {
                db.prepare("UPDATE users SET lastSeen = ?, status = ? WHERE id = ?").run(Date.now(), status, userId);
                io.emit("active_users_update");
                
                if (status === "offline") {
                    io.emit("user_disconnected", { userId });
                }
            } catch (error) {
                console.error("Error updating user status:", error);
            }
        }
    });
    
    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

app.get("/Home", (req, res) => {
    res.sendFile(path.join(__dirname, "public/home.html"));
});

app.get("/Store", (req, res) => {
    res.sendFile(path.join(__dirname, "public/store.html"));
});

app.get("/Store/Categories", (req, res) => {
    res.sendFile(path.join(__dirname, "public/store-categories.html"));
});

app.get("/Store/Analytics", (req, res) => {
    res.sendFile(path.join(__dirname, "public/store-analytics.html"));
});

app.get("/Store/Discounts", (req, res) => {
    res.sendFile(path.join(__dirname, "public/store-discounts.html"));
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/Tickets", (req, res) => {
    res.sendFile(path.join(__dirname, "public/tickets.html"));
});

app.get("/Users", (req, res) => {
    res.sendFile(path.join(__dirname, "public/users.html"));
});

app.get("/Ratings", (req, res) => {
    res.sendFile(path.join(__dirname, "public/ratings.html"));
});

app.get("/Settings", (req, res) => {
    res.sendFile(path.join(__dirname, "public/settings.html"));
});

const PORT = process.env.PORT || 22009;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Community Server TovStudio # === https://discord.com/invite/CfvKc2aqxj