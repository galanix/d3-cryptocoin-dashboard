// WAIT MESSAGE CLASS
const WaitMessage = function(classModifier) {
  this.messageRef = document.querySelector(`.graph--${classModifier} .wait-message`);
};
WaitMessage.prototype.show = function() {
  this.messageRef.style.opacity = 0.75;
};
WaitMessage.prototype.hide = function() {
  this.messageRef.style.opacity = 0;
};

export default WaitMessage;