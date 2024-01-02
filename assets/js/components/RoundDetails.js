import axios from 'axios';
import Calendar from './Calendar.js'

const Status = {
    Waiting: 'Waiting',
    Found: 'Found',
    NotFound: 'Not Found',
    NotAutenticated: 'NotAuthenticated'
};

export default {
    components: {
        Calendar
    },
    data() {
      return {
        id: '',
        status: Status.Waiting,
        Status: Status,
        description: '',
        time: '',
        tipplers: []
      }
    },
    methods: {
        update(event) {
            config = {};
            access_token = sessionStorage.getItem(`admin:${this.id}`)
            if (access_token != null) {
                config['headers'] = {'Authorization': `Bearer ${access_token}`}
            }
            axios.get(this.urls.getRoundDetails.replace('<id>', this.id), config).then((response) => {
                this.description = response.data.description;
                this.time = response.data.time;
                this.tipplers = response.data.tipplers;
                this.found = true;
            }).catch((error) => {
                switch (error.response.status) {
                    case 401:
                        this.status = Status.NotAutenticated;
                        break;
                    case 404:
                        this.status = Status.NotFound;
                        break;
                    default:
                        this.status = Status.Waiting;
                }
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
        <article v-if="status == Status.Found">
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
        <div v-if="status == Status.NotFound">
            <h2>Oups !</h2>
            <p>
                La tournée demandée n'existe pas...
                <a href="/">retourner à la page d'accueil</a>
            </p>
        </div>
        <div v-if="status == Status.NotAutenticated">
            <h2>Oups !</h2>
            <p>
                Cette opération nécessite une authentification.
            </p>
        </div>
    `
  }