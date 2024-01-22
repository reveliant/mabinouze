import axios from 'axios';
import params from '@params';
import RoundTitle from './RoundTitle.js'

export default {
    components: {
        RoundTitle
    },
    data() {
      return {
        id: '',
        status: this.Status.Waiting,
        password: '',
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
            if (event) event.preventDefault();
            if (!this.validRoundName()) return;
            
            config = {};
            if (sessionStorage.getItem(`access:${this.id}`) !== null || this.password !== '') {
                access_token = sessionStorage.getItem(`access:${this.id}`) || this.base64UrlEncode(this.password);
                config['headers'] = {'Authorization': `Bearer ${access_token}`}
            }

            axios.get(this.urls.getRound.replace('<id>', this.id), config).then((response) => {
                this.description = response.data.description;
                this.time = response.data.time;
                this.drinks.length = 0;
                response.data.drinks.forEach(drink => this.drinks.push(drink));
                this.total.drinks = response.data.drinks.reduce((acc, value) => acc + value.quantity, 0);
                this.total.tipplers = response.data.tipplers;
                this.status = this.Status.Found;
            }).catch((error) => {
                switch (error.response.status) {
                    case 401:
                    case 403:
                        this.status = this.Status.NotAutenticated;
                        document.getElementById("round-password").focus();
                        sessionStorage.removeItem(`access:${this.id}`)
                        break;
                    case 404:
                        this.status = this.Status.NotFound;
                        break;
                    default:
                        this.status = this.Status.Waiting;
                }
            });
        },
    },
    mounted() {
        this.emitter.on('updateOrder', this.update);
        this.id = document.location.pathname.split('/')[1];
        this.update();
    },
    template: `
        <article v-if="status == Status.Found">
            <round-title :id="id" :description="description" :time="time"></round-title>
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
        <div v-if="status == Status.NotFound">
            <h2>Oups !</h2>
            <p>
                La tournée demandée n'existe pas...
                <a href="/">retourner à la page d'accueil</a>
            </p>
        </div>
        <div v-show="status == Status.NotAutenticated">
            <h2>Oups !</h2>
            <form class="mb-5" @submit="update">
                <div class="input-group">
                    <div class="form-floating">
                        <input type="password" class="form-control" id="round-password" placeholder="Mot de passe d'accès" v-model="password">
                        <label for="round-password">Cette tournée nécessite un mot de passe</label>
                    </div>
                    <input type="submit" class="btn btn-primary" value="Valider">
                </div>
            </form>
        </div>
    `
  }