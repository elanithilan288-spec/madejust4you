"use strict";

/* ==========================================================
   RITHIKA BIRTHDAY EXPERIENCE
   One state flow. One listener per interactive control.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------------------------------------
  // SCREEN MANAGEMENT
  // --------------------------------------------------------
  const screens = Array.from(document.querySelectorAll(".screen"));
  let activeScreen = document.querySelector(".screen.active");

  function showScreen(screenId) {
    const nextScreen = document.getElementById(screenId);
    if (!nextScreen || nextScreen === activeScreen) return;

    const previousScreen = activeScreen;
    if (previousScreen) {
      previousScreen.classList.remove("active");
      previousScreen.classList.add("exit");
    }

    nextScreen.classList.remove("exit");
    nextScreen.classList.add("active");
    activeScreen = nextScreen;

    window.scrollTo({ top: 0, behavior: "auto" });
  }

  screens.forEach((screen) => {
    if (screen.id !== activeScreen?.id) {
      screen.classList.remove("active", "exit");
    }
  });

  // --------------------------------------------------------
  // PASSWORD SCREEN
  // --------------------------------------------------------
  const correctPassword = "11092008";
  const enteredDigits = [];
  const pinDots = Array.from(document.querySelectorAll(".pin-dot"));
  const passwordStatus = document.getElementById("passwordStatus");
  const keypad = document.getElementById("keypad");
  const unlockBtn = document.getElementById("unlockBtn");

  function renderPasswordDots() {
    pinDots.forEach((dot, index) => {
      dot.classList.toggle("filled", index < enteredDigits.length);
    });
  }

  function setPasswordStatus(message, isError = false) {
    passwordStatus.textContent = message;
    passwordStatus.classList.toggle("error", isError);
    if (isError) {
      window.setTimeout(() => passwordStatus.classList.remove("error"), 360);
    }
  }

  function clearPassword() {
    enteredDigits.length = 0;
    renderPasswordDots();
  }

  function addDigit(digit) {
    if (enteredDigits.length >= correctPassword.length) return;
    enteredDigits.push(String(digit));
    renderPasswordDots();
    setPasswordStatus("");

    if (enteredDigits.length === correctPassword.length) {
      checkPassword();
    }
  }

  function deleteDigit() {
    if (enteredDigits.length === 0) return;
    enteredDigits.pop();
    renderPasswordDots();
    setPasswordStatus("");
  }

  function checkPassword() {
    const attempt = enteredDigits.join("");
    if (attempt === correctPassword) {
      setPasswordStatus("Unlocked ✨");
      window.setTimeout(() => showScreen("openingScreen"), 520);
      return;
    }

    setPasswordStatus("Aiyo... not that one. Think again 🐶", true);
    window.setTimeout(clearPassword, 240);
  }

  keypad.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const digit = button.dataset.key;
    const action = button.dataset.action;

    if (digit !== undefined) {
      addDigit(digit);
      return;
    }

    if (action === "clear") {
      clearPassword();
      setPasswordStatus("");
      return;
    }

    if (action === "delete") {
      deleteDigit();
    }
  });

  unlockBtn.addEventListener("click", checkPassword);

  // --------------------------------------------------------
  // OPENING SCREEN
  // --------------------------------------------------------
  document.getElementById("openingEnterBtn").addEventListener("click", () => {
    showScreen("paakanumaScreen");
  });

  // --------------------------------------------------------
  // PAAKANUMA SCREEN
  // Robust NO-button movement inside the actual container.
  // --------------------------------------------------------
  const choiceArea = document.getElementById("choiceArea");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const teaseCounter = document.getElementById("teaseCounter");
  const questionSubtext = document.getElementById("questionSubtext");
  let noClickCount = 0;
  let yesScale = 1;
  let lastNoPosition = { x: null, y: null };

  const teaseLines = [
    "Seri... NO try pannalaam. 😌",
    "Athu vera button-ku romba confidence. 😂",
    "Innum oru thadava? You are persistent. 👀",
    "Button-a pidikka mudiyala pola. 😂",
    "Okay, the website itself is saying YES. ✨"
  ];

  function rectsOverlap(a, b, padding = 10) {
    return !(
      a.right + padding <= b.left ||
      a.left - padding >= b.right ||
      a.bottom + padding <= b.top ||
      a.top - padding >= b.bottom
    );
  }

  function moveNoButton() {
    const areaWidth = choiceArea.clientWidth;
    const areaHeight = choiceArea.clientHeight;
    const noWidth = noBtn.offsetWidth;
    const noHeight = noBtn.offsetHeight;
    const yesWidth = yesBtn.offsetWidth;
    const yesHeight = yesBtn.offsetHeight;

    const safePad = 12;
    const maxX = Math.max(safePad, areaWidth - noWidth - safePad);
    const maxY = Math.max(safePad, areaHeight - noHeight - safePad);

    const yesLeft = yesBtn.offsetLeft;
    const yesTop = yesBtn.offsetTop;
    const yesRect = {
      left: yesLeft,
      top: yesTop,
      right: yesLeft + yesWidth,
      bottom: yesTop + yesHeight
    };

    const candidates = [];
    const gridSteps = 7;

    for (let xi = 0; xi <= gridSteps; xi += 1) {
      for (let yi = 0; yi <= gridSteps; yi += 1) {
        const x = Math.round(safePad + ((maxX - safePad) * xi) / gridSteps);
        const y = Math.round(safePad + ((maxY - safePad) * yi) / gridSteps);
        candidates.push({ x, y });
      }
    }

    // Shuffle candidates to make movement feel less predictable.
    for (let i = candidates.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const validCandidates = candidates.filter(({ x, y }) => {
      const noRect = { left: x, top: y, right: x + noWidth, bottom: y + noHeight };
      const sameSpot = lastNoPosition.x === x && lastNoPosition.y === y;
      return !sameSpot && !rectsOverlap(noRect, yesRect, 12);
    });

    const chosen = validCandidates[0] || candidates.find(({ x, y }) => {
      const noRect = { left: x, top: y, right: x + noWidth, bottom: y + noHeight };
      return !rectsOverlap(noRect, yesRect, 4);
    }) || { x: safePad, y: safePad };

    noBtn.style.left = `${chosen.x}px`;
    noBtn.style.top = `${chosen.y}px`;
    noBtn.style.transform = "none";
    lastNoPosition = chosen;
  }

  function growYesButton() {
    yesScale = Math.min(1.32, yesScale + 0.06);
    yesBtn.style.transform = `translate(-112%, -50%) scale(${yesScale})`;
  }

  noBtn.addEventListener("click", () => {
    noClickCount += 1;
    growYesButton();
    moveNoButton();
    teaseCounter.textContent = `NO clicks: ${noClickCount}`;
    questionSubtext.textContent = teaseLines[Math.min(noClickCount - 1, teaseLines.length - 1)];
  });

  yesBtn.addEventListener("click", () => {
    showScreen("introScreen");
  });

  window.addEventListener("resize", () => {
    if (activeScreen?.id === "paakanumaScreen" && noClickCount > 0) {
      moveNoButton();
    }
  });

  // --------------------------------------------------------
  // BIRTHDAY INTRO
  // --------------------------------------------------------
  document.getElementById("celebrateBtn").addEventListener("click", () => {
    showScreen("cakeScreen");
  });

  // --------------------------------------------------------
  // CAKE SCREEN
  // One click = exactly one candle.
  // --------------------------------------------------------
  const candles = Array.from(document.querySelectorAll(".candle"));
  const wishBtn = document.getElementById("wishBtn");
  const cutCakeBtn = document.getElementById("cutCakeBtn");
  const candleCounter = document.getElementById("candleCounter");
  let extinguishedCount = 0;
  let wishLocked = false;

  function updateCandleCounter() {
    const remaining = candles.length - extinguishedCount;
    if (remaining === 0) {
      candleCounter.textContent = "All candles blown out ✨";
      wishBtn.disabled = true;
      wishBtn.style.opacity = "0.58";
      cutCakeBtn.classList.remove("hidden");
      return;
    }

    candleCounter.textContent = `${remaining} candle${remaining === 1 ? "" : "s"} left`;
  }

  function extinguishNextCandle() {
    if (wishLocked || extinguishedCount >= candles.length) return;

    wishLocked = true;
    const currentIndex = extinguishedCount;
    const currentCandle = candles[currentIndex];
    if (!currentCandle) {
      wishLocked = false;
      return;
    }

    currentCandle.classList.add("flame-out");
    extinguishedCount += 1;
    updateCandleCounter();

    window.setTimeout(() => {
      wishLocked = false;
    }, 330);
  }

  wishBtn.addEventListener("click", extinguishNextCandle);

  cutCakeBtn.addEventListener("click", () => {
    if (extinguishedCount < candles.length) return;

    cutCakeBtn.disabled = true;
    cakeScreenCelebrationPrep();
    window.setTimeout(() => showScreen("grandScreen"), 550);
  });

  function cakeScreenCelebrationPrep() {
    const cakeStage = document.getElementById("cakeStage");
    cakeStage.animate(
      [
        { transform: "scale(1) rotate(0deg)", opacity: 1 },
        { transform: "scale(1.05) rotate(-1deg)", opacity: 1 },
        { transform: "scale(0.3) rotate(6deg)", opacity: 0 }
      ],
      { duration: 500, easing: "ease-in" }
    );
  }

  // --------------------------------------------------------
  // GRAND BIRTHDAY
  // --------------------------------------------------------
  const confettiCloud = document.getElementById("confettiCloud");
  let confettiStarted = false;

  function createConfetti() {
    if (confettiStarted) return;
    confettiStarted = true;

    const fragment = document.createDocumentFragment();
    const pieces = 46;

    for (let i = 0; i < pieces; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.setProperty("--drift-x", `${Math.round((Math.random() - 0.5) * 180)}px`);
      piece.style.setProperty("--spin", `${Math.round((Math.random() - 0.5) * 820)}deg`);
      piece.style.animationDuration = `${3.8 + Math.random() * 3.2}s`;
      piece.style.animationDelay = `${Math.random() * 1.6}s`;
      piece.style.width = `${6 + Math.random() * 5}px`;
      piece.style.height = `${10 + Math.random() * 9}px`;
      piece.style.background = `hsl(${Math.floor(Math.random() * 360)} 88% ${62 + Math.floor(Math.random() * 20)}%)`;
      fragment.appendChild(piece);
    }

    confettiCloud.appendChild(fragment);
  }

  document.getElementById("grandNextBtn").addEventListener("click", () => {
    showScreen("photoScreen");
  });

  // --------------------------------------------------------
  // PHOTO MEMORIES
  // Edit the message strings here later.
  // Replace only photo1.jpg ... photo5.jpg in /images.
  // --------------------------------------------------------
  const photoItems = [
    {
      src: "images/photo1.jpg",
      message: "ലോകത്ത് ഏഴ് അത്ഭുതങ്ങളുണ്ടെന്നാണ് പറയുന്നത്...\nപക്ഷേ എനിക്കത് ഒമ്പതാണ്;\nകാരണം ബാക്കിയുള്ള രണ്ടെണ്ണം നിന്റെ കണ്ണുകളാണ്"
    },
    {
      src: "images/photo2.jpg",
      message: "The moon wishes it had your glow,\nthe stars wish they had your light,\nand I just wish... you could see yourself through my eyes."
    },
    {
      src: "images/photo3.jpg",
      message: "Un pechu anga irukura amaithia neraputhu,aana unna sirikka vaika en manasu thudikkuthu"
    },
    {
      src: "images/photo4.jpg",
      message: "Je veux être le reflet dans tes yeux, pour habiter le lieu où commence ta beauté"
    },
    {
      src: "images/photo5.jpg",
      message: "பெண்ணே நீ மௌன விரதம் இருந்தால், முதலில் உன் கண்களை மூடிக்கொள். உன் உதடுகளை விட, உன் கண்கள் தான் அதிகம் பேசுகின்றன."
    }
  ];

  const photoCard = document.getElementById("photoCard");
  const memoryImage = document.getElementById("memoryImage");
  const photoIndex = document.getElementById("photoIndex");
  const photoMessage = document.getElementById("photoMessage");
  const nextPhotoBtn = document.getElementById("nextPhotoBtn");
  let currentPhotoIndex = 0;
  let photoTransitionLocked = false;

  function renderPhoto(index) {
    const item = photoItems[index];
    memoryImage.src = item.src;
    memoryImage.alt = `Rithika photo ${index + 1}`;
    photoIndex.textContent = `${index + 1} / ${photoItems.length}`;
    photoMessage.textContent = item.message;
    photoMessage.style.whiteSpace = "pre-line";

    if (index === photoItems.length - 1) {
      nextPhotoBtn.textContent = "Open the last letter →";
    } else {
      nextPhotoBtn.textContent = "Another blessing for eyes →";
    }
  }

  function advancePhoto() {
    if (photoTransitionLocked) return;

    if (currentPhotoIndex >= photoItems.length - 1) {
      showScreen("letterScreen");
      return;
    }

    photoTransitionLocked = true;
    photoCard.classList.remove("swap-in");
    photoCard.classList.add("swap-out");

    window.setTimeout(() => {
      currentPhotoIndex += 1;
      renderPhoto(currentPhotoIndex);
      photoCard.classList.remove("swap-out");
      photoCard.classList.add("swap-in");
      photoTransitionLocked = false;
    }, 250);
  }

  nextPhotoBtn.addEventListener("click", advancePhoto);
  renderPhoto(currentPhotoIndex);

  // --------------------------------------------------------
  // REPLAY ALL
  // A fresh page load resets every part of the experience.
  // --------------------------------------------------------
  document.getElementById("replayBtn").addEventListener("click", () => {
    window.location.reload();
  });

  // --------------------------------------------------------
  // IMAGE FALLBACKS
  // Keeps the layout beautiful even before real photos are added.
  // Once you add the real JPG files, these fallback visuals won't run.
  // --------------------------------------------------------
  const passwordPhoto = document.getElementById("passwordPhoto");
  passwordPhoto.addEventListener("error", () => {
    passwordPhoto.alt = "Add images/password.jpg for the framed portrait";
    passwordPhoto.src = createPlaceholderDataUri("Your Photo", "Add password.jpg");
  });

  memoryImage.addEventListener("error", () => {
    memoryImage.alt = `Add ${photoItems[currentPhotoIndex].src}`;
    memoryImage.src = createPlaceholderDataUri("Your Photo", `photo${currentPhotoIndex + 1}.jpg`);
  });

  function createPlaceholderDataUri(title, subtitle) {
    const safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeSubtitle = subtitle.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffd1e5"/>
            <stop offset="55%" stop-color="#d6c7ff"/>
            <stop offset="100%" stop-color="#f7e6b3"/>
          </linearGradient>
        </defs>
        <rect width="600" height="760" rx="36" fill="url(#g)"/>
        <circle cx="300" cy="285" r="92" fill="rgba(255,255,255,.5)"/>
        <path d="M162 535c35-78 97-118 138-118s103 40 138 118v54H162z" fill="rgba(255,255,255,.48)"/>
        <text x="300" y="636" fill="#5b4968" text-anchor="middle" font-size="44" font-family="Georgia,serif">${safeTitle}</text>
        <text x="300" y="679" fill="#6f607f" text-anchor="middle" font-size="20" font-family="Arial,sans-serif">${safeSubtitle}</text>
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  // Start the celebration visuals as soon as the grand screen becomes active.
  const grandScreen = document.getElementById("grandScreen");
  const grandObserver = new MutationObserver(() => {
    if (grandScreen.classList.contains("active")) {
      createConfetti();
    }
  });
  grandObserver.observe(grandScreen, { attributes: true, attributeFilter: ["class"] });

  // Prevent accidental text selection on fast repeated keypad/game touches.
  document.addEventListener("selectstart", (event) => {
    if (event.target.closest("button")) event.preventDefault();
  });
});
