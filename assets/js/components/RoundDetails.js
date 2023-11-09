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
        tipplers: []
      }
    },
    methods: {
        update(event) {
            axios.get(this.urls.getRoundDetails.replace('<id>', this.id)).then((response) => {
                this.description = response.data.description;
                this.time = response.data.time;
                this.tipplers = response.data.tipplers;
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
            <template v-for="tippler in tipplers">
                <h3>{{ tippler.name }}</h3>
                <ul class="list-group mb-4">
                    <li v-for="drink in tippler.drinks" class="list-group-item d-flex justify-content-between align-items-center">
                        <span class="flex-fill">{{ drink.name }}</span>
                        <span class="badge bg-danger rounded-pill" v-if="drink.quantity > 1">{{ drink.quantity }}</span>
                    </li>
                </ul>
            </template>
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