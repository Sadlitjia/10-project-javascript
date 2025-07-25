// Password Generator Class
class EnigmaticPasswordGenerator {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateLengthDisplay();
  }

  bindEvents() {
    // Length slider
    const lengthSlider = document.getElementById("length");
    lengthSlider.addEventListener("input", () => this.updateLengthDisplay());

    // Generate button
    const generateBtn = document.getElementById("generateBtn");
    generateBtn.addEventListener("click", () => this.generatePassword());

    // Copy button
    const copyBtn = document.getElementById("copyBtn");
    copyBtn.addEventListener("click", () => this.copyToClipboard());

    // Checkbox changes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => this.validateOptions());
    });

    // Generate password on Enter key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.generatePassword();
      }
    });
  }

  updateLengthDisplay() {
    const lengthSlider = document.getElementById("length");
    const lengthValue = document.getElementById("lengthValue");
    lengthValue.textContent = lengthSlider.value;
  }

  validateOptions() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const anyChecked = Array.from(checkboxes).some((cb) => cb.checked);

    if (!anyChecked) {
      // Automatically check lowercase if no options are selected
      document.getElementById("lowercase").checked = true;
    }
  }

  generatePassword() {
    const length = parseInt(document.getElementById("length").value);
    const includeUppercase = document.getElementById("uppercase").checked;
    const includeLowercase = document.getElementById("lowercase").checked;
    const includeNumbers = document.getElementById("numbers").checked;
    const includeSymbols = document.getElementById("symbols").checked;

    // Character sets
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let availableChars = "";
    let requiredChars = "";

    // Build character set and ensure at least one character from each selected type
    if (includeUppercase) {
      availableChars += uppercase;
      requiredChars += this.getRandomChar(uppercase);
    }
    if (includeLowercase) {
      availableChars += lowercase;
      requiredChars += this.getRandomChar(lowercase);
    }
    if (includeNumbers) {
      availableChars += numbers;
      requiredChars += this.getRandomChar(numbers);
    }
    if (includeSymbols) {
      availableChars += symbols;
      requiredChars += this.getRandomChar(symbols);
    }

    if (availableChars === "") {
      this.showError("Please select at least one character type");
      return;
    }

    // Generate password
    let password = requiredChars;

    // Fill remaining length with random characters
    for (let i = password.length; i < length; i++) {
      password += this.getRandomChar(availableChars);
    }

    // Shuffle the password to avoid predictable patterns
    password = this.shuffleString(password);

    // Display the password
    const passwordResult = document.getElementById("passwordResult");
    passwordResult.value = password;

    // Update strength meter
    this.updateStrengthMeter(password);

    // Add generation animation
    this.animateGeneration();
  }

  getRandomChar(str) {
    return str.charAt(Math.floor(Math.random() * str.length));
  }

  shuffleString(str) {
    const arr = str.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join("");
  }

  updateStrengthMeter(password) {
    const strengthIndicator = document.getElementById("strengthIndicator");
    const strengthText = document.getElementById("strengthText");

    const strength = this.calculatePasswordStrength(password);

    // Remove existing strength classes
    strengthIndicator.className = "strength-fill";
    strengthText.className = "strength-text";

    let strengthClass, strengthTextContent, strengthWidth;

    if (strength < 30) {
      strengthClass = "strength-weak";
      strengthTextContent = "Weak";
      strengthWidth = "25%";
    } else if (strength < 60) {
      strengthClass = "strength-medium";
      strengthTextContent = "Medium";
      strengthWidth = "50%";
    } else if (strength < 80) {
      strengthClass = "strength-strong";
      strengthTextContent = "Strong";
      strengthWidth = "75%";
    } else {
      strengthClass = "strength-very-strong";
      strengthTextContent = "Very Strong";
      strengthWidth = "100%";
    }

    strengthIndicator.classList.add(strengthClass);
    strengthText.classList.add(strengthClass);
    strengthText.textContent = strengthTextContent;

    // Animate the strength bar
    setTimeout(() => {
      strengthIndicator.style.width = strengthWidth;
    }, 100);
  }

  calculatePasswordStrength(password) {
    let score = 0;

    // Length bonus
    score += Math.min(password.length * 2, 25);

    // Character variety bonus
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

    const varietyCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(
      Boolean
    ).length;
    score += varietyCount * 10;

    // Length penalties/bonuses
    if (password.length < 8) score -= 10;
    if (password.length >= 12) score += 5;
    if (password.length >= 16) score += 5;

    // Complexity bonus
    if (varietyCount >= 3) score += 15;
    if (varietyCount === 4) score += 10;

    return Math.min(score, 100);
  }

  async copyToClipboard() {
    const passwordResult = document.getElementById("passwordResult");
    const copyBtn = document.getElementById("copyBtn");

    if (!passwordResult.value) {
      this.showError("Generate a password first");
      return;
    }

    try {
      await navigator.clipboard.writeText(passwordResult.value);

      // Visual feedback
      copyBtn.classList.add("copy-success");
      const icon = copyBtn.querySelector("i");
      const originalClass = icon.className;
      icon.className = "fas fa-check";

      setTimeout(() => {
        copyBtn.classList.remove("copy-success");
        icon.className = originalClass;
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      passwordResult.select();
      document.execCommand("copy");
      this.showSuccess("Password copied to clipboard!");
    }
  }

  animateGeneration() {
    const generateBtn = document.getElementById("generateBtn");
    const icon = generateBtn.querySelector("i");

    icon.style.animation = "none";
    icon.offsetHeight; // Trigger reflow
    icon.style.animation = "spin 0.5s ease-in-out";

    setTimeout(() => {
      icon.style.animation = "";
    }, 500);
  }

  showError(message) {
    this.showNotification(message, "error");
  }

  showSuccess(message) {
    this.showNotification(message, "success");
  }

  showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <i class="fas ${
              type === "error" ? "fa-exclamation-circle" : "fa-check-circle"
            }"></i>
            <span>${message}</span>
        `;

    // Add styles
    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      background: type === "error" ? "#e53e3e" : "#38a169",
      color: "white",
      padding: "12px 20px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      zIndex: "10000",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
      fontWeight: "500",
      opacity: "0",
      transform: "translateY(-20px)",
      transition: "all 0.3s ease",
    });

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateY(0)";
    }, 10);

    // Auto remove
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateY(-20px)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }
}

// Add spin animation for the generate button icon
const style = document.createElement("style");
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize the password generator when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new EnigmaticPasswordGenerator();

  // Generate an initial password
  setTimeout(() => {
    document.getElementById("generateBtn").click();
  }, 500);
});
