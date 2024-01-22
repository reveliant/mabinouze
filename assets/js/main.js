/*!
  * Ma Binouze (https://mabinouse.fr/)
  * Copyright 2023 Rémi Dubois
  * Licensed under Beerware (https://github.com/reveliant/mabinouze/blob/main/LICENSE)
  */

import {ref, createApp} from 'vue';
import moment from 'moment';
import mitt from 'mitt';
import {NewRound, SearchRound, Round, RoundDetails, MyOrder, Settings} from './components';
import params from '@params';

const URLs = {
  'getRound': params.api + '/search/<id>',
  'getRoundDetails': params.api + '/search/<id>/details',
  'getRoundOrder': params.api + '/search/<id>/order',
  'round': params.api + '/round',
  'order': params.api + '/order',
  'drink': params.api + '/drink',
}

/*const routes = {
  '/': Home,
  '/about': About
}*/

const currentPath = ref(window.location.hash)
window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const vueGlobals = {
  emitter: mitt(),
  urls: URLs,
  base64UrlEncode: function (token) {
    const bytes = new TextEncoder().encode(token)
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  },
  getUserDefaultSettings: function () {
    return {
      username: localStorage.getItem("username") || "",
      password: sessionStorage.getItem("password") || "",
    }
  },
  setUserDefaultSettings: function (username, password) {
    localStorage.setItem("username", username);
    sessionStorage.setItem("password", password);
    console.log("Settings updated");
  },
  validRoundName: function() {
    console.log("Check round name")
    return this.id.match(/^[A-Za-z0-9-]{4}[A-Za-z0-9-]{0,251}$/);
  },
  Status: {
    Waiting: 'Waiting',
    Found: 'Found',
    NotAutenticated: 'NotAuthenticated',
    NotAuthorized: 'NotAuthorized',
    NotFound: 'Not Found',
  },
};

window.addEventListener('load', function(){
    moment.locale(window.navigator.language);
    const app = createApp()
    .component('NewRound', NewRound)
    .component('SearchRound', SearchRound)
    .component('Round', Round)
    .component('RoundDetails', RoundDetails)
    .component('MyOrder', MyOrder)
    .component('Settings', Settings);
  Object.assign(app.config.globalProperties, vueGlobals);
  app.mount('body');
});