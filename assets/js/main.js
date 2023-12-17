/*!
  * Ma Binouze (https://mabinouse.fr/)
  * Copyright 2023 Rémi Dubois
  * Licensed under Beerware (https://github.com/reveliant/mabinouze/blob/main/LICENSE)
  */

import {ref, createApp} from 'vue';
import moment from 'moment';
import mitt from 'mitt';
import {NewRound, SearchRound, Round, RoundDetails, MyOrder} from './components';
import params from '@params';

const URLs = {
  'getRound': params.api + '/search/<id>',
  'getRoundDetails': params.api + '/search/<id>/details',
  'round': params.api + '/round',
  'order': params.api + '/order',
  'drink': params.api + '/drinks',
}

/*const routes = {
  '/': Home,
  '/about': About
}*/

const currentPath = ref(window.location.hash)
console.log(currentPath.value)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
  console.log(currentPath.value.slice(1))
})

window.addEventListener('load', function(){
    moment.locale(window.navigator.language);
    const app = createApp()
        .component('NewRound', NewRound)
        .component('SearchRound', SearchRound)
        .component('Round', Round)
        .component('RoundDetails', RoundDetails)
        .component('MyOrder', MyOrder);
      app.config.globalProperties.emitter = mitt();
      app.config.globalProperties.urls = URLs;
      app.mount('body');
});