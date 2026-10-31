let currentApiBase = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', async () => {
  const authLoading = document.getElementById('auth-loading');
  const loggedInView = document.getElementById('logged-in-view');
  const loggedOutView = document.getElementById('logged-out-view');
  const userDisplayName = document.getElementById('user-display-name');
  const userDisplayEmail = document.getElementById('user-display-email');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginError = document.getElementById('login-error');
  const currentTabInfo = document.getElementById('current-tab-info');
  const quickSearchInput = document.getElementById('quick-search-input');
  const quickSearchResults = document.getElementById('quick-search-results');
  const btnToggleSettings = document.getElementById('btn-toggle-settings');
  const settingsSection = document.getElementById('settings-section');
  const apiUrlInput = document.getElementById('api-url-input');
  const btnSaveApiUrl = document.getElementById('btn-save-api-url');

  // Toggle settings
  if (btnToggleSettings && settingsSection) {
    btnToggleSettings.addEventListener('click', () => {
      const isVisible = settingsSection.style.display !== 'none';
      settingsSection.style.display = isVisible ? 'none' : 'block';
    });
  }

  // Save API URL
  if (btnSaveApiUrl && apiUrlInput) {
    btnSaveApiUrl.addEventListener('click', async () => {
      const url = apiUrlInput.value.trim().replace(/\/+$/, '');
      if (url) {
        await chrome.storage.local.set({ apiUrl: url });
        currentApiBase = url;
        btnSaveApiUrl.innerText = 'Saved ✓';
        setTimeout(() => {
          btnSaveApiUrl.innerText = 'Save Server URL';
          settingsSection.style.display = 'none';
        }, 1200);
        checkActiveTab();
      }
    });
  }

  // Load auth state & API config
  function updateAuthState() {
    chrome.runtime.sendMessage({ action: 'GET_AUTH' }, (config) => {
      authLoading.style.display = 'none';
      if (config) {
        currentApiBase = config.apiUrl || 'http://localhost:5000';
        if (apiUrlInput) apiUrlInput.value = currentApiBase;

        if (config.user && config.token) {
          loggedInView.style.display = 'block';
          loggedOutView.style.display = 'none';
          userDisplayName.innerText = config.user.name;
          userDisplayEmail.innerText = `${config.user.email} (${config.user.role.toUpperCase()})`;
        } else {
          loggedInView.style.display = 'none';
          loggedOutView.style.display = 'block';
        }
      }
    });
  }

  updateAuthState();

  // Handle Login
  btnLogin.addEventListener('click', () => {
    loginError.style.display = 'none';
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
      loginError.innerText = 'Please enter email and password.';
      loginError.style.display = 'block';
      return;
    }

    btnLogin.disabled = true;
    btnLogin.innerText = 'Signing in...';

    chrome.runtime.sendMessage(
      { action: 'LOGIN', payload: { email, password } },
      (res) => {
        btnLogin.disabled = false;
        btnLogin.innerText = 'Sign In';
        if (res && res.error) {
          loginError.innerText = res.error;
          loginError.style.display = 'block';
        } else {
          updateAuthState();
          checkActiveTab();
        }
      }
    );
  });

  // Handle Logout
  btnLogout.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'LOGOUT' }, () => {
      updateAuthState();
      checkActiveTab();
    });
  });

  // Check active tab
  async function checkActiveTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url) {
        currentTabInfo.innerHTML = '<p style="color:#64748b; font-size:11px;">No active webpage detected.</p>';
        return;
      }

      currentTabInfo.innerHTML = '<p style="color:#64748b; font-size:11px;">Scanning tab for course metadata...</p>';

      chrome.runtime.sendMessage(
        {
          action: 'CHECK_COURSE',
          payload: { url: tab.url, title: tab.title || '' },
        },
        (res) => {
          if (!res) {
            currentTabInfo.innerHTML = '<p style="color:#64748b; font-size:11px;">Could not connect to CourseFinder API.</p>';
            return;
          }

          if (res.found && res.course) {
            const c = res.course;
            const statusBg =
              res.personalStatus === 'COMPLETED'
                ? '#ecfdf5; color: #065f46; border: 1px solid #a7f3d0'
                : res.personalStatus === 'IN_PROGRESS'
                ? '#fffbeb; color: #92400e; border: 1px solid #fde68a'
                : '#eff6ff; color: #1e40af; border: 1px solid #bfdbfe';

            currentTabInfo.innerHTML = `
              <div style="font-weight:600; color:#0f172a; margin-bottom:4px; font-size:12px;">${c.course_name}</div>
              <div style="display:flex; gap:6px; margin-bottom:8px;">
                <span class="pill pill-green">${c.duration} Hours</span>
                ${c.has_project ? '<span class="pill pill-amber">Project: Yes</span>' : '<span class="pill">No Project</span>'}
                <span class="pill pill-indigo">${c.platform}</span>
              </div>
              <div style="padding:6px 8px; border-radius:6px; font-weight:600; font-size:11px; text-align:center; background:${statusBg}">
                ${res.statusLabel}
              </div>
            `;
          } else {
            currentTabInfo.innerHTML = `
              <p style="color:#64748b; font-size:11px; margin-bottom:6px;">
                Not registered in CourseFinder library yet.
              </p>
              <div style="font-size:11px; color:#334155; font-weight:500; word-break:break-all;">
                ${tab.title || tab.url.substring(0, 40) + '...'}
              </div>
            `;
          }
        }
      );
    } catch (err) {
      currentTabInfo.innerHTML = `<p style="color:#ef4444; font-size:11px;">Error: ${err.message}</p>`;
    }
  }

  checkActiveTab();

  // Quick search
  let searchTimeout = null;
  quickSearchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const query = quickSearchInput.value.trim();

    if (!query) {
      quickSearchResults.innerHTML = '';
      return;
    }

    searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`${currentApiBase}/api/courses?search=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.courses && data.courses.length > 0) {
          quickSearchResults.innerHTML = data.courses.slice(0, 5).map((c) => `
            <div class="search-result-item">
              <a href="${c.course_link}" target="_blank" class="search-title">${c.course_name}</a>
              <div class="search-meta">
                <span class="pill ${c.duration >= 30 ? 'pill-indigo' : 'pill-green'}">${c.duration}h (${c.duration >= 30 ? '30+' : '20+'})</span>
                <span>${c.platform}</span>
                <span>${c.has_project ? '★ Project' : ''}</span>
              </div>
            </div>
          `).join('');
        } else {
          quickSearchResults.innerHTML = '<p style="font-size:11px; color:#94a3b8; padding:6px 0;">No matching courses found.</p>';
        }
      } catch {
        quickSearchResults.innerHTML = '<p style="font-size:11px; color:#ef4444; padding:6px 0;">Failed to search API.</p>';
      }
    }, 250);
  });
});
