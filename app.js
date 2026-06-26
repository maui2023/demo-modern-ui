/**
 * Core Javascript Application Logic for W-BINTARA 2.0
 */

document.addEventListener("DOMContentLoaded", () => {
  
  // ==================== STATE MANAGEMENT ====================
  
  // Initial default mockup database
  const defaultMockData = [
    {
      id: "WB-2026-0001",
      name: "Prebet Ali bin Abu",
      type: "military",
      branch: "Army",
      milNo: "T-123456",
      rank: "Prebet",
      phone: "012-3456789",
      officePhone: "03-26921111",
      email: "ali.abu@mil.my",
      vehicleNo: "WQA 4321",
      visitDatetime: "2026-06-26T08:30",
      purpose: "Pejabat Pentadbiran Wisma",
      status: "checked-in"
    },
    {
      id: "WB-2026-0002",
      name: "Koperal Ahmad bin Husin",
      type: "military",
      branch: "Navy",
      milNo: "T-654321",
      rank: "Koperal",
      phone: "019-8765432",
      officePhone: "03-26922222",
      email: "ahmad.h@mil.my",
      vehicleNo: "VBB 9876",
      visitDatetime: "2026-06-26T09:15",
      purpose: "Mess Pegawai / Dewan Sajian",
      status: "checked-in"
    },
    {
      id: "WB-2026-0003",
      name: "Major Ridzuan bin Omar",
      type: "military",
      branch: "Air Force",
      milNo: "A-987654",
      rank: "Major",
      phone: "013-1112222",
      officePhone: "03-26923333",
      email: "ridzuan.o@mil.my",
      vehicleNo: "W/MIL/8876",
      visitDatetime: "2026-06-25T14:00",
      purpose: "Mesyuarat AJK Wisma Bintara",
      status: "checked-out"
    },
    {
      id: "WB-2026-0004",
      name: "John Doe Anak Rambli",
      type: "public",
      icNo: "881023-13-5431",
      agency: "Telekom Malaysia",
      phone: "017-9998887",
      officePhone: "",
      email: "john.doe@tm.com.my",
      vehicleNo: "QAA 1122 C",
      visitDatetime: "2026-06-26T10:00",
      purpose: "Penyelenggaraan Kemudahan",
      status: "checked-in"
    },
    {
      id: "WB-2026-0005",
      name: "Tan Ah Kow",
      type: "public",
      icNo: "650311-10-5211",
      agency: "Keluarga Anggota",
      phone: "016-5554433",
      officePhone: "",
      email: "tan.ahkow@gmail.com",
      vehicleNo: "Tiada",
      visitDatetime: "2026-06-25T10:30",
      purpose: "Lawatan Peribadi / Sosial",
      status: "checked-out"
    }
  ];

  // Load from local storage or set defaults
  let visitors = JSON.parse(localStorage.getItem("w_bintara_visitors"));
  if (!visitors || visitors.length === 0) {
    visitors = defaultMockData;
    localStorage.setItem("w_bintara_visitors", JSON.stringify(visitors));
  }

  // Active registration session details (temporary before saving)
  let activeQRPass = null;
  let weeklyChart = null;
  let qrInstance = null;

  // ==================== INITIALIZATION ====================
  initDateTime();
  initTheme();
  initTabs();
  initFormBehavior();
  initQRGenerator();
  renderDashboard();
  renderRecordsTable();
  initScannerSim();
  initGlobalSearch();
  initSettingsPage();

  // Run auto update clock
  setInterval(initDateTime, 1000);

  // ==================== CLOCK & DATE ====================
  function initDateTime() {
    const dateTimeSpan = document.getElementById("current-datetime");
    if (!dateTimeSpan) return;
    
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    // Display in Malay format
    dateTimeSpan.innerHTML = now.toLocaleDateString('ms-MY', options);
  }

  // ==================== THEME MANAGEMENT ====================
  function initTheme() {
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (!themeBtn) return;

    const darkIcon = themeBtn.querySelector(".dark-icon");
    const lightIcon = themeBtn.querySelector(".light-icon");

    // Apply saved or system theme
    applyTheme(localStorage.getItem("color-scheme") || "light");

    themeBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-bs-theme");
      const targetTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(targetTheme);
    });

    function applyTheme(theme) {
      document.documentElement.setAttribute("data-bs-theme", theme);
      localStorage.setItem("color-scheme", theme);
      
      const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
      if (metaColorScheme) {
        metaColorScheme.content = theme === "dark" ? "dark" : "light dark";
      }

      if (theme === "dark") {
        darkIcon.classList.add("d-none");
        lightIcon.classList.remove("d-none");
      } else {
        darkIcon.classList.remove("d-none");
        lightIcon.classList.add("d-none");
      }

      // Re-trigger chart rendering to update colors if chart is initialized
      updateChartColors();
    }
  }

  // ==================== NAVIGATION / TAB SWITCHING ====================
  function initTabs() {
    const navLinks = document.querySelectorAll(".sidebar-nav .nav-link, [data-tab-link], [data-action-tab]");
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggle-sidebar-btn");
    const toggleCollapsedBtn = document.getElementById("toggle-sidebar-collapsed-btn");
    const closeBtn = document.getElementById("close-sidebar-btn");
    const mainContent = document.querySelector(".main-content");
    
    // Create Backdrop Element for Mobile Sidebar overlay
    let backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop d-none";
    document.body.appendChild(backdrop);

    // Sidebar toggles for mobile view
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        sidebar.classList.add("active");
        backdrop.classList.remove("d-none");
      });
    }

    // Sidebar toggle for desktop/tablet (collapsed)
    if (toggleCollapsedBtn) {
      toggleCollapsedBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        mainContent.classList.toggle("sidebar-collapsed");
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeSidebar);
    }

    backdrop.addEventListener("click", closeSidebar);

    function closeSidebar() {
      sidebar.classList.remove("active");
      backdrop.classList.add("d-none");
    }

    // Switch tab active states
    function switchTab(tabId) {
      // Hide all panes
      document.querySelectorAll(".content-body .tab-pane").forEach(pane => {
        pane.classList.add("d-none");
        pane.classList.remove("active");
      });

      // Show targeted pane
      const targetPane = document.getElementById(`${tabId}-tab`);
      if (targetPane) {
        targetPane.classList.remove("d-none");
        targetPane.classList.add("active");
      }

      // Update sidebar active link UI
      document.querySelectorAll(".sidebar-nav .nav-link").forEach(link => {
        if (link.getAttribute("data-tab") === tabId) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });

      // Special initializations on tab show
      if (tabId === "dashboard") {
        renderDashboard();
      } else if (tabId === "visitor-records") {
        renderRecordsTable();
      } else if (tabId === "qr-scanner") {
        updateScannerDropdown();
      }

      // Close mobile sidebar
      closeSidebar();
      window.scrollTo(0, 0);
    }

    // Bind tab clicks
    document.body.addEventListener("click", (e) => {
      // Sidebar Nav
      const navLink = e.target.closest("[data-tab]");
      if (navLink) {
        e.preventDefault();
        const tabId = navLink.getAttribute("data-tab");
        switchTab(tabId);
        return;
      }

      // Context Action Buttons or Quick dropdown Links
      const actionLink = e.target.closest("[data-action-tab]");
      if (actionLink) {
        const tabId = actionLink.getAttribute("data-action-tab");
        switchTab(tabId);
        return;
      }

      const quickLink = e.target.closest("[data-tab-link]");
      if (quickLink) {
        e.preventDefault();
        const tabId = quickLink.getAttribute("data-tab-link");
        switchTab(tabId);
      }
    });
  }

  // ==================== FORM LOGIC (REGISTER VISITOR) ====================
  function initFormBehavior() {
    const form = document.getElementById("visitor-registration-form");
    if (!form) return;

    const visitorTypeRadios = document.querySelectorAll('[name="visitor_type"]');
    const militaryGroup = document.getElementById("military-fields-group");
    const civilianGroup = document.getElementById("civilian-fields-group");

    // Elements inside groups to toggle required validation
    const milNoInput = document.getElementById("mil_no");
    const milRankSelect = document.getElementById("mil_rank");
    const civilIcInput = document.getElementById("civil_ic");

    // Dynamic field toggle listener
    form.addEventListener("change", (e) => {
      if (e.target.name === "visitor_type") {
        const selectedType = e.target.value;
        if (selectedType === "military") {
          militaryGroup.classList.remove("d-none");
          civilianGroup.classList.add("d-none");
          
          milNoInput.setAttribute("required", "");
          milRankSelect.setAttribute("required", "");
          civilIcInput.removeAttribute("required");
        } else {
          militaryGroup.classList.add("d-none");
          civilianGroup.classList.remove("d-none");
          
          milNoInput.removeAttribute("required");
          milRankSelect.removeAttribute("required");
          civilIcInput.setAttribute("required", "");
        }
        
        // Reset validation styles on toggle
        form.classList.remove("was-validated");
        updateLivePreview();
      }
    });

    // Default visit datetime is current local time
    const visitDatetimeInput = document.getElementById("visit_datetime");
    if (visitDatetimeInput) {
      const now = new Date();
      // Format as YYYY-MM-DDThh:mm
      const formatted = now.toISOString().slice(0, 16);
      visitDatetimeInput.value = formatted;
    }

    // Set preview details on input change
    const inputsToWatch = ["visitor_name", "mil_no", "mil_rank", "civil_ic", "visit_datetime", "mil_branch"];
    inputsToWatch.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", updateLivePreview);
    });

    // Watch radio changes for branch
    document.querySelectorAll('[name="mil_branch"]').forEach(el => {
      el.addEventListener("change", updateLivePreview);
    });

    // Reset Form button action
    document.getElementById("reset-form-btn").addEventListener("click", () => {
      Swal.fire({
        title: "Batal Pendaftaran?",
        text: "Semua maklumat borang yang diisi akan dikosongkan.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Padam!",
        cancelButtonText: "Batal"
      }).then((result) => {
        if (result.isConfirmed) {
          form.reset();
          form.classList.remove("was-validated");
          // Re-set date
          const now = new Date();
          visitDatetimeInput.value = now.toISOString().slice(0, 16);
          // Set to default type
          document.getElementById("type-military").checked = true;
          militaryGroup.classList.remove("d-none");
          civilianGroup.classList.add("d-none");
          
          // Re-initialize preview
          resetPreviewCard();
        }
      });
    });

    // Form Submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add("was-validated");
        Swal.fire({
          title: "Borang Tidak Lengkap",
          text: "Sila lengkapkan semua butiran wajib (*) bertanda merah.",
          icon: "error",
          confirmButtonColor: "var(--primary-color)"
        });
        return;
      }

      // Generate New Visitor Details
      const visitorType = form.elements["visitor_type"].value;
      const passId = "WB-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000));
      
      let categoryText = "";
      let identification = "";
      let detailBranch = "";
      
      if (visitorType === "military") {
        detailBranch = form.elements["mil_branch"].value;
        categoryText = `Tentera (${detailBranch})`;
        identification = milNoInput.value.toUpperCase();
      } else if (visitorType === "public") {
        categoryText = "Orang Awam";
        identification = civilIcInput.value;
      } else {
        categoryText = "Veteran Tentera";
        identification = civilIcInput.value;
      }

      const newVisitor = {
        id: passId,
        name: document.getElementById("visitor_name").value,
        type: visitorType,
        branch: detailBranch || "Awam",
        milNo: visitorType === "military" ? milNoInput.value : "",
        rank: visitorType === "military" ? milRankSelect.value : "",
        icNo: visitorType !== "military" ? civilIcInput.value : "",
        agency: visitorType !== "military" ? document.getElementById("civil_agency").value : "",
        phone: document.getElementById("visitor_phone").value,
        officePhone: document.getElementById("visitor_office_phone").value || "",
        email: document.getElementById("visitor_email").value || "",
        vehicleNo: document.getElementById("vehicle_no").value.toUpperCase(),
        visitDatetime: visitDatetimeInput.value,
        purpose: document.getElementById("visit_purpose").value,
        status: "checked-in" // Default status is Checked-in on registration
      };

      // Add to main state and local storage
      visitors.unshift(newVisitor);
      localStorage.setItem("w_bintara_visitors", JSON.stringify(visitors));

      // Trigger QR generation loader simulation
      const qrLoader = document.getElementById("qr-loading-overlay");
      qrLoader.classList.remove("d-none");

      setTimeout(() => {
        qrLoader.classList.add("d-none");
        
        // Save to active pass global for print/download
        activeQRPass = newVisitor;
        
        // Render QR Pass
        generateQR(JSON.stringify({ id: newVisitor.id, name: newVisitor.name }));
        
        // Update Preview Panel metadata
        document.getElementById("preview-pass-id").innerText = newVisitor.id;
        document.getElementById("preview-visitor-name").innerText = newVisitor.name;
        document.getElementById("preview-category").innerText = categoryText;
        document.getElementById("preview-visit-date").innerText = formatDatetimeString(newVisitor.visitDatetime);

        // Enable Action Buttons
        document.getElementById("print-pass-btn").classList.remove("disabled");
        document.getElementById("download-qr-btn").classList.remove("disabled");

        // Fire Success alerts
        Swal.fire({
          title: "Pendaftaran Berjaya!",
          html: `Pelawat <b>${newVisitor.name}</b> telah berjaya didaftarkan.<br>No Pas: <b>${newVisitor.id}</b>`,
          icon: "success",
          confirmButtonColor: "var(--primary-color)"
        });

        // Reset form but keep the QR Preview active for printing
        form.reset();
        form.classList.remove("was-validated");
        const now = new Date();
        visitDatetimeInput.value = now.toISOString().slice(0, 16);
      }, 800);
    });

    // Helper functions for Form Preview card
    function updateLivePreview() {
      const name = document.getElementById("visitor_name").value || "-";
      const visitorType = form.elements["visitor_type"].value;
      const visitDate = visitDatetimeInput.value ? formatDatetimeString(visitDateInputVal()) : "-";
      
      let category = "-";
      if (visitorType === "military") {
        const branch = form.elements["mil_branch"].value;
        const rank = milRankSelect.value ? `${milRankSelect.value} ` : "";
        category = `${rank}Tentera (${branch})`;
      } else if (visitorType === "public") {
        category = "Orang Awam";
      } else if (visitorType === "veteran") {
        category = "Veteran Tentera";
      }

      document.getElementById("preview-visitor-name").innerText = name;
      document.getElementById("preview-category").innerText = category;
      document.getElementById("preview-visit-date").innerText = visitDate;
      
      // Update interactive QR Preview with live text (simple format)
      if (name !== "-") {
        generateQR(`WB-TEMP: ${name} | ${category}`);
      }
    }

    function visitDateInputVal() {
      return visitDatetimeInput.value;
    }

    function resetPreviewCard() {
      document.getElementById("preview-pass-id").innerText = "WB-TEMP-0000";
      document.getElementById("preview-visitor-name").innerText = "-";
      document.getElementById("preview-category").innerText = "-";
      document.getElementById("preview-visit-date").innerText = "-";
      
      document.getElementById("print-pass-btn").classList.add("disabled");
      document.getElementById("download-qr-btn").classList.add("disabled");
      
      activeQRPass = null;
      generateQR("W-BINTARA SYSTEM PREVIEW");
    }
  }

  // ==================== QR CODE GENERATOR (QRIOUS) ====================
  function initQRGenerator() {
    const canvas = document.getElementById("qr-preview-canvas");
    if (!canvas) return;

    qrInstance = new QRious({
      element: canvas,
      size: 180,
      value: "W-BINTARA SYSTEM PREVIEW",
      foreground: getQRColor(),
      background: "#ffffff"
    });

    // Bind QR actions
    document.getElementById("print-pass-btn").addEventListener("click", () => {
      if (!activeQRPass) return;
      
      // Open clean print window simulation
      const printWin = window.open("", "_blank");
      printWin.document.write(`
        <html>
        <head>
          <title>Cetak Pas Pelawat - ${activeQRPass.id}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; color: #111; }
            .card-print { border: 2px solid #333; border-radius: 12px; padding: 30px; display: inline-block; max-width: 380px; }
            h2 { margin-bottom: 5px; }
            p { margin: 8px 0; }
            .qr-img { margin: 20px 0; }
            .badge-print { font-weight: bold; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="card-print">
            <h2>PAS PELAWAT WISMA BINTARA</h2>
            <p style="color: #666; font-size: 12px;">W-BINTARA Administration Portal</p>
            
            <div class="qr-img">
              <img src="${canvas.toDataURL()}" width="180" height="180">
            </div>
            
            <p style="font-size: 20px; font-weight: bold; color: #0056b3; margin: 5px 0;">ID Pas: ${activeQRPass.id}</p>
            <p><strong>Nama:</strong> ${activeQRPass.name}</p>
            <p><strong>Kategori:</strong> ${activeQRPass.type === "military" ? activeQRPass.rank + " (" + activeQRPass.branch + ")" : "Orang Awam"}</p>
            <p><strong>No. Tentera/IC:</strong> ${activeQRPass.type === "military" ? activeQRPass.milNo : activeQRPass.icNo}</p>
            <p><strong>Kenderaan:</strong> ${activeQRPass.vehicleNo}</p>
            <p><strong>Masa Masuk:</strong> ${formatDatetimeString(activeQRPass.visitDatetime)}</p>
            
            <div class="badge-print">
              SILA KEMUKAKAN PAS INI KEPADA KAWALAN SEMASA KELUAR
            </div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
        </html>
      `);
      printWin.document.close();
    });

    document.getElementById("download-qr-btn").addEventListener("click", () => {
      if (!activeQRPass) return;
      
      const link = document.createElement("a");
      link.download = `pas-qr-${activeQRPass.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  }

  function generateQR(value) {
    if (qrInstance) {
      // Force high quality render colors
      qrInstance.foreground = getQRColor();
      qrInstance.value = value;
    }
  }

  function getQRColor() {
    // Return dark navy for light mode, slate-900 equivalent for dark mode to scan properly on white backgrounds
    return "#0f172a";
  }

  // ==================== DASHBOARD DISPLAY ====================
  function renderDashboard() {
    // Recalculate metrics
    const totalToday = visitors.filter(v => {
      // Simple filter for today's visitors (mocking dates)
      return v.visitDatetime.includes("2026-06-26") || v.visitDatetime.includes("2026-06-25");
    }).length;

    const activeIn = visitors.filter(v => v.status === "checked-in").length;
    
    // Update metric DOM elements
    const metricTotal = document.getElementById("metric-total-today");
    const metricActive = document.getElementById("metric-active-count");
    if (metricTotal) metricTotal.innerText = totalToday;
    if (metricActive) metricActive.innerText = activeIn;

    // Render Recent table (last 4 registrations)
    const recentBody = document.getElementById("dashboard-recent-table-body");
    if (recentBody) {
      recentBody.innerHTML = "";
      const recentList = visitors.slice(0, 4);
      
      if (recentList.length === 0) {
        recentBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Tiada rekod pelawat didaftarkan hari ini.</td></tr>`;
      } else {
        recentList.forEach(v => {
          let categoryBadge = "";
          let categoryClass = "";
          
          if (v.type === "military") {
            categoryClass = "bg-primary-subtle text-primary border border-primary border-opacity-10";
            categoryBadge = `Tentera (${v.branch})`;
          } else if (v.type === "public") {
            categoryClass = "bg-secondary-subtle text-secondary-emphasis border border-secondary border-opacity-10";
            categoryBadge = "Awam";
          } else {
            categoryClass = "bg-success-subtle text-success-emphasis border border-success border-opacity-10";
            categoryBadge = "Veteran";
          }

          const statusBadge = v.status === "checked-in" 
            ? `<span class="badge-status checked-in">Checked In</span>` 
            : `<span class="badge-status checked-out">Checked Out</span>`;

          const rowHtml = `
            <tr>
              <td><span class="text-primary fw-semibold">${v.id}</span></td>
              <td>
                <div class="fw-semibold text-dark-emphasis">${v.name}</div>
                <div class="text-muted small">${v.type === "military" ? v.milNo : v.icNo}</div>
              </td>
              <td><span class="badge ${categoryClass} px-2.5 py-1 rounded-2 font-weight-bold small">${categoryBadge}</span></td>
              <td><code class="text-secondary fw-semibold bg-light px-2 py-1 rounded">${v.vehicleNo}</code></td>
              <td><span class="text-muted small">${formatDatetimeString(v.visitDatetime)}</span></td>
              <td>${statusBadge}</td>
              <td class="text-end">
                ${v.status === "checked-in" 
                  ? `<button class="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 btn-checkout-action" data-id="${v.id}">Daftar Keluar</button>`
                  : `<button class="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 disabled"><i class="fa-solid fa-check"></i> Selesai</button>`
                }
              </td>
            </tr>
          `;
          recentBody.innerHTML += rowHtml;
        });
      }

      // Bind check-out buttons
      recentBody.querySelectorAll(".btn-checkout-action").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const vId = e.target.getAttribute("data-id");
          checkoutVisitor(vId);
        });
      });
    }

    // Render Weekly Visitor Chart.js
    renderWeeklyChart();
  }

  // ==================== CARTA CHART.JS ====================
  function renderWeeklyChart() {
    const canvas = document.getElementById("weekly-visitor-chart");
    if (!canvas) return;

    // Count statistics from mock data for visual representation
    // Darat, Laut, Udara, Awam
    const counts = { Army: 0, Navy: 0, "Air Force": 0, Awam: 0 };
    visitors.forEach(v => {
      if (v.type === "military") {
        counts[v.branch] = (counts[v.branch] || 0) + 1;
      } else {
        counts.Awam += 1;
      }
    });

    const isDark = document.documentElement.getAttribute("data-bs-theme") === "dark";
    const textMutedColor = isDark ? "#94a3b8" : "#64748b";
    const gridColor = isDark ? "#223049" : "#e2e8f0";

    // Chart mock dataset comparing weekly numbers
    const chartData = {
      labels: ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"],
      datasets: [
        {
          label: "Darat (Army)",
          backgroundColor: "#10b981", // Green
          data: [12, 19, 15, 25, 22, 10, 8],
          borderRadius: 6
        },
        {
          label: "Laut (Navy)",
          backgroundColor: "#06b6d4", // Cyan
          data: [8, 12, 10, 18, 14, 6, 4],
          borderRadius: 6
        },
        {
          label: "Udara (Air Force)",
          backgroundColor: "#3b82f6", // Blue
          data: [15, 14, 18, 22, 28, 12, 11],
          borderRadius: 6
        },
        {
          label: "Awam/Veteran",
          backgroundColor: "#64748b", // Slate
          data: [18, 22, 25, 30, 24, 15, 12],
          borderRadius: 6
        }
      ]
    };

    if (weeklyChart) {
      weeklyChart.destroy();
    }

    weeklyChart = new Chart(canvas, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { family: 'Outfit', size: 12 },
              color: textMutedColor
            }
          },
          tooltip: {
            titleFont: { family: 'Outfit', weight: 'bold' },
            bodyFont: { family: 'Outfit' }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Outfit' },
              color: textMutedColor
            }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              font: { family: 'Outfit' },
              color: textMutedColor
            }
          }
        }
      }
    });
  }

  function updateChartColors() {
    if (!weeklyChart) return;
    
    const isDark = document.documentElement.getAttribute("data-bs-theme") === "dark";
    const textMutedColor = isDark ? "#94a3b8" : "#64748b";
    const gridColor = isDark ? "#223049" : "#e2e8f0";

    weeklyChart.options.plugins.legend.labels.color = textMutedColor;
    weeklyChart.options.scales.x.ticks.color = textMutedColor;
    weeklyChart.options.scales.y.ticks.color = textMutedColor;
    weeklyChart.options.scales.y.grid.color = gridColor;
    weeklyChart.update();
  }

  // ==================== VISITOR RECORDS TABLE (TAB 3) ====================
  function renderRecordsTable() {
    const tableBody = document.getElementById("visitor-records-table-body");
    if (!tableBody) return;

    // Filters
    const searchVal = document.getElementById("search-input").value.toLowerCase();
    const catVal = document.getElementById("filter-category").value;
    const statusVal = document.getElementById("filter-status").value;

    // Filter array
    const filteredVisitors = visitors.filter(v => {
      // Text match search
      const matchesSearch = v.name.toLowerCase().includes(searchVal) ||
                            (v.milNo && v.milNo.toLowerCase().includes(searchVal)) ||
                            (v.icNo && v.icNo.toLowerCase().includes(searchVal)) ||
                            v.id.toLowerCase().includes(searchVal) ||
                            v.vehicleNo.toLowerCase().includes(searchVal);
      
      // Category match
      let matchesCat = true;
      if (catVal !== "all") {
        if (catVal.startsWith("military-")) {
          const branch = catVal.split("-")[1];
          matchesCat = v.type === "military" && v.branch === branch;
        } else {
          matchesCat = v.type === catVal;
        }
      }

      // Status match
      let matchesStatus = true;
      if (statusVal !== "all") {
        matchesStatus = v.status === statusVal;
      }

      return matchesSearch && matchesCat && matchesStatus;
    });

    // Populate Table
    tableBody.innerHTML = "";
    if (filteredVisitors.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Tiada rekod pelawat dijumpai dengan kriteria carian.</td></tr>`;
      document.getElementById("table-info-text").innerText = `Menunjukkan 0 hingga 0 daripada 0 baris`;
    } else {
      filteredVisitors.forEach(v => {
        let catBadgeClass = "";
        let categoryText = "";
        
        if (v.type === "military") {
          catBadgeClass = "bg-primary-subtle text-primary border border-primary border-opacity-10";
          categoryText = `Tentera (${v.branch})`;
        } else if (v.type === "public") {
          catBadgeClass = "bg-secondary-subtle text-secondary-emphasis border border-secondary border-opacity-10";
          categoryText = "Awam";
        } else {
          catBadgeClass = "bg-success-subtle text-success-emphasis border border-success border-opacity-10";
          categoryText = "Veteran";
        }

        const statusHtml = v.status === "checked-in"
          ? `<span class="badge-status checked-in">Checked In</span>`
          : `<span class="badge-status checked-out">Checked Out</span>`;

        const rowHtml = `
          <tr>
            <td><span class="text-primary fw-semibold">${v.id}</span></td>
            <td><div class="fw-semibold text-dark-emphasis">${v.name}</div></td>
            <td><code class="text-muted">${v.type === "military" ? v.milNo : v.icNo}</code></td>
            <td><span class="badge ${catBadgeClass} px-2.5 py-1 rounded-2 small">${categoryText}</span></td>
            <td><code class="text-secondary fw-semibold bg-light px-2 py-1 rounded">${v.vehicleNo}</code></td>
            <td><span class="text-muted small">${formatDatetimeString(v.visitDatetime)}</span></td>
            <td>${statusHtml}</td>
            <td class="text-center">
              ${v.status === "checked-in"
                ? `<button class="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 btn-checkout-row" data-id="${v.id}"><i class="fa-solid fa-right-from-bracket me-1"></i> Daftar Keluar</button>`
                : `<span class="text-muted small"><i class="fa-solid fa-circle-check text-success"></i> Selesai</span>`
              }
            </td>
          </tr>
        `;
        tableBody.innerHTML += rowHtml;
      });

      document.getElementById("table-info-text").innerText = `Menunjukkan 1 hingga ${filteredVisitors.length} daripada ${filteredVisitors.length} rekod dijumpai`;
    }

    // Bind check out row events
    tableBody.querySelectorAll(".btn-checkout-row").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const vId = e.currentTarget.getAttribute("data-id");
        checkoutVisitor(vId);
      });
    });

    // Export Buttons Events simulation
    setupExportButtons();
  }

  function setupExportButtons() {
    const exports = ["btn-export-excel", "btn-export-pdf", "btn-print-all"];
    exports.forEach(id => {
      const btn = document.getElementById(id);
      if (btn && !btn.dataset.bound) {
        btn.dataset.bound = "true";
        btn.addEventListener("click", (e) => {
          const type = id.split("-")[2]; // excel, pdf, all
          Swal.fire({
            title: `Mengeksport Rekod...`,
            text: `Data jadual sedang dihimpunkan untuk dimuat turun sebagai ${type.toUpperCase()}.`,
            icon: "info",
            timer: 1500,
            showConfirmButton: false,
            willClose: () => {
              Swal.fire({
                title: "Eksport Selesai!",
                text: `Laporan berjaya dieksport dari pangkalan data PostgreSQL.`,
                icon: "success",
                confirmButtonColor: "var(--primary-color)"
              });
            }
          });
        });
      }
    });

    // Filter change binds
    const filters = ["search-input", "filter-category", "filter-status"];
    filters.forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.dataset.bound) {
        el.dataset.bound = "true";
        el.addEventListener("input", renderRecordsTable);
        el.addEventListener("change", renderRecordsTable);
      }
    });

    // Reset filters
    const resetFiltersBtn = document.getElementById("reset-filters-btn");
    if (resetFiltersBtn && !resetFiltersBtn.dataset.bound) {
      resetFiltersBtn.dataset.bound = "true";
      resetFiltersBtn.addEventListener("click", () => {
        document.getElementById("search-input").value = "";
        document.getElementById("filter-category").value = "all";
        document.getElementById("filter-status").value = "all";
        renderRecordsTable();
      });
    }
  }

  // Common checkout function
  function checkoutVisitor(id) {
    Swal.fire({
      title: "Daftar Keluar Pelawat?",
      text: "Anda akan mencatat masa keluar pelawat ini dari Wisma Bintara.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Check-Out!",
      cancelButtonText: "Batal"
    }).then((result) => {
      if (result.isConfirmed) {
        // Find in array
        const idx = visitors.findIndex(v => v.id === id);
        if (idx !== -1) {
          visitors[idx].status = "checked-out";
          localStorage.setItem("w_bintara_visitors", JSON.stringify(visitors));
          
          Swal.fire({
            title: "Check-Out Berjaya!",
            text: `Pelawat ${visitors[idx].name} telah didaftar keluar.`,
            icon: "success",
            confirmButtonColor: "var(--primary-color)"
          });
          
          // Re-render
          renderDashboard();
          renderRecordsTable();
        }
      }
    });
  }

  // ==================== QR SCANNER SIMULATION (TAB 4) ====================
  function updateScannerDropdown() {
    const select = document.getElementById("mock-visitor-select");
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>-- Pilih Pelawat --</option>';
    
    // Only show checked-in visitors in dropdown for quick check-out demo, but allow any
    visitors.forEach(v => {
      const statusText = v.status === "checked-in" ? "Mendaftar Masuk" : "Telah Keluar";
      select.innerHTML += `<option value="${v.id}">${v.name} (${v.id}) - [${statusText}]</option>`;
    });
  }

  function initScannerSim() {
    const startBtn = document.getElementById("start-mock-scan-btn");
    const stopBtn = document.getElementById("stop-mock-scan-btn");
    const select = document.getElementById("mock-visitor-select");
    const resultBox = document.getElementById("scan-result-box");
    const checkoutBtn = document.getElementById("scan-checkout-btn");

    let isScanning = false;
    let scanLaser = document.querySelector(".scanner-laser-line");

    if (scanLaser) scanLaser.style.animationPlayState = "paused";

    startBtn.addEventListener("click", () => {
      const selectedId = select.value;
      if (!selectedId) {
        Swal.fire({
          title: "Pilih Pelawat",
          text: "Sila pilih salah satu nama pelawat di panel kanan untuk disimulasikan.",
          icon: "warning",
          confirmButtonColor: "var(--primary-color)"
        });
        return;
      }

      // Start scanning simulation
      isScanning = true;
      startBtn.disabled = true;
      stopBtn.disabled = false;
      select.disabled = true;
      resultBox.classList.add("d-none");
      if (scanLaser) scanLaser.style.animationPlayState = "running";

      // Show loader in viewfinder
      const feed = document.querySelector(".scanner-mock-feed");
      feed.innerHTML = `
        <div class="spinner-grow text-success" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Scanning...</span>
        </div>
        <p class="mt-3 mb-0 fw-bold text-success animate-pulse">Mengimbas Kod QR...</p>
      `;

      // After 2 seconds scan completes
      setTimeout(() => {
        if (!isScanning) return; // cancelled

        const visitor = visitors.find(v => v.id === selectedId);
        if (visitor) {
          // Play simulated beep sound if supported
          try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const osc = context.createOscillator();
            osc.frequency.value = 880;
            osc.connect(context.destination);
            osc.start();
            osc.stop(context.currentTime + 0.1);
          } catch(e) {}

          // Show scan result details
          document.getElementById("scan-res-name").innerText = visitor.name;
          document.getElementById("scan-res-id").innerText = visitor.id;
          
          let catText = "";
          if (visitor.type === "military") {
            catText = `Tentera (${visitor.branch})`;
          } else if (visitor.type === "public") {
            catText = "Awam";
          } else {
            catText = "Veteran";
          }
          document.getElementById("scan-res-cat").innerText = catText;
          
          const statusBadge = document.getElementById("scan-res-status");
          statusBadge.innerText = visitor.status === "checked-in" ? "Checked-In" : "Checked-Out";
          statusBadge.className = visitor.status === "checked-in" ? "badge bg-success" : "badge bg-danger";

          resultBox.classList.remove("d-none");

          // Configure check-out button context
          if (visitor.status === "checked-in") {
            checkoutBtn.classList.remove("d-none");
          } else {
            checkoutBtn.classList.add("d-none");
          }

          // Reset feed UI
          feed.innerHTML = `
            <i class="fa-solid fa-qrcode fs-1 mb-3 text-success"></i>
            <p class="mb-1 text-success fw-bold">Imbasan Berjaya!</p>
            <span class="small text-white-50">Data pelawat dipaparkan di panel kanan</span>
          `;
        }

        // Stop scanning view
        if (scanLaser) scanLaser.style.animationPlayState = "paused";
        startBtn.disabled = false;
        stopBtn.disabled = true;
        select.disabled = false;
        isScanning = false;
      }, 1800);
    });

    stopBtn.addEventListener("click", () => {
      isScanning = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
      select.disabled = false;
      if (scanLaser) scanLaser.style.animationPlayState = "paused";

      const feed = document.querySelector(".scanner-mock-feed");
      feed.innerHTML = `
        <i class="fa-solid fa-camera fs-1 mb-3 text-white-50 animate-pulse"></i>
        <p class="mb-1 fw-medium">Sedia Untuk Imbas</p>
        <span class="small text-white-50">Sila acukan Kod QR pas pelawat ke kawasan kamera</span>
      `;
    });

    checkoutBtn.addEventListener("click", () => {
      const selectedId = select.value;
      const visitor = visitors.find(v => v.id === selectedId);
      if (visitor && visitor.status === "checked-in") {
        visitor.status = "checked-out";
        localStorage.setItem("w_bintara_visitors", JSON.stringify(visitors));

        Swal.fire({
          title: "Check-Out Berjaya!",
          text: `Pelawat ${visitor.name} telah didaftar keluar dari sistem.`,
          icon: "success",
          confirmButtonColor: "var(--primary-color)"
        });

        // Hide checkout button and update status badge
        checkoutBtn.classList.add("d-none");
        const statusBadge = document.getElementById("scan-res-status");
        statusBadge.innerText = "Checked-Out";
        statusBadge.className = "badge bg-danger";
        
        // Update other views
        renderDashboard();
        renderRecordsTable();
        updateScannerDropdown();
        select.value = selectedId; // keep current selection
      }
    });
  }

  // ==================== GLOBAL SEARCH (HEADER) ====================
  function initGlobalSearch() {
    const searchInput = document.getElementById("global-search-input");
    if (!searchInput) return;

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) {
          // Switch to records tab and apply query filter
          document.querySelector('[data-tab="visitor-records"]').click();
          const recordsSearch = document.getElementById("search-input");
          if (recordsSearch) {
            recordsSearch.value = query;
            renderRecordsTable();
          }
          searchInput.value = "";
        }
      }
    });
  }

  // ==================== SETTINGS PAGE & RESET ====================
  function initSettingsPage() {
    const saveBtn = document.getElementById("save-settings-btn");
    const backupBtn = document.getElementById("backup-db-btn");
    const resetDbBtn = document.getElementById("reset-mock-db-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const logoutQuickBtn = document.getElementById("logout-quick-btn");

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        Swal.fire({
          title: "Simpan Konfigurasi",
          text: "Adakah anda pasti mahu menyimpan tetapan pos pengawal baharu ini?",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "var(--primary-color)",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Ya, Simpan!",
          cancelButtonText: "Batal"
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Disimpan!",
              text: "Tetapan sistem telah berjaya disimpan.",
              icon: "success",
              confirmButtonColor: "var(--primary-color)"
            });
          }
        });
      });
    }

    if (backupBtn) {
      backupBtn.addEventListener("click", () => {
        Swal.fire({
          title: "Menjana Sandaran PostgreSQL...",
          html: "Menyediakan arkib pangkalan data <code>wisma_bintara_backup.sql</code>",
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
          willClose: () => {
            Swal.fire({
              title: "Sandaran Berjaya!",
              text: "Pangkalan data telah berjaya disandarkan secara digital.",
              icon: "success",
              confirmButtonColor: "var(--primary-color)"
            });
          }
        });
      });
    }

    if (resetDbBtn) {
      resetDbBtn.addEventListener("click", () => {
        Swal.fire({
          title: "Set Semula Data Portal?",
          text: "Tindakan ini akan memadam data baharu dan menetapkan semula pangkalan data simulasi ke tetapan asal. Tindakan ini tidak menjejaskan pangkalan data PostgreSQL JSP sebenar.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Ya, Set Semula!",
          cancelButtonText: "Batal"
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.removeItem("w_bintara_visitors");
            Swal.fire({
              title: "Portal Ditetapkan Semula!",
              text: "Halaman akan dimuat semula sekarang.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
              willClose: () => {
                window.location.reload();
              }
            });
          }
        });
      });
    }

    const logoutAction = () => {
      Swal.fire({
        title: "Log Keluar Sistem?",
        text: "Anda perlu log masuk semula untuk mengakses sistem.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, Keluar!",
        cancelButtonText: "Batal"
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Telah Log Keluar",
            text: "Mengalihkan ke halaman log masuk...",
            icon: "success",
            timer: 1000,
            showConfirmButton: false,
            willClose: () => {
              // Mock redirect to login
              Swal.fire("Demo Sahaja", "Dalam aplikasi JSP sebenar, ini akan membatalkan sesi dan mengembalikan ke login.jsp.", "info");
            }
          });
        }
      });
    };

    if (logoutBtn) logoutBtn.addEventListener("click", logoutAction);
    if (logoutQuickBtn) logoutQuickBtn.addEventListener("click", logoutAction);
  }

  // ==================== UTILITY FUNCTIONS ====================
  
  // Format Date String from YYYY-MM-DDThh:mm to readable format: "26 Jun 2026, 08:30 AM"
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
      hours = hours ? hours : 12; // the hour '0' should be '12'
      
      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    } catch(e) {
      return str;
    }
  }

});
