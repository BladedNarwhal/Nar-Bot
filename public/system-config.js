
const systemConfig = {
  colors: {
    primaryColor: '#7e69ab',
    secondaryColor: '#9b87f5',
    darkColor: '#1a1f2c',
    lightColor: '#f1f0fb',
    textColor: '#e5deff',
    successColor: '#48bb78',
    warningColor: '#f6ad55',
    dangerColor: '#f56565',
    grayColor: '#a0aec0',

    statusOpen: '#48bb78',
    statusClosed: '#f56565',
    statusOnHold: '#f6ad55',

    glassBg: 'rgba(26, 31, 44, 0.75)',
    glassBorder: 'rgba(155, 135, 245, 0.3)'
  },

  images: {
    logo: 'https://i.ibb.co/j9fLsy3m/512.gif',
    background: 'https://twistedsifter.com/wp-content/uploads/2013/05/animated-gifs-of-fighting-game-backgrounds-18.gif',
  },

  sounds: {
    backgroundMusic: '',
    notification: 'https://files.catbox.moe/h2qml1.mp3',
    rating: 'https://files.catbox.moe/a6vhkl.mp3',
    message: 'https://files.catbox.moe/wzac7y.mp3'
  },

  system: {
    ticketAutoDeleteHours: 1,
    ticketCooldownMinutes: 5,
    maxAttachments: 5,
    maxMessageLength: 500,
    defaultLanguage: 'ar',
    ticketPanelEnabled: true,
    toastDuration: 5000,
    rateLimitMessages: 1000
  },

  users: {
    siteName: 'Users - Ticket System',
    siteDescription: 'User Management - Ticket System',
    title: 'Users Management',
    
    settings: {
      usersPerPage: 15,
      toastDuration: 5000,
      banModalEnabled: true,
      unbanEnabled: true,
      autoRefresh: true,
      refreshInterval: 30000,
      showUserPoints: true,
      showUserStatus: true,
      enableUserActions: true,
      showAdminBadge: true,
      showBannedBadge: true,
      maxBanReasonLength: 500,
      minBanReasonLength: 5
    },

    ui: {
      sidebarWidth: '280px',
      sidebarCollapsedWidth: '80px',
      usersGridColumns: '320px',
      userCardMinWidth: '320px',
      userAvatarSize: '50px',
      headerAvatarSize: '32px',
      borderRadius: '12px',
      borderRadiusSmall: '8px',
      borderRadiusLarge: '16px',
      cardPadding: '25px',
      userCardPadding: '18px',
      modalMaxWidth: '450px',
      mobileBreakpoint: '768px',
      tabletBreakpoint: '1024px'
    },

    animations: {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fastTransition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      fadeInUpDuration: '0.6s',
      slideInDuration: '0.3s',
      toastSlideInDuration: '0.4s',
      modalAnimation: '0.3s',
      hoverTransform: 'translateY(-2px)',
      cardHoverTransform: 'translateY(-5px)',
      buttonHoverTransform: 'translateY(-2px)',
      scaleHover: 'scale(1.05)',
      iconScaleHover: 'scale(1.1)',
      pulseAnimation: '2s infinite'
    },

    effects: {
      backdropBlur: 'blur(20px)',
      modalBackdropBlur: 'blur(10px)',
      backgroundAttachment: 'fixed',
      glassOpacity: 0.85,
      hoverGlassOpacity: 0.1,
      cardGlassOpacity: 0.05,
      userCardHoverShadow: '0 8px 25px rgba(126, 105, 171, 0.2)',
      buttonHoverShadow: '0 4px 15px rgba(126, 105, 171, 0.3)'
    },

    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
      large: '0 10px 15px rgba(0, 0, 0, 0.2)',
      userCard: '0 8px 25px rgba(126, 105, 171, 0.2)',
      modal: '0 10px 30px rgba(0, 0, 0, 0.3)',
      toast: '0 4px 20px rgba(0, 0, 0, 0.15)',
      button: '0 4px 15px rgba(126, 105, 171, 0.3)'
    },

    badges: {
      adminColor: 'linear-gradient(135deg, #f6ad55, #ff9500)',
      bannedColor: 'linear-gradient(135deg, #f56565, #e53e3e)',
      pointsColor: 'linear-gradient(135deg, #9b87f5, #7e69ab)',
      adminText: 'Admin',
      bannedText: 'Banned',
      pointsText: 'Points',
      borderRadius: '20px',
      padding: '6px 12px',
      fontSize: '11px'
    },

    modals: {
      banModalTitle: 'Ban User',
      banReasonLabel: 'Ban Reason',
      banReasonPlaceholder: 'Enter the reason for banning this user...',
      banButtonText: 'Ban User',
      cancelButtonText: 'Cancel',
      unbanButtonText: 'Unban',
      banSuccessMessage: 'User has been banned successfully',
      unbanSuccessMessage: 'User has been unbanned successfully',
      banErrorMessage: 'Error banning user',
      unbanErrorMessage: 'Error unbanning user'
    },

    messages: {
      loadingText: 'Loading...',
      noActiveUsers: 'No Active Users',
      noActiveUsersDesc: 'No users are currently online',
      noUsers: 'No Users Found',
      noUsersDesc: 'No users found in the system',
      noAdmins: 'No Administrators',
      noAdminsDesc: 'No administrators found',
      noBannedUsers: 'No Banned Users',
      noBannedUsersDesc: 'No banned users found',
      errorLoadingUsers: 'Failed to load users',
      errorLoadingAdmins: 'Failed to load administrators',
      errorLoadingBanned: 'Failed to load banned users',
      onlineStatus: 'Online',
      banReasonRequired: 'Ban reason is required',
      banningUser: 'Banning...',
      userBanned: 'User has been banned',
      userUnbanned: 'User has been unbanned'
    }
  },

  store: {
    storeName: 'Premium 111 - Ticket System',
    storeDescription: 'Premium Store System',
    storeTitle: 'Store System',
    welcomePrefix: 'مرحباً ',
    paypalClientId: 'ARq3InItpUR8jknkVyCtQIXTQwsHSeOvKdURLEretiaEDBVfmwo0voanVeZ4GCIGbkejtYVOtg6WKpAX', // change this to your  ClientId   # paypal <<<
    currency: 'USD',
    defaultProductImage: 'https://via.placeholder.com/300x200/7e69ab/ffffff?text=Product',
    toastDuration: 5000,
    productViewIncrement: true,
    downloadTracking: true,
    autoAdminClaim: true,
    renewalWarningDays: 7,
    
    ui: {
      headerHeight: '80px',
      sidebarWidth: '280px',
      sidebarCollapsedWidth: '80px',
      borderRadius: '12px',
      cardPadding: '30px',
      buttonPadding: '12px 24px',
      productImageHeight: '220px',
      purchaseImageMaxWidth: '250px',
      purchaseImageMaxHeight: '250px',
      modalMaxWidth: '700px',
      purchaseModalMaxWidth: '500px',
      categoryCardMinWidth: '280px',
      productCardMinWidth: '350px',
      adminStatCardMinWidth: '220px',
      mobileBreakpoint: '768px'
    },

    animations: {
      transitionDuration: '0.3s',
      transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fastTransition: '0.2s',
      modalAnimation: '0.4s',
      toastSlideIn: '0.4s',
      hoverTransform: 'translateY(-4px)',
      buttonHoverTransform: 'translateY(-2px)',
      scaleHover: 'scale(1.05)',
      iconHoverScale: 'scale(1.1)',
      menuItemTransform: 'translateX(4px)'
    },

    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
      large: '0 10px 15px rgba(0, 0, 0, 0.2)',
      card: '0 10px 30px rgba(126, 105, 171, 0.3)',
      success: '0 0 30px rgba(72, 187, 120, 0.3)',
      glow: '0 2px 4px rgba(126, 105, 171, 0.3)',
      text: '0 2px 4px rgba(72, 187, 120, 0.3)'
    },

    effects: {
      backdropBlur: 'blur(20px)',
      modalBackdropBlur: 'blur(10px)',
      cardBackdropBlur: 'blur(30px)',
      backgroundAttachment: 'fixed',
      glassOpacity: 0.85,
      hoverGlassOpacity: 0.1,
      cardGlassOpacity: 0.05
    }
  },

  home: {
    siteName: 'Home - Social Network',
    siteDescription: 'Social Network Home',
    title: 'Social Network',
    welcomeText: 'Welcome to Social Network',
    
    limits: {
      maxPostLength: 100,
      maxCommentLength: 150,
      maxVideoSize: 10485760,
      maxVideoTime: 300,
      maxGifSize: 3145728,
      maxConcurrentUploads: 2
    },

    ui: {
      sidebarWidth: '280px',
      sidebarCollapsedWidth: '80px',
      feedMaxWidth: '720px',
      avatarSize: '42px',
      postAvatarSize: '52px',
      commentAvatarSize: '36px',
      reactionPickerWidth: '170px',
      mobileReactionPickerWidth: '140px',
      borderRadius: '12px',
      cardPadding: '28px',
      borderRadiusLarge: '16px',
      borderRadiusSmall: '8px'
    },

    animations: {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fastTransition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      reactionAnimation: '0.6s',
      uploadProgressShine: '1.5s',
      heartbeatDuration: '0.6s',
      wiggleDuration: '0.6s',
      slideUpBounceDuration: '0.4s',
      toastSlideInDuration: '0.4s',
      fadeInUpDuration: '0.4s',
      newPostIndicatorDuration: '0.4s'
    },

    notifications: {
      toastDuration: 4000,
      autoMarkAsRead: true,
      playNotificationSound: true,
      playMessageSound: true,
      newPostIndicatorTimeout: 10000
    },

    media: {
      allowedVideoTypes: 'video/*',
      allowedImageTypes: 'image/*',
      allowedGifTypes: '.gif',
      videoPreload: 'metadata',
      uploadProgressInterval: 200,
      uploadQueueDisplay: true,
      videoControlsTimeout: 300
    },

    posts: {
      postsPerPage: 10,
      autoLoadMore: false,
      preserveUserInput: true,
      smartUpdateSystem: true,
      reactionPickerDelay: 300,
      viewCountingEnabled: true,
      commentsPerPage: 10,
      repliesPerPage: 5
    },

    reactions: {
      available: ['like', 'love', 'laugh', 'angry', 'sad', 'wow'],
      emojis: {
        like: '👍',
        love: '❤️',
        laugh: '😂',
        angry: '😡',
        sad: '😢',
        wow: '😮'
      },
      defaultReaction: 'like',
      pickerHoverDelay: 300,
      animationEnabled: true
    }
  },

  customText: {
    welcomeMessage: 'مرحباً بك في نظام التذاكر',
    footerText: 'جميع الحقوق محفوظة © 2025 TovStudio',
    
    systemTitle: 'نظام التذاكر المتقدم',
    dashboardTitle: 'لوحة التحكم',
    ticketsTitle: 'التذاكر',
    usersTitle: 'المستخدمين',
    ratingsTitle: 'التقييمات',
    storeTitle: 'المتجر المتميز',
    settingsTitle: 'الإعدادات',
    
    ticketOpenStatus: 'مفتوح',
    ticketClosedStatus: 'مغلق',
    ticketOnHoldStatus: 'في الانتظار',
    
    loginButton: 'تسجيل الدخول',
    logoutButton: 'تسجيل الخروج',
    backButton: 'العودة',
    saveButton: 'حفظ',
    cancelButton: 'إلغاء',
    
    successMessage: 'تم بنجاح!',
    errorMessage: 'حدث خطأ!',
    warningMessage: 'تحذير!',
    
    newTicketButton: 'تذكرة جديدة',
    ticketCreatedMessage: 'تم إنشاء التذكرة بنجاح',
    ticketClosedMessage: 'تم إغلاق التذكرة',
    noTicketsMessage: 'لا توجد تذاكر حالياً',
    
    buyNowButton: 'اشتري الآن',
    addToCartButton: 'أضف للسلة',
    purchaseCompleteMessage: 'تم الشراء بنجاح',
    
    pageDescriptions: {
      dashboard: 'اطلع على إحصائيات النظام والتذاكر الحديثة',
      tickets: 'إدارة ومتابعة جميع التذاكر',
      users: 'إدارة المستخدمين والصلاحيات',
      ratings: 'عرض تقييمات المستخدمين',
      store: 'تسوق المنتجات والخدمات المتميزة',
      settings: 'إعدادات النظام والتخصيص'
    },
    
    adminMessages: {
      welcomeAdmin: 'مرحباً بك أيها المدير',
      adminPanelTitle: 'لوحة تحكم الإدارة',
      userBanned: 'تم حظر المستخدم',
      ticketAccepted: 'تم قبول التذكرة'
    }
  }
};

if (typeof window !== 'undefined') {
  window.systemConfig = systemConfig;

  function applyColorConfig() {
    const root = document.documentElement;

    root.style.setProperty('--system-primary-color', systemConfig.colors.primaryColor);
    root.style.setProperty('--system-secondary-color', systemConfig.colors.secondaryColor);
    root.style.setProperty('--system-dark-color', systemConfig.colors.darkColor);
    root.style.setProperty('--system-light-color', systemConfig.colors.lightColor);
    root.style.setProperty('--system-text-color', systemConfig.colors.textColor);
    root.style.setProperty('--system-success-color', systemConfig.colors.successColor);
    root.style.setProperty('--system-warning-color', systemConfig.colors.warningColor);
    root.style.setProperty('--system-danger-color', systemConfig.colors.dangerColor);
    root.style.setProperty('--system-gray-color', systemConfig.colors.grayColor);
    root.style.setProperty('--system-glass-bg', systemConfig.colors.glassBg);
    root.style.setProperty('--system-glass-border', systemConfig.colors.glassBorder);
    root.style.setProperty('--system-status-open', systemConfig.colors.statusOpen);
    root.style.setProperty('--system-status-closed', systemConfig.colors.statusClosed);
    root.style.setProperty('--system-status-on-hold', systemConfig.colors.statusOnHold);
  }

  function applyUsersConfig() {
    if (systemConfig.users.siteName) {
      document.title = systemConfig.users.siteName;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.content = systemConfig.users.siteDescription;
    }

    const root = document.documentElement;
    
    root.style.setProperty('--system-users-per-page', systemConfig.users.settings.usersPerPage);
    root.style.setProperty('--system-toast-duration', systemConfig.users.settings.toastDuration + 'ms');
    root.style.setProperty('--system-users-grid-columns', systemConfig.users.ui.usersGridColumns);
    root.style.setProperty('--system-user-card-min-width', systemConfig.users.ui.userCardMinWidth);
    root.style.setProperty('--system-sidebar-width', systemConfig.users.ui.sidebarWidth);
    root.style.setProperty('--system-sidebar-collapsed-width', systemConfig.users.ui.sidebarCollapsedWidth);
    root.style.setProperty('--system-border-radius', systemConfig.users.ui.borderRadius);
    root.style.setProperty('--system-border-radius-sm', systemConfig.users.ui.borderRadiusSmall);
    root.style.setProperty('--system-border-radius-lg', systemConfig.users.ui.borderRadiusLarge);
    root.style.setProperty('--system-transition', systemConfig.users.animations.transition);
    root.style.setProperty('--system-transition-fast', systemConfig.users.animations.fastTransition);
    root.style.setProperty('--system-backdrop-blur', systemConfig.users.effects.backdropBlur);
    root.style.setProperty('--system-modal-backdrop-blur', systemConfig.users.effects.modalBackdropBlur);
    root.style.setProperty('--system-shadow-sm', systemConfig.users.shadows.small);
    root.style.setProperty('--system-shadow-md', systemConfig.users.shadows.medium);
    root.style.setProperty('--system-shadow-lg', systemConfig.users.shadows.large);
    
    root.style.setProperty('--system-text-muted', systemConfig.colors.textColor + '80');
    root.style.setProperty('--system-glass-hover', systemConfig.colors.glassBorder.replace('0.3', '0.1'));
    root.style.setProperty('--system-primary-hover', systemConfig.colors.primaryColor + 'dd');
    root.style.setProperty('--system-secondary-hover', systemConfig.colors.secondaryColor + 'dd');
    root.style.setProperty('--system-darker-color', systemConfig.colors.darkColor.replace('1a1f2c', '151a26'));
  }

  function applyStoreConfig() {
    if (systemConfig.store.storeName) {
      document.title = systemConfig.store.storeName;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.content = systemConfig.store.storeDescription;
    }

    const logoText = document.querySelector('.logo-text');
    if (logoText && systemConfig.store.storeTitle) {
      logoText.textContent = systemConfig.store.storeTitle;
    }
  }

  function applyHomeConfig() {
    if (systemConfig.home.siteName) {
      document.title = systemConfig.home.siteName;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.content = systemConfig.home.siteDescription;
    }

    const logoText = document.querySelector('.logo-text');
    if (logoText && systemConfig.home.title) {
      logoText.textContent = systemConfig.home.title;
    }

    const postContentInput = document.getElementById('post-content');
    if (postContentInput) {
      postContentInput.maxLength = systemConfig.home.limits.maxPostLength;
    }

    document.querySelectorAll('.comment-input').forEach(input => {
      input.maxLength = systemConfig.home.limits.maxCommentLength;
    });
  }

  function updateLanguageConfig() {
    if (window.langConfig) {
      window.langConfig.defaultLang = systemConfig.system.defaultLanguage;
      if (!localStorage.getItem('selectedLanguage')) {
        window.langConfig.setLanguage(systemConfig.system.defaultLanguage);
      }
    }
  }

  function applyCustomTexts() {
    const welcomeElement = document.querySelector('[data-custom-text="welcomeMessage"]');
    if (welcomeElement) {
      welcomeElement.textContent = systemConfig.customText.welcomeMessage;
    }

    const footerElement = document.querySelector('[data-custom-text="footerText"]');
    if (footerElement) {
      footerElement.textContent = systemConfig.customText.footerText;
    }

    document.querySelectorAll('[data-custom-text]').forEach(element => {
      const textKey = element.getAttribute('data-custom-text');
      const customText = getNestedText(systemConfig.customText, textKey);
      if (customText) {
        element.textContent = customText;
      }
    });
  }

  function getNestedText(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  window.getCustomText = function(key, fallback = '') {
    return getNestedText(systemConfig.customText, key) || fallback;
  };

  window.getStoreConfig = function(key, fallback = null) {
    return getNestedText(systemConfig.store, key) || fallback;
  };

  window.getHomeConfig = function(key, fallback = null) {
    return getNestedText(systemConfig.home, key) || fallback;
  };

  window.getUsersConfig = function(key, fallback = null) {
    return getNestedText(systemConfig.users, key) || fallback;
  };

  document.addEventListener('DOMContentLoaded', function() {
    applyColorConfig();
    applyUsersConfig();
    applyStoreConfig();
    applyHomeConfig();
    updateLanguageConfig();
    applyCustomTexts();

    const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');

    if (!userSettings.logo && systemConfig.images.logo) {
      const logoImg = document.getElementById('logo-img');
      const logoUrl = document.getElementById('logo-url');
      const logoPreview = document.getElementById('logo-preview');
      
      if (logoImg) logoImg.src = systemConfig.images.logo;
      if (logoUrl) logoUrl.value = systemConfig.images.logo;
      if (logoPreview) logoPreview.src = systemConfig.images.logo;
    }

    if (!userSettings.background && systemConfig.images.background) {
      document.body.style.backgroundImage = `url('${systemConfig.images.background}')`;
      const backgroundUrl = document.getElementById('background-url');
      const backgroundPreview = document.getElementById('background-preview');
      
      if (backgroundUrl) backgroundUrl.value = systemConfig.images.background;
      if (backgroundPreview) backgroundPreview.src = systemConfig.images.background;
    }

    const notificationSound = document.getElementById('notification-sound');
    const ratingSound = document.getElementById('rating-sound');
    const messageSound = document.getElementById('message-sound');
    
    if (notificationSound) notificationSound.src = systemConfig.sounds.notification;
    if (ratingSound) ratingSound.src = systemConfig.sounds.rating;
    if (messageSound) messageSound.src = systemConfig.sounds.message;

    if (systemConfig.sounds.backgroundMusic) {
      const backgroundMusic = document.getElementById('background-music');
      const musicUrl = document.getElementById('music-url');
      
      if (backgroundMusic) backgroundMusic.src = systemConfig.sounds.backgroundMusic;
      if (musicUrl) musicUrl.value = systemConfig.sounds.backgroundMusic;
    }

    console.log('System config loaded successfully');
  });
}
