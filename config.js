
const config = {
  messages: {
    // Discord ticket system messages
    ticketButtonResponse: (host, port) => `You can open a new ticket through this link: https://${host}`,
    ticketEmbedTitle: "Support Ticket System",
    ticketEmbedDescription: "Welcome to our support system!\n\nClick the button below to open a new ticket and get help from our team.",
    ticketButtonLabel: "🎫 Open New Ticket",
    
    // Ticket notifications
    newTicketTitle: "🎫 New Support Ticket",
    newTicketDescription: (title, type, username) => `**Title:** ${title}\n**Type:** ${type}\n**From:** ${username}`,
    newResponseTitle: (ticketTitle) => `💬 New response on: ${ticketTitle}`,
    
    // Status updates
    ticketStatusUpdateTitle: (ticketTitle) => `📝 Status Update: ${ticketTitle}`,
    ticketStatusUpdateDescription: (status) => `The ticket status has been changed to: **${status}**`,
    ticketAcceptedTitle: (ticketTitle) => `✅ Ticket Accepted: ${ticketTitle}`,
    ticketAcceptedDescription: (adminUsername) => `Your ticket has been accepted by **${adminUsername}**\nYou will receive a response soon.`,
    
    // Ban notifications
    banNotificationTitle: "🚫 Account Suspended",
    banNotificationDescription: (adminUsername, reason) => `Your access has been suspended by **${adminUsername}**\n**Reason:** ${reason || "No reason provided"}`,
    
    // Status labels
    statusLabels: {
      'open': 'Open',
      'closed': 'Closed', 
      'frozen': 'Frozen',
      'on-hold': 'On Hold'
    },
    
    // Error messages
    rateLimitExceeded: "Please wait 5 minutes between creating tickets",
    messageTooLong: "Message cannot exceed 500 characters",
    attachmentTooLarge: "Attachment size must not exceed 1 MB",
    messageRateLimit: (seconds) => `Please wait ${Math.ceil(seconds)} seconds before sending another message`
  },
  
  store: {
    // Purchase notifications
    purchaseSuccessTitle: "🎉 Purchase Completed Successfully!",
    purchaseSuccessDescription: (productTitle, username) => `Hello ${username}!\n\nYour purchase has been completed successfully ✅`,
    newPurchaseTitle: "💸 New Store Purchase!",
    newPurchaseDescription: "A new purchase has been completed in the store",
    
    // Subscription notifications  
    expiryWarningTitle: "⚠️ Warning: Subscription Expiring Soon!",
    expiryWarningDescription: (username) => `Hello ${username}!\n\nYour subscription is about to expire.`,
    subscriptionExpiredTitle: "❌ Subscription Expired!",
    subscriptionExpiredDescription: (username) => `Hello ${username}!\n\nYour subscription has expired.`,
    
    // Store settings
    currency: "USD",
    currencySymbol: "$",
    taxRate: 0, // 0% tax
    freeShipping: true,
    
    // Discount settings
    defaultDiscountCodes: [
      { code: "ADMIN10", discount: 0.1 },
      { code: "WELCOME20", discount: 0.2 },
      { code: "SAVE15", discount: 0.15 },
      { code: "PREMIUM30", discount: 0.3 }
    ]
  },
  
  social: {
    // Post limits
    dailyPostLimit: 50,
    postCooldown: 300000, // 5 minutes
    maxPostLength: 1000,
    maxCommentLength: 150,
    
    // Media settings
    maxFileSize: 104857600, // 100MB
    allowedFileTypes: /jpeg|jpg|png|gif|mp4|webm|mov|avi|mkv|3gp|flv|wmv|webp|m4v|mpeg|mpg/,
    
    // Reaction types
    reactionTypes: ["like", "love", "laugh", "angry", "sad", "wow"],
    
    // Notification settings
    notificationLimit: 50
  },
  
  visual: {
    // Status colors
    statusColors: {
      'open': "#22c55e",
      'closed': "#ef4444", 
      'frozen': "#06b6d4",
      'on-hold': "#f59e0b"
    },
    
    // Theme colors
    colors: {
      primary: "#3b82f6",
      secondary: "#6366f1",
      success: "#22c55e",
      info: "#06b6d4",
      warning: "#f59e0b", 
      error: "#ef4444",
      ticketAccepted: "#10b981"
    }
  },
  
  system: {
    // Timeout settings
    timeouts: {
      sessionMaxAge: 604800000, // 7 days
      ticketRateLimit: 300000, // 5 minutes
      messageRateLimit: 1000, // 1 second
      activeUserThreshold: 300000 // 5 minutes
    },
    
    // Size limits
    limits: {
      maxMessageLength: 500,
      maxAttachmentSize: 1048576, // 1MB
      maxUsersPerPage: 50,
      maxTicketsPerPage: 20,
      maxPostsPerPage: 5
    },
    
    // Rate limiting
    rateLimits: {
      ticketCreation: 300000, // 5 minutes between tickets
      messagePosting: 1000, // 1 second between messages
      postCreation: 300000 // 5 minutes between posts
    }
  }
};

module.exports = config;
