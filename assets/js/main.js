/*!
  * Ma Binouze (https://mabinouse.fr/)
  * Copyright 2023 Rémi Dubois
  * Licensed under Beerware (https://github.com/reveliant/mabinouze/blob/main/LICENSE)
  */

import {ref, createApp} from 'vue';
import moment from 'moment';
import {NewRound, SearchRound, Round} from './components';

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
        .mount('body > main');
});