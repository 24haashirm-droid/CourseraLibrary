// CourseFinder Content Script
(function () {
  // Avoid injecting multiple times
  if (window.__COURSEFINDER_INJECTED__) return;
  window.__COURSEFINDER_INJECTED__ = true;

  // Detect platform and course info
  function extractCourseInfo() {
    const url = window.location.href;
    const hostname = window.location.hostname.toLowerCase();

    let platform = 'Unknown';
    let title = '';

    if (hostname.includes('coursera.org')) {
      platform = 'Coursera';
      const h1 = document.querySelector('h1[data-e2e="hero-title"]') ||
                 document.querySelector('h1.banner-title') ||
                 document.querySelector('h1');
      title = h1 ? h1.innerText.trim() : document.title;
    } else if (hostname.includes('edx.org')) {
      platform = 'edX';
      const h1 = document.querySelector('h1.course-header') ||
                 document.querySelector('h1');
      title = h1 ? h1.innerText.trim() : document.title;
    } else if (hostname.includes('udemy.com')) {
      platform = 'Udemy';
      const h1 = document.querySelector('h1[data-purpose="lead-title"]') ||
                 document.querySelector('h1');
      title = h1 ? h1.innerText.trim() : document.title;
    } else {
      // Check for CourseFinder mock test page
      const mockMeta = document.querySelector('meta[name="coursefinder-mock-platform"]');
      if (mockMeta) {
        platform = mockMeta.getAttribute('content') || 'Coursera Mock';
        const h1 = document.querySelector('h1');
        title = h1 ? h1.innerText.trim() : document.title;
      } else {
        // Generic page detector: only activate if title or URL hints at a course
        const pageTitle = document.title || '';
        const h1 = document.querySelector('h1');
        const h1Text = h1 ? h1.innerText.trim() : '';

        if (url.includes('course') || url.includes('learn') || url.includes('specialization') || pageTitle.toLowerCase().includes('course')) {
          platform = 'Online Course';
          title = h1Text || pageTitle;
        }
      }
    }

    // Clean up title (remove " | Coursera", etc.)
    if (title) {
      title = title.replace(/\s*\|.*$/, '').replace(/\s*-.*$/, '').trim();
    }

    return { url, title, platform };
  }

  const courseInfo = extractCourseInfo();
  if (!courseInfo.title && !courseInfo.url.includes('course') && !document.querySelector('meta[name="coursefinder-mock-platform"]')) {
    return; // Not a course page
  }

  // Query background service worker for course status
  chrome.runtime.sendMessage(
    { action: 'CHECK_COURSE', payload: courseInfo },
    (response) => {
      if (!response) return;
      renderCourseFinderWidget(response, courseInfo);
    }
  );

  function renderCourseFinderWidget(data, info) {
    const existing = document.getElementById('coursefinder-floating-root');
    if (existing) existing.remove();

    const root = document.createElement('div');
    root.id = 'coursefinder-floating-root';

    let contentHtml = '';

    if (data.found && data.course) {
      const c = data.course;
      const isCompleted = data.personalStatus === 'COMPLETED';
      const isInProgress = data.personalStatus === 'IN_PROGRESS';
      const isNotCompleted = !isCompleted && !isInProgress;

      const statusBadgeClass = isCompleted
        ? 'cf-status-completed'
        : isInProgress
        ? 'cf-status-inprogress'
        : 'cf-status-notcompleted';

      const statusText = isCompleted
        ? 'Already Completed'
        : isInProgress
        ? 'Currently In Progress'
        : 'You can do this — Not Completed';

      const durBadge20 = data.eligible20Plus
        ? '<span class="cf-pill cf-pill-green">✓ 20+ Hours</span>'
        : '<span class="cf-pill cf-pill-gray">< 20 Hours</span>';

      const durBadge30 = data.eligible30Plus
        ? '<span class="cf-pill cf-pill-indigo">✓ 30+ Hours</span>'
        : '';

      const projectBadge = data.hasProject
        ? '<span class="cf-pill cf-pill-amber">★ Project Included</span>'
        : '<span class="cf-pill cf-pill-gray">No Project</span>';

      contentHtml = `
        <div class="cf-card-header">
          <div class="cf-brand">
            <span class="cf-icon">🎯</span>
            <span class="cf-brand-name">CourseFinder</span>
          </div>
          <div class="cf-controls">
            <button class="cf-btn-icon" id="cf-minimize-btn" title="Minimize">−</button>
            <button class="cf-btn-icon" id="cf-close-btn" title="Close">×</button>
          </div>
        </div>

        <div class="cf-card-body" id="cf-body">
          <div class="cf-course-title" title="${c.course_name}">${c.course_name}</div>
          <div class="cf-meta-row">
            <span class="cf-platform">${c.platform}</span>
            <span class="cf-duration">⏱ ${c.duration} Hours Total</span>
          </div>

          <div class="cf-pill-group">
            ${durBadge20}
            ${durBadge30}
            ${projectBadge}
          </div>

          <div class="cf-status-box ${statusBadgeClass}">
            <div class="cf-status-label-heading">Your Academic Status:</div>
            <div class="cf-status-display">${statusText}</div>
          </div>

          <div class="cf-actions">
            <div class="cf-actions-title">Update Your Status:</div>
            <div class="cf-btn-grid">
              <button class="cf-btn cf-btn-sm ${isNotCompleted ? 'cf-btn-active' : ''}" id="cf-set-not-completed">
                Not Completed
              </button>
              <button class="cf-btn cf-btn-sm ${isInProgress ? 'cf-btn-active' : ''}" id="cf-set-in-progress">
                In Progress
              </button>
              <button class="cf-btn cf-btn-sm ${isCompleted ? 'cf-btn-active' : ''}" id="cf-set-completed">
                Completed
              </button>
            </div>
          </div>

          <div class="cf-footer">
            <a href="${location.origin}" target="_blank" class="cf-link">
              Open in CourseFinder Library →
            </a>
          </div>
        </div>
      `;
    } else {
      // Course not found
      contentHtml = `
        <div class="cf-card-header">
          <div class="cf-brand">
            <span class="cf-icon">🎯</span>
            <span class="cf-brand-name">CourseFinder</span>
          </div>
          <div class="cf-controls">
            <button class="cf-btn-icon" id="cf-minimize-btn" title="Minimize">−</button>
            <button class="cf-btn-icon" id="cf-close-btn" title="Close">×</button>
          </div>
        </div>

        <div class="cf-card-body" id="cf-body">
          <div class="cf-course-title">${info.title || 'Course Page'}</div>
          <p class="cf-not-found-text">
            This course is not yet in the CourseFinder global library.
          </p>

          <button class="cf-btn cf-btn-primary" id="cf-submit-course-btn">
            + Quick Submit to CourseFinder
          </button>

          <div id="cf-submit-msg" class="cf-msg-box" style="display:none;"></div>

          <div class="cf-footer">
            <a href="${location.origin}" target="_blank" class="cf-link">
              Browse Global Course Library →
            </a>
          </div>
        </div>
      `;
    }

    root.innerHTML = contentHtml;
    document.body.appendChild(root);

    // Event handlers
    const closeBtn = root.querySelector('#cf-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => root.remove();
    }

    const minBtn = root.querySelector('#cf-minimize-btn');
    const body = root.querySelector('#cf-body');
    if (minBtn && body) {
      minBtn.onclick = () => {
        if (body.style.display === 'none') {
          body.style.display = 'block';
          minBtn.innerText = '−';
        } else {
          body.style.display = 'none';
          minBtn.innerText = '+';
        }
      };
    }

    // Status updater buttons
    if (data.found && data.course) {
      const setStatus = (statusName) => {
        chrome.runtime.sendMessage(
          {
            action: 'UPDATE_STATUS',
            payload: { course_id: data.course.id, status: statusName },
          },
          (res) => {
            if (res && res.error) {
              alert(res.error);
            } else {
              // Re-check to update UI
              chrome.runtime.sendMessage(
                { action: 'CHECK_COURSE', payload: info },
                (updated) => {
                  if (updated) renderCourseFinderWidget(updated, info);
                }
              );
            }
          }
        );
      };

      const btnNotCompleted = root.querySelector('#cf-set-not-completed');
      const btnInProgress = root.querySelector('#cf-set-in-progress');
      const btnCompleted = root.querySelector('#cf-set-completed');

      if (btnNotCompleted) btnNotCompleted.onclick = () => setStatus('NOT_COMPLETED');
      if (btnInProgress) btnInProgress.onclick = () => setStatus('IN_PROGRESS');
      if (btnCompleted) btnCompleted.onclick = () => setStatus('COMPLETED');
    }

    // Quick submit button
    const submitBtn = root.querySelector('#cf-submit-course-btn');
    if (submitBtn) {
      submitBtn.onclick = () => {
        const estDuration = prompt('Enter estimated course duration in hours (e.g. 30):', '30');
        if (!estDuration) return;

        const hasProj = confirm('Does this course include a practical project / capstone? (Click OK for Yes, Cancel for No)');

        chrome.runtime.sendMessage(
          {
            action: 'QUICK_SUBMIT',
            payload: {
              course_name: info.title || 'Discovered Course',
              platform: info.platform || 'Online',
              course_link: info.url,
              duration: parseInt(estDuration) || 20,
              has_project: hasProj ? 1 : 0,
            },
          },
          (res) => {
            const msgBox = root.querySelector('#cf-submit-msg');
            if (msgBox) {
              msgBox.style.display = 'block';
              if (res && res.error) {
                msgBox.className = 'cf-msg-box cf-msg-error';
                msgBox.innerText = res.error;
              } else {
                msgBox.className = 'cf-msg-box cf-msg-success';
                msgBox.innerText = 'Submitted! Administrator will review it soon.';
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.5';
              }
            }
          }
        );
      };
    }
  }
})();
