import runTemplateScript from './template';

(function() {
    const componentStates =  JSON.parse(window.localStorage.getItem('componentState')) || {
        currentPriceView: false,
        historyView: true,
        currencyPairView: true,
        cryptoBoardView: true,
    };    

    const applyChanges = (btn) => {
        if(componentStates[btn.getAttribute('data-component_name')]) {
            btn.className = 'btn btn-lg btn-success'; 
            btn.getElementsByTagName('span')[0].className = 'fa fa-check';
          } else { 
            btn.className = 'btn btn-lg btn-danger';
            btn.getElementsByTagName('span')[0].className = 'fa fa-times';
          }
    }

    const btns = [].slice.call(document.getElementsByClassName('btn'));
    btns.forEach(btn => {
        applyChanges(btn);
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-component_name');
            componentStates[key] = !componentStates[key];
            window.localStorage.setItem('componentState', JSON.stringify(componentStates));
            applyChanges(btn);
        })
    });
})();