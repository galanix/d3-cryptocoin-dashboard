// WAIT MESSAGE CLASS
export default class WaitMessage {
  constructor(parentSelector) {
    this.messageRef = document.createElement('p');
    this.messageRef.textContent = 'Wait, please...';
    this.messageRef.classList.add('wait-message');
    
    this.parent = document.querySelector(parentSelector);
    this.parent.appendChild(this.messageRef);
    
    //this.messageRef = document.querySelector(`.graph--${classModifier} .wait-message`);
  }
  show() {
    this.messageRef.style.opacity = 0.75;
  }
  hide() {
    this.messageRef.style.opacity = 0;
  }
};