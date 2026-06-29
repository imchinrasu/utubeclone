const searchInput = document.getElementById('search');
const searchButton = document.getElementById('searchButton');
const homeButton = document.getElementById('homeButton');
const shortsButton = document.getElementById('shortsButton');
const subscriptionsButton = document.getElementById('subscriptionsButton');
const profileButton = document.getElementById('profileButton');
const userStatus = document.getElementById('userStatus');
const searchMessage = document.getElementById('searchMessage');
const videoCards = Array.from(document.querySelectorAll('.video-card'));
const navButtons = [homeButton, shortsButton, subscriptionsButton, profileButton];

const authForm = document.getElementById('authForm');
const authId = document.getElementById('authId');
const authPassword = document.getElementById('authPassword');
const authConfirmRow = document.getElementById('authConfirmRow');
const authConfirmPassword = document.getElementById('authConfirmPassword');
const authSubmit = document.getElementById('authSubmit');
const authNote = document.getElementById('authNote');
const loginMessage = document.getElementById('loginMessage');
const loginOverlay = document.getElementById('loginOverlay');
const loginCloseButton = document.getElementById('loginCloseButton');
const authTabs = Array.from(document.querySelectorAll('.auth-tab'));
const accountPanel = document.getElementById('accountPanel');
const authInfo = document.getElementById('authInfo');
const showUpdatePassword = document.getElementById('showUpdatePassword');
const deleteAccountButton = document.getElementById('deleteAccountButton');
const logoutButton = document.getElementById('logoutButton');

let authMode = 'signin';
const credentialBackend = new CredentialBackend();

function updateSearchMessage(message) {
  searchMessage.textContent = message;
}

async function seedUsersFromJson() {
  await credentialBackend.init();
}

function getCurrentUser() {
  return credentialBackend.getCurrentUser();
}

function setCurrentUser(userId) {
  credentialBackend.setCurrentUser(userId);
}

function clearCurrentUser() {
  credentialBackend.clearCurrentUser();
}

function updateUserStatus() {
  const currentUser = getCurrentUser();
  userStatus.textContent = currentUser ? `Signed in as ${currentUser}` : 'Not signed in';
}

function clearActive() {
  navButtons.forEach(button => button.classList.remove('active'));
}

function setActive(button) {
  clearActive();
  button.classList.add('active');
}

function showAllVideos() {
  videoCards.forEach(card => {
    card.style.display = '';
  });
}

function showCategory(category) {
  let matchCount = 0;

  videoCards.forEach(card => {
    const cardCategory = (card.dataset.category || 'main').toLowerCase();
    const match = cardCategory === category;

    card.style.display = match ? '' : 'none';
    if (match) matchCount += 1;
  });

  return matchCount;
}

function isAuthenticated() {
  return Boolean(getCurrentUser());
}

function gateHomepage() {
  const page = document.querySelector('.page');
  if (!isAuthenticated()) {
    page.classList.add('blocked');
    openLoginOverlay();
  } else {
    page.classList.remove('blocked');
  }
}

function showAuthMode(mode) {
  authMode = mode;
  authTabs.forEach(tab => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  if (mode === 'signin') {
    authConfirmRow.classList.add('hidden');
    authSubmit.textContent = 'Sign in';
    authNote.textContent = 'Use your credentials to sign in.';
  } else {
    authConfirmRow.classList.remove('hidden');
    authSubmit.textContent = 'Create account';
    authNote.textContent = 'Create a new account with matching password confirmation.';
  }

  loginMessage.textContent = '';
  authForm.reset();
}

function showAccountPanel(userId) {
  accountPanel.classList.remove('hidden');
  authInfo.textContent = `Signed in as ${userId}`;
  authForm.classList.add('hidden');
  document.getElementById('loginOverlayTitle').textContent = 'Account settings';
}

function hideAccountPanel() {
  accountPanel.classList.add('hidden');
  authForm.classList.remove('hidden');
  document.getElementById('loginOverlayTitle').textContent = 'MyTube account';
}

function refreshAuthUI() {
  updateUserStatus();
  const currentUser = getCurrentUser();
  if (currentUser) {
    showAccountPanel(currentUser);
  } else {
    hideAccountPanel();
    showAuthMode('signin');
  }
}

function filterVideos(query) {
  const normalizedQuery = query.toLowerCase();
  let matchCount = 0;

  videoCards.forEach(card => {
    const title = card.dataset.title.toLowerCase();
    const channel = card.dataset.channel.toLowerCase();
    const match = title.includes(normalizedQuery) || channel.includes(normalizedQuery);

    card.style.display = match ? '' : 'none';
    if (match) matchCount += 1;
  });

  return matchCount;
}

function searchVideos() {
  clearActive();
  const value = searchInput.value.trim();

  if (!value) {
    showAllVideos();
    updateSearchMessage('Showing all videos.');
    return;
  }

  const resultCount = filterVideos(value);
  if (resultCount > 0) {
    updateSearchMessage(`Showing ${resultCount} video${resultCount === 1 ? '' : 's'} for: ${value}`);
  } else {
    updateSearchMessage(`No matching videos found for: ${value}`);
  }
}

searchButton.addEventListener('click', searchVideos);
searchInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchVideos();
  }
});

authTabs.forEach(tab => {
  tab.addEventListener('click', () => showAuthMode(tab.dataset.mode));
});

authForm.addEventListener('submit', async event => {
  event.preventDefault();
  const idValue = authId.value.trim();
  const passwordValue = authPassword.value.trim();
  const confirmValue = authConfirmPassword.value.trim();

  if (!idValue || !passwordValue) {
    loginMessage.textContent = 'Please enter an ID and password.';
    return;
  }

  if (authMode === 'signin') {
    const result = await credentialBackend.signIn(idValue, passwordValue);
    loginMessage.textContent = result.message;
    if (result.ok) {
      refreshAuthUI();
      setTimeout(closeLoginOverlay, 1200);
    }
  } else {
    if (!confirmValue) {
      loginMessage.textContent = 'Please confirm your password.';
      return;
    }

    if (passwordValue !== confirmValue) {
      loginMessage.textContent = 'Passwords do not match.';
      return;
    }

    const result = await credentialBackend.signUp(idValue, passwordValue);
    loginMessage.textContent = result.message;
    if (result.ok) {
      refreshAuthUI();
      setTimeout(closeLoginOverlay, 1200);
    }
  }
});

showUpdatePassword.addEventListener('click', async () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const newPassword = prompt('Enter a new password for your account:');
  if (newPassword === null) return;

  const trimmedPassword = String(newPassword).trim();
  if (!trimmedPassword) {
    alert('Password cannot be blank.');
    return;
  }

  const result = await credentialBackend.updatePassword(currentUser, trimmedPassword);
  alert(result.message);
});

deleteAccountButton.addEventListener('click', async () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const confirmed = confirm(`Delete account ${currentUser}? This cannot be undone.`);
  if (!confirmed) return;

  const result = await credentialBackend.deleteAccount(currentUser);
  loginMessage.textContent = result.message;
  refreshAuthUI();
});

logoutButton.addEventListener('click', async () => {
  const result = await credentialBackend.logout();
  loginMessage.textContent = result.message;
  refreshAuthUI();
});

homeButton.addEventListener('click', () => {
  showAllVideos();
  setActive(homeButton);
  document.getElementById('videoSection').classList.remove('hidden');
  document.getElementById('channelSection').classList.add('hidden');
  document.querySelector('.main').classList.remove('shorts-mode');
  updateSearchMessage('Showing all videos.');
});

shortsButton.addEventListener('click', () => {
  const resultCount = showCategory('shorts');
  setActive(shortsButton);
  document.getElementById('videoSection').classList.remove('hidden');
  document.getElementById('channelSection').classList.add('hidden');
  document.querySelector('.main').classList.add('shorts-mode');
  updateSearchMessage(resultCount > 0 ? `Showing ${resultCount} Shorts.` : 'No Shorts available.');
});

subscriptionsButton.addEventListener('click', () => {
  setActive(subscriptionsButton);
  document.getElementById('videoSection').classList.add('hidden');
  document.getElementById('channelSection').classList.remove('hidden');
  document.querySelector('.main').classList.remove('shorts-mode');
  updateSearchMessage('Showing subscribed channels.');
});

profileButton.addEventListener('click', () => {
  clearActive();
  setActive(profileButton);
  openLoginOverlay();
});

const videoPlayerOverlay = document.getElementById('videoPlayerOverlay');
const videoPlayer = document.getElementById('videoPlayer');
const videoPlayerTitle = document.getElementById('videoPlayerTitle');
const videoCloseButton = document.getElementById('videoCloseButton');

function openLoginOverlay() {
  loginMessage.textContent = '';
  authForm.reset();
  refreshAuthUI();
  loginOverlay.classList.remove('hidden');
}

function closeLoginOverlay() {
  loginOverlay.classList.add('hidden');
  gateHomepage();
}

loginCloseButton.addEventListener('click', closeLoginOverlay);
loginOverlay.addEventListener('click', event => {
  if (event.target === loginOverlay) {
    closeLoginOverlay();
  }
});

function openVideoPlayer(title) {
  videoPlayerTitle.textContent = `Playing: ${title}`;
  videoPlayer.currentTime = 0;
  videoPlayer.play().catch(() => {
    /* autoplay may be blocked; user can press play */
  });
  videoPlayerOverlay.classList.remove('hidden');
}

function closeVideoPlayer() {
  videoPlayer.pause();
  videoPlayerOverlay.classList.add('hidden');
}

videoCards.forEach(card => {
  card.addEventListener('click', () => {
    openVideoPlayer(card.dataset.title || 'Video');
  });
});

videoCloseButton.addEventListener('click', closeVideoPlayer);
videoPlayerOverlay.addEventListener('click', event => {
  if (event.target === videoPlayerOverlay) {
    closeVideoPlayer();
  }
});

async function initApp() {
  await seedUsersFromJson();
  updateSearchMessage('Showing all videos.');
  refreshAuthUI();
  gateHomepage();
}

initApp();
