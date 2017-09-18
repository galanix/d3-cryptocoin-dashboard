// WAIT MESSAGE CLASS
class WaitMessage {
  constructor(classModifier) {
    this.messageRef = document.querySelector(`.graph--${classModifier} .wait-message`);
  }
  show() {
    this.messageRef.style.opacity = 0.75;
  }
  hide() {
    this.messageRef.style.opacity = 0;
  }
};

export default WaitMessage;