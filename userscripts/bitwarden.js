// ==UserScript==
// @name         Bitwarden
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://vault.bitwarden.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bitwarden.com
// @grant        none
// ==/UserScript==

function removeLastSection() {
  if (!location.hash.startsWith('#/vault')) {
    return;
  }

  const divEls = document.querySelectorAll('.container.page-content > .row > div');

  if (divEls.length !== 3) {
    return;
  }

  divEls[1].classList.remove('col-6');
  divEls[1].classList.add('col-9');
  divEls[2].remove();
}

function resizeColumn() {
  if (!location.hash.startsWith('#/vault')) {
    return;
  }

  const thEls = document.querySelectorAll('th');

  if (thEls.length !== 4) {
    return;
  }

  thEls.forEach((thEl) => {
    if (thEl.innerText === 'Name') {
      thEl.style.width = '70%';
    }

    if (thEl.innerText === 'Owner') {
      thEl.style.width = '10%';
    }
  });
}

(function () {
  setInterval(removeLastSection, 500);
  setInterval(resizeColumn, 500);
})();
