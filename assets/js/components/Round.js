import axios from 'axios';
import params from '@params';
import Calendar from './Calendar.js'

export default {
    components: {
        Calendar
    },
    data() {
      return {
        id: '',
        found: false,
        description: '',
        time: '',
        drinks: [],
        total: {
            'drinks': 0,
            'tipplers': 0
        }
      }
    },
    methods: {
        update(event) {
            axios.get(params.api + 'round?id=' + this.id).then((response) => {
                this.description = response.data.description;
                this.time = response.data.time;
                this.drinks = response.data.drinks;
                this.total.drinks = response.data.drinks.reduce((acc, value) => acc + value.quantity, 0);
                this.total.tipplers = response.data.tipplers;
                this.found = true;
            })
        },
    },
    mounted() {
        this.id = document.location.pathname.split('/')[1];
        if (this.id.match(/^[A-Za-z0-9-]{4}[A-Za-z0-9-]{0,251}$/)) {
            this.update();
        }
    },
    template: `
        <article v-if="found">
            <h2 class="d-flex align-items-center">
                {{ description }}
                <calendar class="ms-auto" :date="time"></calendar>
            </h2>
            <ul class="list-group mb-4">
                <li v-for="drink in drinks" class="list-group-item d-flex justify-content-between align-items-center">
                    <span class="flex-fill">{{ drink.name }}</span>
                    <span class="badge bg-danger rounded-pill">{{ drink.quantity }}</span>
                    <button class="list-group-item-add btn btn-success badge ms-3" @click="this.emitter.emit('addToOrder', drink.name)">+</button>
                </li>
            </ul>
            <p class="text-end">Total : {{ total.drinks }} consommations pour {{ total.tipplers }} assoifés</p>
        </article>
        <div v-else>
            <h2>Oups !</h2>
            <p>
                La tournée demandée n'existe pas...
                <a href="/">retourner à la page d'accueil</a>
            </p>
        </div>
    `
  }