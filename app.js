const chatPanel = document.querySelector("[data-chat-panel]");
const chatToggles = document.querySelectorAll("[data-chat-toggle]");
const chatForm = document.querySelector("[data-chat-form]");
const chatInput = document.querySelector("[data-chat-input]");
const chatMessages = document.querySelector("[data-chat-messages]");
const typingStatus = document.querySelector("[data-typing-status]");

const state = {
  userTypingIndicator: null,
  aiTypingIndicator: null,
  aiResponder: async (message) => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return `Thanks for sharing: "${message}". I can connect this UI to your business logic whenever you're ready.`;
  },
};

const createMessage = ({ text, sender, isTyping = false }) => {
  const message = document.createElement("article");
  message.classList.add("message", `message--${sender}`);
  if (isTyping) {
    message.classList.add("message--typing");
  }

  const bubble = document.createElement("p");
  bubble.classList.add("message__bubble");
  bubble.textContent = text;

  if (isTyping) {
    bubble.textContent = "Typing";
    const dots = document.createElement("span");
    dots.classList.add("typing-dots");
    dots.innerHTML = "<span></span><span></span><span></span>";
    bubble.appendChild(dots);
  }

  message.appendChild(bubble);
  return message;
};

const scrollToBottom = () => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const toggleChat = () => {
  chatPanel.classList.toggle("is-open");
  if (chatPanel.classList.contains("is-open")) {
    chatInput.focus();
  }
};

const updateUserTyping = () => {
  const isTyping = chatInput.value.trim().length > 0;
  if (isTyping && !state.userTypingIndicator) {
    state.userTypingIndicator = createMessage({
      text: "Typing",
      sender: "user",
      isTyping: true,
    });
    chatMessages.appendChild(state.userTypingIndicator);
  }

  if (!isTyping && state.userTypingIndicator) {
    state.userTypingIndicator.remove();
    state.userTypingIndicator = null;
  }
  scrollToBottom();
};

const setAiTyping = (isTyping) => {
  typingStatus.hidden = !isTyping;
};

const showAiTypingBubble = () => {
  if (state.aiTypingIndicator) {
    return;
  }
  state.aiTypingIndicator = createMessage({
    text: "Typing",
    sender: "bot",
    isTyping: true,
  });
  chatMessages.appendChild(state.aiTypingIndicator);
  scrollToBottom();
};

const clearAiTypingBubble = () => {
  if (!state.aiTypingIndicator) {
    return;
  }
  state.aiTypingIndicator.remove();
  state.aiTypingIndicator = null;
};

const handleSend = async (message) => {
  if (!message.trim()) {
    return;
  }

  if (state.userTypingIndicator) {
    state.userTypingIndicator.remove();
    state.userTypingIndicator = null;
  }

  const userMessage = createMessage({ text: message, sender: "user" });
  chatMessages.appendChild(userMessage);
  scrollToBottom();

  chatInput.value = "";
  updateUserTyping();

  setAiTyping(true);
  showAiTypingBubble();

  const response = await state.aiResponder(message);

  setAiTyping(false);
  clearAiTypingBubble();

  const botMessage = createMessage({ text: response, sender: "bot" });
  chatMessages.appendChild(botMessage);
  scrollToBottom();
};

const registerAiResponder = (fn) => {
  if (typeof fn === "function") {
    state.aiResponder = fn;
  }
};

chatToggles.forEach((toggle) => {
  toggle.addEventListener("click", toggleChat);
});

chatInput.addEventListener("input", updateUserTyping);

chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSend(chatInput.value);
  }
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleSend(chatInput.value);
});

window.AskBitChat = {
  registerAiResponder,
};
