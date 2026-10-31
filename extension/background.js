const DEFAULT_API_BASE = ''; // Use relative URL when deployed

// Retrieve stored API config or return default
async function getApiConfig() {
  const data = await chrome.storage.local.get(['apiUrl', 'authToken', 'currentUser']);
  return {
    apiUrl: data.apiUrl || DEFAULT_API_BASE,
    token: data.authToken || null,
    user: data.currentUser || null,
  };
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'CHECK_COURSE') {
    handleCheckCourse(request.payload, sender.tab?.id)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'UPDATE_STATUS') {
    handleUpdateStatus(request.payload)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (request.action === 'QUICK_SUBMIT') {
    handleQuickSubmit(request.payload)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (request.action === 'GET_AUTH') {
    getApiConfig().then(sendResponse);
    return true;
  }

  if (request.action === 'LOGIN') {
    handleLogin(request.payload)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (request.action === 'LOGOUT') {
    chrome.storage.local.remove(['authToken', 'currentUser'], () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

async function handleCheckCourse(payload, tabId) {
  const { apiUrl, token } = await getApiConfig();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${apiUrl}/api/extension/match`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // Update extension badge icon if on an active tab
    if (tabId && data.found) {
      const dur = data.course?.duration;
      const badgeText = dur ? `${dur}h` : 'CF';
      chrome.action.setBadgeText({ tabId, text: badgeText });
      chrome.action.setBadgeBackgroundColor({
        tabId,
        color: data.personalStatus === 'COMPLETED' ? '#10B981' : data.personalStatus === 'IN_PROGRESS' ? '#F59E0B' : '#6366F1',
      });
    }

    return data;
  } catch (err) {
    return {
      found: false,
      error: 'Cannot connect to CourseFinder API. Make sure the CourseFinder server is running on ' + apiUrl,
    };
  }
}

async function handleUpdateStatus(payload) {
  const { apiUrl, token } = await getApiConfig();
  if (!token) {
    return { error: 'Please log in via the CourseFinder extension popup first to update status.' };
  }

  const res = await fetch(`${apiUrl}/api/extension/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return await res.json();
}

async function handleQuickSubmit(payload) {
  const { apiUrl, token } = await getApiConfig();
  if (!token) {
    return { error: 'Please log in to submit courses.' };
  }

  const res = await fetch(`${apiUrl}/api/extension/quick-submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return await res.json();
}

async function handleLogin(credentials) {
  const { apiUrl } = await getApiConfig();
  const res = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();
  if (res.ok && data.token) {
    await chrome.storage.local.set({
      authToken: data.token,
      currentUser: data.user,
    });
    return { success: true, user: data.user };
  } else {
    return { error: data.message || 'Login failed.' };
  }
}
