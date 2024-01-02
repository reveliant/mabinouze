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
            if (!this.id.match(/^[A-Za-z0-9-]{4}[A-Za-z0-9-]{0,251}$/))
                return;
            
            config = {};
            access_token = sessionStorage.getItem(`access:${this.id}`)
            if (access_token != null) {
                config['headers'] = {'Authorization': `Bearer ${access_token}`}
            }

            axios.get(this.urls.getRound.replace('<id>', this.id), config).then((response) => {
                this.description = response.data.description;
                this.time = response.data.time;
                this.drinks.length = 0;
                response.data.drinks.forEach(drink => this.drinks.push(drink));
                this.total.drinks = response.data.drinks.reduce((acc, value) => acc + value.quantity, 0);
                this.total.tipplers = response.data.tipplers;
            });
        },
    },
    mounted() {
        this.emitter.on('updateOrder', this.update);
        this.id = document.location.pathname.split('/')[1];
            this.update();
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
            <p class="text-end"><a :href="'/' + id + '/details'" class="btn btn-primary">Voir le détail de la commande</a></p>
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