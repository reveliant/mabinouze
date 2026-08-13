/*!
  * Ma Binouze (https://mabinouse.fr/)
  * Copyright 2023 Rémi Dubois
  * Licensed under Beerware (https://github.com/reveliant/mabinouze/blob/main/LICENSE)
  */

import {ref, createApp} from 'vue';
import {DateTime, Settings as luxonSettings} from 'luxon';
import {NewRound, SearchRound, Round, RoundDetails, MyOrder, Settings} from './components';
import vueGlobals from './vueGlobals';


const currentPath = ref(window.location.hash)
window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})
window.addEventListener('load', function(){
    luxonSettings.defaultLocale = DateTime.now().resolvedLocaleOptions().locale;
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