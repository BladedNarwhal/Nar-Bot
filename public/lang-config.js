
const langConfig = {
    defaultLanguage: "en",
    translations: {
        en: {
            sidebar: {
                title: "Community TovStudio",
                dashboard: "Dashboard",
                tickets: "Tickets",
                users: "Users",
                ratings: "Ratings",
                store: "Store",
                settings: "Settings",
                logout: "Logout",
                home: "Home"
            },
            header: {
                welcome: "Welcome, ",
                login: "Login"
            },
            home: {
                createPost: {
                    title: "Create a new post",
                    subtitle: "Share your thoughts with the community",
                    placeholder: "What's on your mind? Share your thoughts, experiences, or ask a question...",
                    charCounter: "characters left",
                    sharePost: "Share Post",
                    photo: "Photo",
                    video: "Video",
                    gif: "GIF"
                },
                posts: {
                    loadMore: "Load More Posts",
                    loading: "Loading amazing content...",
                    newPost: "New post from",
                    newComment: "New comment on a post",
                    viewReactions: "View Reactions",
                    deletePost: "Delete Post",
                    noReactions: "No reactions yet",
                    timeAgo: {
                        now: "now",
                        seconds: "s",
                        minutes: "m",
                        hours: "h",
                        days: "d",
                        weeks: "w"
                    }
                },
                reactions: {
                    like: "Like",
                    love: "Love",
                    laugh: "Laugh",
                    angry: "Angry",
                    sad: "Sad",
                    wow: "Wow"
                },
                comments: {
                    writeComment: "Write a comment...",
                    postComment: "Post Comment",
                    reply: "Reply",
                    writeReply: "Write a reply...",
                    loadMoreComments: "Load More Comments",
                    loadMoreReplies: "Load More Replies",
                    likes: "likes"
                },
                media: {
                    uploading: "Uploading Media",
                    preparing: "Preparing upload...",
                    processing: "Processing file...",
                    optimizing: "Optimizing media...",
                    finalizing: "Finalizing...",
                    uploadComplete: "Upload complete!",
                    uploadFailed: "Upload failed"
                },
                notifications: {
                    newMessage: "New Message",
                    newReaction: "New Reaction",
                    viewCount: "views"
                },
                messages: {
                    postTooLong: "Post content must be 1000 characters or less",
                    commentTooLong: "Comment must be 150 characters or less",
                    selectMedia: "Please select media file",
                    fileTooLarge: "File size must be less than 50MB",
                    uploadInProgress: "Please wait for the current upload to finish",
                    enterContent: "Please enter some content or select media",
                    postSuccess: "Post shared successfully!",
                    commentSuccess: "Comment posted successfully",
                    replySuccess: "Reply posted successfully",
                    deleteConfirm: "Are you sure you want to delete this post?",
                    deleteSuccess: "Post deleted successfully",
                    reactionAdded: "Reaction added",
                    errorOccurred: "An error occurred",
                    tryAgain: "Please try again"
                }
            },
            welcome: {
                title: "Welcome to the Ticket System",
                subtitle: "Select a section from the sidebar to get started",
                goToTickets: "Go to Tickets",
                goToHome: "Go to Home"
            },
            dashboard: {
                title: "Discord Statistics - Overview",
                newMessages: "New Messages",
                joinsLeaves: "Joins/Leaves",
                totalMembers: "Total Members",
                last24h: "in the last 24h",
                currentCount: "Current count",
                chartsTitle: "Charts over Last 7 Days",
                joinsLeavesChart: "Joins / Leaves",
                memberflowChart: "Memberflow",
                messagesChart: "Number of messages (excl. Bots)",
                joins: "Joins",
                leaves: "Leaves",
                messageCount: "Message Count",
                filterBy: "Filter by:",
                last7days: "Last 7 days",
                lastMonth: "Last month",
                lastYear: "Last year",
                socialHighlights: "Social Network Highlights",
                topLikedPost: "Most Liked Post",
                topViewedVideo: "Most Viewed Video",
                mostActiveUser: "Most Active User",
                mostActiveUserDesc: "Most interactive in social network feed."
            },
            tickets: {
                title: "Tickets",
                newTicket: "New Ticket",
                stats: {
                    totalTickets: "Total Tickets",
                    openTickets: "Open Tickets",
                    closedTickets: "Closed Tickets",
                    totalUsers: "Total Users"
                },
                recentTickets: "Recent Tickets",
                allTickets: "All Tickets",
                loading: "Loading...",
                noTickets: "No tickets available",
                typePublic: "Public",
                typePrivate: "Private",
                frozen: "Frozen",
                new: "New",
                rated: "Rated",
                status: {
                    open: "Open",
                    closed: "Closed",
                    onHold: "On Hold"
                },
                closedTicketMessage: "This ticket is closed and cannot be accessed",
                viewers: "viewers"
            },
            users: {
                title: "Users",
                activeAdmins: "Active Admins",
                activeUsers: "Active Users",
                allUsers: "All Users",
                bannedUsers: "Banned Users",
                loading: "Loading...",
                noUsers: "No users registered",
                noActiveUsers: "No active users currently",
                noAdmins: "No active admins currently",
                noBanned: "No banned users",
                points: "points",
                adminBadge: "Admin",
                bannedBadge: "Banned",
                banUser: "Ban User",
                unban: "Unban"
            },
            ratings: {
                title: "Ratings & Reviews",
                allRatings: "All Ratings",
                loading: "Loading...",
                noRatings: "No ratings available",
                adminRating: "Rating for admin: ",
                ticketTitle: "Ticket title: ",
                systemAdmin: "System Admin"
            },
            store: {
                title: "Premium Store",
                adminPanel: {
                    title: "Admin Control Panel",
                    totalProducts: "Total Products",
                    categories: "Categories",
                    totalSales: "Total Sales",
                    revenue: "Revenue",
                    addProduct: "Add Product",
                    manageCategories: "Manage Categories",
                    viewAnalytics: "View Analytics",
                    discountCodes: "Discount Codes"
                },
                controls: {
                    myPurchases: "My Purchases",
                    allCategories: "All Categories"
                },
                products: {
                    views: "Views",
                    purchases: "Purchases",
                    downloads: "Downloads",
                    published: "Published",
                    updated: "Updated",
                    buyNow: "Buy Now",
                    freeAdmin: "Free (Admin)",
                    edit: "Edit",
                    delete: "Delete",
                    count: "products"
                },
                purchases: {
                    title: "My Premium Purchases",
                    purchased: "Purchased",
                    expires: "Expires",
                    expired: "Expired",
                    permanent: "Permanent",
                    download: "Download",
                    noPurchases: "No purchases yet. Start shopping!"
                },
                modal: {
                    addProduct: "Add New Product",
                    editProduct: "Edit Product",
                    category: "Category (Optional)",
                    selectCategory: "Select Category (Optional)",
                    createCategory: "Or create new category",
                    productTitle: "Product Title",
                    titlePlaceholder: "Enter product title",
                    description: "Description",
                    descriptionPlaceholder: "Enter product description",
                    price: "Price ($)",
                    pricePlaceholder: "0.00",
                    imageUrl: "Image URL",
                    imagePlaceholder: "https://example.com/image.jpg",
                    videoUrl: "Video URL",
                    videoPlaceholder: "https://example.com/video.mp4",
                    downloadLink: "Download Link",
                    downloadPlaceholder: "https://example.com/download",
                    expiryDays: "Expiry Days (leave empty for permanent)",
                    expiryPlaceholder: "30",
                    saveProduct: "Save Product",
                    cancel: "Cancel"
                },
                purchase: {
                    title: "Complete Your Purchase",
                    discountCode: "Discount Code",
                    discountPlaceholder: "Enter discount code",
                    applyDiscount: "Apply",
                    discountApplied: "Discount applied successfully!",
                    paymentTitle: "Secure Payment with PayPal",
                    paymentDescription: "Complete your purchase securely using PayPal. Your payment is protected.",
                    cancel: "Cancel"
                },
                messages: {
                    productSaved: "Product saved successfully!",
                    productDeleted: "Product deleted successfully!",
                    purchaseComplete: "Purchase completed successfully!",
                    purchaseFailed: "Purchase failed. Please try again.",
                    paymentCancelled: "Payment cancelled.",
                    paymentFailed: "Payment failed. Please try again.",
                    invalidDiscount: "Invalid discount code.",
                    discountError: "Error validating discount code.",
                    enterDiscountCode: "Please enter a discount code.",
                    deleteConfirm: "Are you sure you want to delete this product?",
                    selectCategoryError: "Please select a category or create a new one.",
                    createCategoryError: "Please create a category name for your first product.",
                    saveError: "Failed to save product.",
                    deleteError: "Failed to delete product.",
                    claimSuccess: "Free product claimed successfully!",
                    claimError: "Failed to claim product. Please try again."
                }
            },
            settings: {
                title: "Settings",
                interfaceSettings: "Interface Settings",
                backgroundImage: "Background Image",
                backgroundImagePlaceholder: "Background image URL",
                logoImage: "Logo Image",
                logoImagePlaceholder: "Logo image URL",
                backgroundMusic: "Background Music URL",
                backgroundMusicPlaceholder: "Background music URL",
                saveSettings: "Save Settings",
                languageSettings: "Language Settings",
                selectLanguage: "Select Language",
                english: "English",
                arabic: "Arabic"
            },
            ticketDetail: {
                user: "User: ",
                date: "Date: ",
                back: "Back",
                acceptTicket: "Accept Ticket",
                changeStatus: "Change Status",
                freezeTicket: "Freeze Ticket",
                unfreezeTicket: "Unfreeze Ticket",
                changeType: "Change Type",
                banUser: "Ban User",
                closeTicket: "Close Ticket",
                messageInput: "Write a message...",
                ticketFrozen: "Ticket is frozen",
                ticketClosed: "Ticket is closed",
                waitingApproval: "Waiting for admin approval"
            },
            modals: {
                newTicket: {
                    title: "New Ticket",
                    ticketTitle: "Ticket Title",
                    ticketTitlePlaceholder: "Enter ticket title",
                    ticketType: "Ticket Type",
                    ticketDescription: "Ticket Description",
                    ticketDescriptionPlaceholder: "Explain your issue or question",
                    attachments: "Attachments (optional, max 5 images)",
                    cancel: "Cancel",
                    create: "Create Ticket"
                },
                status: {
                    title: "Change Ticket Status",
                    status: "Status",
                    cancel: "Cancel",
                    save: "Save"
                },
                type: {
                    title: "Change Ticket Type",
                    type: "Type",
                    cancel: "Cancel",
                    save: "Save"
                },
                ban: {
                    title: "Ban User",
                    reason: "Ban Reason",
                    reasonPlaceholder: "Enter ban reason",
                    cancel: "Cancel",
                    ban: "Ban User"
                },
                rate: {
                    title: "Rate Ticket",
                    message: "Please rate your experience with our support team",
                    comment: "Comment (optional)",
                    commentPlaceholder: "Write your comment here",
                    cancel: "Cancel",
                    submit: "Submit"
                }
            },
            panel: {
                title: "Open Tickets"
            },
            toast: {
                success: "Success",
                error: "Error",
                warning: "Warning",
                info: "Info",
                settingsSaved: "Settings saved successfully",
                ticketCreated: "Ticket created successfully",
                waitMessage: "Please wait",
                beforeNextTicket: "minutes before creating a new ticket",
                rateSuccess: "Thank you for your rating",
                ticketClosed: "This ticket is closed",
                ticketDeleted: "This ticket has been automatically deleted",
                statusChanged: "Ticket status changed to: ",
                typeChanged: "Ticket type changed to: ",
                acceptedTicket: "Ticket accepted",
                userBanned: "User banned",
                userUnbanned: "User unbanned",
                loggedIn: "Logged in",
                sessionSaved: "Session data saved successfully",
                localStorageWarning: "Your browser does not support local storage, you may experience session issues",
                banned: "Banned",
                bannedMessage: "You have been banned from using the system",
                guildError: "You must be a member of the server to use the system",
                authError: "Error during authentication, please try again",
                sessionError: "Session error, please try again",
                unknownError: "Unknown error occurred"
            },
            charCounter: {
                count: ""
            },
            messages: {
                messageTooLong: "Message cannot exceed 500 characters",
                attachmentTooLarge: "Attachment size must not exceed 1MB",
                rateLimit: "Please wait",
                secondsBeforeNext: "seconds before sending a new message"
            }
        },
        
    currentLang: "en",
    
    init: function() {
        let savedLang = localStorage.getItem('selectedLanguage') || this.defaultLanguage;
        this.setLanguage(savedLang);
        return this;
    },
    
    setLanguage: function(lang) {
        if (!this.translations[lang]) {
            return false;
        }
        
        this.currentLang = lang;
        localStorage.setItem('selectedLanguage', lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        this.updateUI();
        return true;
    },
    
    toggleLanguage: function() {
        let newLang = this.currentLang === 'en' ? 'ar' : 'en';
        return this.setLanguage(newLang);
    },
    
    getText: function(key) {
        let keys = key.split('.');
        let obj = this.translations[this.currentLang];
        
        for (let k of keys) {
            if (obj && obj[k] !== undefined) {
                obj = obj[k];
            } else {
                let fallbackObj = this.translations.en;
                for (let fallbackKey of keys) {
                    if (!fallbackObj || fallbackObj[fallbackKey] === undefined) {
                        return key;
                    }
                    fallbackObj = fallbackObj[fallbackKey];
                }
                return fallbackObj;
            }
        }
        
        return obj;
    },
    
    updateUI: function() {
        let elements = document.querySelectorAll('[data-lang-key]');
        elements.forEach(element => {
            let key = element.getAttribute('data-lang-key');
            if (key) {
                let attr = element.getAttribute('data-lang-attr');
                if (attr) {
                    element.setAttribute(attr, this.getText(key));
                } else {
                    element.textContent = this.getText(key);
                }
            }
        });
        
        let placeholderElements = document.querySelectorAll('[data-lang-placeholder]');
        placeholderElements.forEach(element => {
            let key = element.getAttribute('data-lang-placeholder');
            if (key) {
                element.placeholder = this.getText(key);
            }
        });
        
        this.updateTicketStatuses();
        this.updateSpecialElements();
    },
    
    updateTicketStatuses: function() {
        document.querySelectorAll('.status-on-hold').forEach(element => {
            element.textContent = this.getText('tickets.status.onHold');
        });
    },
    
    updateSpecialElements: function() {
        let languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.value = this.currentLang;
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    window.langConfig = langConfig.init();
});
