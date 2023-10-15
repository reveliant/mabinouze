/*!
  * Ma Binouze (https://mabinouse.fr/)
  * Copyright 2023 Rémi Dubois
  * Licensed under Beerware (https://github.com/reveliant/mabinouze/blob/main/LICENSE)
  */

import {createApp} from 'vue';
import moment from 'moment';
import {NewRound, SearchRound} from './components';

window.addEventListener('load', function(){
    moment.locale(window.navigator.language);
    const app = createApp()
        .component('NewRound', NewRound)
        .component('SearchRound', SearchRound)
        .mount('body > main');
});