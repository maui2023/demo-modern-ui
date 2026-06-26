/**
 * Core Application Logic for W-BINTARA Mobile User Portal
 */

document.addEventListener("DOMContentLoaded", () => {
  
  // ==================== STATE MANAGEMENT ====================
  
  // Standard mock credentials
  const demoUsers = {
    military: {
      username: "T-123456",
      name: "Prebet Ali bin Abu",
      type: "military",
      branch: "Army",
      milNo: "T-123456",
      rank: "Prebet",
      phone: "012-3456789",
      email: "ali.abu@mil.my",
      vehicleNo: "WQA 4321"
    },
    public: {
      username: "881023-13-5431",
      name: "John Doe Anak Rambli",
      type: "public",
      icNo: "881023-13-5431",
      agency: "Telekom Malaysia",
      phone: "017-9998887",
      email: "john.doe@tm.com.my",
      vehicleNo: "QAA 1122 C"
    }
  };

  let currentUser = JSON.parse(localStorage.getItem("w_bintara_active_user"));
  let visitors = JSON.parse(localStorage.getItem("w_bintara_visitors")) || [];

  // ==================== INITIALIZATION ====================
  initApp();

  function initApp() {
    initTheme();
    
    if (currentUser) {
      showAppShell();
    } else {
      showLoginScreen();
    }
    
    setupLoginEvents();
    setupNavigationEvents();
    setupFormEvents();
    setupQREvents();
  }

  // ==================== SESSION MANAGEMENT ====================
  
  function showLoginScreen() {
    document.getElementById("login-screen").classList.remove("d-none");
    document.getElementById("app-shell").classList.add("d-none");
  }

  function showAppShell() {
    document.getElementById("login-screen").classList.add("d-none");
    document.getElementById("app-shell").classList.remove("d-none");
    
    // Load dashboard and user data
    updateUserProfileUI();
    renderUserDashboard();
    renderUserHistory();
  }

  function setupLoginEvents() {
    const loginForm = document.getElementById("login-form");
    const demoMilBtn = document.getElementById("demo-mil-btn");
    const demoCivBtn = document.getElementById("demo-civ-btn");

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value.trim();
        
        // Find matching user or fallback
        let matchedUser = null;
        if (username === demoUsers.military.username) {
          matchedUser = demoUsers.military;
        } else if (username === demoUsers.public.username) {
          matchedUser = demoUsers.public;
        } else {
          // Create a dynamic demo user based on the input
          const isMilitary = username.startsWith("T-") || username.startsWith("A-") || username.length < 8;
          matchedUser = {
            username: username,
            name: isMilitary ? "Demo Anggota Tentera" : "Demo Pelawat Awam",
            type: isMilitary ? "military" : "public",
            branch: isMilitary ? "Army" : "",
            milNo: isMilitary ? username : "",
            rank: isMilitary ? "Lans Koperal" : "",
            icNo: isMilitary ? "" : username,
            phone: "019-9999999",
            email: "demo@wisma.my",
            vehicleNo: "TIADA"
          };
        }

        loginUser(matchedUser);
      });
    }

    if (demoMilBtn) {
      demoMilBtn.addEventListener("click", () => {
        loginUser(demoUsers.military);
      });
    }

    if (demoCivBtn) {
      demoCivBtn.addEventListener("click", () => {
        loginUser(demoUsers.public);
      });
    }
  }

  function loginUser(user) {
    currentUser = user;
    localStorage.setItem("w_bintara_active_user", JSON.stringify(currentUser));
    
    Swal.fire({
      title: "Log Masuk Berjaya",
      text: `Selamat datang, ${user.name}!`,
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      showAppShell();
      // Clear inputs
      document.getElementById("login-form").reset();
    });
  }

  function logoutUser() {
    Swal.fire({
      title: "Log Keluar?",
      text: "Anda perlu log masuk semula untuk memohon pas masuk.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Log Keluar",
      cancelButtonText: "Batal"
    }).then((result) => {
      if (result.isConfirmed) {
        currentUser = null;
        localStorage.removeItem("w_bintara_active_user");
        showLoginScreen();
      }
    });
  }

  // ==================== NAVIGATION ====================

  function setupNavigationEvents() {
    // Bottom navigation buttons
    const navButtons = document.querySelectorAll("[data-tab-btn]");
    navButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const targetTab = btn.getAttribute("data-tab-btn");
        switchTab(targetTab);
      });
    });

    // Inline navigation links (data-tab-link)
    document.body.addEventListener("click", (e) => {
      const link = e.target.closest("[data-tab-link]");
      if (link) {
        e.preventDefault();
        const targetTab = link.getAttribute("data-tab-link");
        switchTab(targetTab);
      }
    });

    // Logout actions
    const logoutBtn = document.getElementById("logout-btn");
    const logoutQuickBtn = document.getElementById("logout-quick-btn");
    
    if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
    if (logoutQuickBtn) logoutQuickBtn.addEventListener("click", logoutUser);
    
    // Quick Contact
    const contactBtn = document.getElementById("quick-contact-btn");
    if (contactBtn) {
      contactBtn.addEventListener("click", () => {
        Swal.fire({
          title: "Hubungi Wisma Bintara",
          html: `
            <div class="text-start">
              <p><strong>Pos Kawalan Utama:</strong><br><a href="tel:0326921111" class="text-decoration-none"><i class="fa-solid fa-phone"></i> 03-2692 1111 (Ext: 442)</a></p>
              <p><strong>Pejabat Pentadbiran Wisma:</strong><br><a href="tel:0326922222" class="text-decoration-none"><i class="fa-solid fa-phone"></i> 03-2692 2222</a></p>
              <p class="mb-0"><strong>Emel Pentadbiran:</strong><br><a href="mailto:admin@wismabintara.mil.my" class="text-decoration-none"><i class="fa-solid fa-envelope"></i> admin@wismabintara.mil.my</a></p>
            </div>
          `,
          icon: "info",
          confirmButtonColor: "var(--primary-color)"
        });
      });
    }
  }

  function switchTab(tabId) {
    // Hide all tab sections
    document.querySelectorAll(".tab-section").forEach(sec => {
      sec.classList.add("d-none");
    });

    // Show target section
    const targetSection = document.getElementById(tabId);
    if (targetSection) {
      targetSection.classList.remove("d-none");
    }

    // Update bottom navigation buttons active states
    document.querySelectorAll("[data-tab-btn]").forEach(btn => {
      if (btn.getAttribute("data-tab-btn") === tabId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Special handlers when showing certain tabs
    if (tabId === "tab-home") {
      renderUserDashboard();
    } else if (tabId === "tab-qr") {
      renderQRPassPage();
    } else if (tabId === "tab-history") {
      renderUserHistory();
    } else if (tabId === "tab-profile") {
      updateUserProfileUI();
    }
  }

  // ==================== THEME MANAGEMENT ====================

  function initTheme() {
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (!themeBtn) return;
    
    const themeIcon = document.getElementById("theme-icon");
    
    themeBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-bs-theme");
      const targetTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(targetTheme);
    });

    function applyTheme(theme) {
      document.documentElement.setAttribute("data-bs-theme", theme);
      localStorage.setItem("color-scheme", theme);
      
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.content = theme === "dark" ? "#0f172a" : "#2563eb";
      }

      if (theme === "dark") {
        themeIcon.className = "fa-solid fa-sun text-warning";
      } else {
        themeIcon.className = "fa-solid fa-moon text-muted";
      }
    }

    applyTheme(localStorage.getItem("color-scheme") || "light");
  }

  // ==================== DASHBOARD & PROFILE LOGIC ====================

  function updateUserProfileUI() {
    if (!currentUser) return;
    
    // Initials
    const initials = currentUser.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
    document.getElementById("user-avatar-initials").innerText = initials;
    document.getElementById("profile-avatar-initials").innerText = initials;
    
    // Display names
    document.getElementById("user-display-name").innerText = currentUser.name;
    document.getElementById("profile-name-text").innerText = currentUser.name;
    document.getElementById("apply-name").innerText = currentUser.name;
    
    // Identity numbers
    const idNo = currentUser.type === "military" ? currentUser.milNo : currentUser.icNo;
    document.getElementById("profile-id-text").innerText = `ID: ${idNo}`;
    document.getElementById("apply-id-no").innerText = idNo;
    
    // Set Profile details
    let categoryLabel = "Orang Awam";
    if (currentUser.type === "military") {
      categoryLabel = `${currentUser.rank} - Tentera (${currentUser.branch})`;
    } else if (currentUser.type === "veteran") {
      categoryLabel = "Veteran Tentera";
    }
    document.getElementById("profile-category-text").innerText = categoryLabel;
    document.getElementById("profile-phone-text").innerText = currentUser.phone || "-";
    document.getElementById("profile-email-text").innerText = currentUser.email || "-";
    
    // Autofill Form Vehicle No
    if (currentUser.vehicleNo) {
      document.getElementById("apply-vehicle").value = currentUser.vehicleNo;
    }
    
    // Set Default visit datetime input to current time
    const applyDatetime = document.getElementById("apply-datetime");
    if (applyDatetime) {
      const now = new Date();
      applyDatetime.value = now.toISOString().slice(0, 16);
    }
  }

  function getActivePass() {
    // Reload visitors array
    visitors = JSON.parse(localStorage.getItem("w_bintara_visitors")) || [];
    
    // Find the latest active check-in pass for this user
    return visitors.find(v => {
      const isUser = currentUser.type === "military" 
        ? v.milNo === currentUser.milNo 
        : v.icNo === currentUser.icNo;
      return isUser && v.status === "checked-in";
    });
  }

  function renderUserDashboard() {
    if (!currentUser) return;
    
    const activePass = getActivePass();
    const noPassCard = document.getElementById("no-pass-card");
    const activePassBrief = document.getElementById("active-pass-brief");

    if (activePass) {
      noPassCard.classList.add("d-none");
      activePassBrief.classList.remove("d-none");
      
      document.getElementById("active-pass-id-text").innerText = activePass.id;
      document.getElementById("active-pass-purpose-text").innerText = activePass.purpose;
      
      // Update green dot notification on center QR button
      document.getElementById("nav-qr-btn").classList.add("active");
    } else {
      noPassCard.classList.remove("d-none");
      activePassBrief.classList.add("d-none");
      document.getElementById("nav-qr-btn").classList.remove("active");
    }
  }

  // ==================== FORM SUBMISSION ====================

  function setupFormEvents() {
    const applyForm = document.getElementById("apply-pass-form");
    if (!applyForm) return;

    applyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      if (!currentUser) return;
      
      // Check if user already has an active check-in pass
      const existingPass = getActivePass();
      if (existingPass) {
        Swal.fire({
          title: "Permohonan Gagal",
          text: "Anda mempunyai pas aktif sedia ada. Sila daftar keluar pas lama terlebih dahulu.",
          icon: "warning",
          confirmButtonColor: "var(--primary-color)"
        });
        return;
      }

      const vehicle = document.getElementById("apply-vehicle").value.toUpperCase().trim();
      const purpose = document.getElementById("apply-purpose").value;
      const visitTime = document.getElementById("apply-datetime").value;
      
      const passId = "WB-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000));
      
      const newVisitorRecord = {
        id: passId,
        name: currentUser.name,
        type: currentUser.type,
        branch: currentUser.branch || "Awam",
        milNo: currentUser.type === "military" ? currentUser.milNo : "",
        rank: currentUser.type === "military" ? currentUser.rank : "",
        icNo: currentUser.type !== "military" ? currentUser.icNo : "",
        agency: currentUser.agency || "Persendirian",
        phone: currentUser.phone,
        officePhone: "",
        email: currentUser.email,
        vehicleNo: vehicle || "Tiada",
        visitDatetime: visitTime,
        purpose: purpose,
        status: "checked-in" // Auto active checked-in pass on submission
      };

      // Add to localStorage shared visitors database
      visitors = JSON.parse(localStorage.getItem("w_bintara_visitors")) || [];
      visitors.unshift(newVisitorRecord);
      localStorage.setItem("w_bintara_visitors", JSON.stringify(visitors));
      
      // Update local vehicle profile
      if (vehicle) {
        currentUser.vehicleNo = vehicle;
        localStorage.setItem("w_bintara_active_user", JSON.stringify(currentUser));
      }

      Swal.fire({
        title: "Permohonan Berjaya!",
        html: `Pas Masuk <b>${passId}</b> telah didaftarkan secara automatik.<br>Tunjukkan Kod QR di kaunter keselamatan.`,
        icon: "success",
        confirmButtonColor: "var(--primary-color)"
      }).then(() => {
        applyForm.reset();
        updateUserProfileUI();
        // Redirect to QR tab
        switchTab("tab-qr");
      });
    });

    // Change password form logic
    const changePwdForm = document.getElementById("change-password-form");
    if (changePwdForm) {
      changePwdForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const currentPwd = document.getElementById("change-pwd-current").value;
        const newPwd = document.getElementById("change-pwd-new").value;
        const confirmPwd = document.getElementById("change-pwd-confirm").value;

        if (newPwd !== confirmPwd) {
          Swal.fire({
            title: "Ralat Pengesahan",
            text: "Kata laluan baharu dan pengesahan kata laluan tidak sepadan.",
            icon: "error",
            confirmButtonColor: "var(--primary-color)"
          });
          return;
        }

        // Simulating password check (default is 'password' for demo accounts)
        if (currentPwd !== "password") {
          Swal.fire({
            title: "Kemaskini Gagal",
            text: "Kata laluan semasa anda adalah salah (guna 'password' untuk demo).",
            icon: "error",
            confirmButtonColor: "var(--primary-color)"
          });
          return;
        }

        Swal.fire({
          title: "Berjaya!",
          text: "Kata laluan anda telah berjaya ditukar.",
          icon: "success",
          confirmButtonColor: "var(--primary-color)"
        }).then(() => {
          changePwdForm.reset();
        });
      });
    }
  }

  // ==================== QR GENERATION & SIMULATION ====================
  
  let userQRInstance = null;
  function renderQRPassPage() {
    const activePass = getActivePass();
    const noQrContainer = document.getElementById("no-qr-pass-available");
    const qrDisplayContainer = document.getElementById("qr-pass-display-container");
    const canvas = document.getElementById("user-qr-canvas");

    if (activePass) {
      noQrContainer.classList.add("d-none");
      qrDisplayContainer.classList.remove("d-none");

      // Set metadata labels in card
      document.getElementById("user-pass-id-display").innerText = activePass.id;
      document.getElementById("user-pass-name-display").innerText = activePass.name;
      
      let idText = activePass.type === "military" ? activePass.milNo : activePass.icNo;
      let categoryBadgeText = activePass.type === "military" 
        ? `${activePass.rank} (${activePass.branch})` 
        : "Orang Awam";
      
      document.getElementById("user-pass-identity-display").innerText = `${idText} [${categoryBadgeText}]`;
      document.getElementById("user-pass-vehicle-display").innerText = activePass.vehicleNo;
      document.getElementById("user-pass-time-display").innerText = formatDatetimeString(activePass.visitDatetime);

      // Render QR
      const qrData = JSON.stringify({ id: activePass.id, name: activePass.name });
      
      if (userQRInstance) {
        userQRInstance.value = qrData;
      } else {
        userQRInstance = new QRious({
          element: canvas,
          size: 160,
          value: qrData,
          foreground: "#0f172a",
          background: "#ffffff"
        });
      }
    } else {
      noQrContainer.classList.remove("d-none");
      qrDisplayContainer.classList.add("d-none");
    }
  }

  function setupQREvents() {
    const downloadBtn = document.getElementById("download-user-qr-btn");
    const scanSimBtn = document.getElementById("simulate-guard-scan-btn");
    const canvas = document.getElementById("user-qr-canvas");

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        const activePass = getActivePass();
        if (!activePass) return;
        
        const link = document.createElement("a");
        link.download = `w-bintara-pass-${activePass.id}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    }

    if (scanSimBtn) {
      scanSimBtn.addEventListener("click", () => {
        const activePass = getActivePass();
        if (!activePass) return;

        Swal.fire({
          title: "Simulasi Imbasan Pengawal",
          text: "Simulasikan proses pengawal keselamatan mengimbas kod QR pas masuk anda.",
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "var(--primary-color)",
          cancelButtonColor: "#d33",
          confirmButtonText: "Mulakan Imbasan",
          cancelButtonText: "Batal"
        }).then((result) => {
          if (result.isConfirmed) {
            // Trigger check-out simulation
            checkoutActivePass(activePass.id);
          }
        });
      });
    }
  }

  function checkoutActivePass(passId) {
    visitors = JSON.parse(localStorage.getItem("w_bintara_visitors")) || [];
    const idx = visitors.findIndex(v => v.id === passId);
    
    if (idx !== -1) {
      // Simulate check-out status
      visitors[idx].status = "checked-out";
      localStorage.setItem("w_bintara_visitors", JSON.stringify(visitors));
      
      Swal.fire({
        title: "Daftar Keluar Berjaya",
        html: `Pas <b>${passId}</b> telah berjaya didaftarkan keluar oleh sistem pengawal (simulasi).`,
        icon: "success",
        confirmButtonColor: "var(--primary-color)"
      }).then(() => {
        switchTab("tab-home");
      });
    }
  }

  // ==================== VISIT HISTORY LOGIC ====================

  function renderUserHistory() {
    if (!currentUser) return;
    
    // Reload visitors
    visitors = JSON.parse(localStorage.getItem("w_bintara_visitors")) || [];
    
    const container = document.getElementById("history-items-container");
    if (!container) return;

    // Filter visitors history for this user
    const userHistory = visitors.filter(v => {
      return currentUser.type === "military" 
        ? v.milNo === currentUser.milNo 
        : v.icNo === currentUser.icNo;
    });

    if (userHistory.length === 0) {
      container.innerHTML = `<p class="text-muted text-center py-4 small">Tiada rekod sejarah lawatan ditemui.</p>`;
      return;
    }

    container.innerHTML = "";
    userHistory.forEach(v => {
      const statusBadgeClass = v.status === "checked-in" ? "checked-in" : "checked-out";
      const statusText = v.status === "checked-in" ? "Checked-In" : "Telah Keluar";
      
      const itemHtml = `
        <div class="history-item">
          <div>
            <div class="fw-bold small text-dark-emphasis">${v.purpose}</div>
            <div class="text-muted" style="font-size: 0.7rem;">
              <span>No Pas: <strong>${v.id}</strong></span> • 
              <span>${formatDatetimeString(v.visitDatetime)}</span>
            </div>
            <div class="text-muted" style="font-size: 0.7rem;">
              <span>Kenderaan: <code>${v.vehicleNo}</code></span>
            </div>
          </div>
          <div>
            <span class="badge-mobile-status ${statusBadgeClass}" style="font-size: 0.65rem;">${statusText}</span>
          </div>
        </div>
      `;
      container.innerHTML += itemHtml;
    });
  }

  // ==================== UTILITY FUNCTIONS ====================
  
  function formatDatetimeString(str) {
    if (!str) return "-";
    try {
      const dt = new Date(str);
      const months = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogos", "Sep", "Okt", "Nov", "Dis"];
      
      const day = dt.getDate();
      const month = months[dt.getMonth()];
      const year = dt.getFullYear();
      
      let hours = dt.getHours();
      const minutes = String(dt.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12;
      
      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    } catch(e) {
      return str;
    }
  }

});
