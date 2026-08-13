import axios from 'axios';
import RoundTitle from './RoundTitle.js'
import vueGlobals from '../vueGlobals.js'
import { ref } from 'vue'

export default {
    components: {
        RoundTitle
    },
    async setup() {
        var id = ref(document.location.pathname.split('/')[1]);
        var status = ref(vueGlobals.Status.Waiting);
        var password = ref('');
        var description = ref('');
        var time = ref('');
        var drinks = ref([]);
        var total = ref({
            'drinks': 0,
            'tipplers': 0
        });
            
        var config = {};
        if (sessionStorage.getItem(`access:${id.value}`) !== null) {
            let access_token = sessionStorage.getItem(`access:${id.value}`);
            config['headers'] = {'Authorization': `Bearer ${access_token}`}
        }
        
        try {
            var response = await axios.get(vueGlobals.urls.getRound.replace('<id>', id.value), config)
            status.value = vueGlobals.Status.Found;
            description.value = response.data.description;
            time.value = response.data.time;
            drinks.value = response.data.drinks;
            total.value = {
                'drinks': response.data.drinks.reduce((acc, value) => acc + value.quantity, 0),
                'tipplers': response.data.tipplers
            }
        }
        catch(error) {
            var status;
            switch (error.response.status) {
                case 401:
                case 403:
                    status.value = vueGlobals.Status.NotAutenticated;
                    sessionStorage.removeItem(`access:${id.value}`)
                    break;
                case 404:
                    status.value = vueGlobals.Status.NotFound;
                    break;
                default:
                    status.value = vueGlobals.Status.Waiting;
            }
        }

        return {
            id,
            status,
            password,
            description,
            time,
            drinks,
            total
        }
    },
    methods: {
        update(event) {
            if (event) event.preventDefault();
            if (!this.validRoundName()) return;
            
            config = {};
            var access_token;
            if (sessionStorage.getItem(`access:${this.id}`) !== null || this.password !== '') {
                access_token = sessionStorage.getItem(`access:${this.id}`) || this.base64UrlEncode(this.password);
                config['headers'] = {'Authorization': `Bearer ${access_token}`}
            }

            axios.get(this.urls.getRound.replace('<id>', this.id), config).then((response) => {
                if (access_token !== null) {
                    sessionStorage.setItem(`access:${this.id}`, access_token);
                }
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
    },
    template: `
        <article v-if="status == Status.Found">
            <round-title :id="id" :description="description" :datetime="time"></round-title>
            <ul class="card border border-light p-3 ps-4 pb-2 list-unstyled mb-3" v-if="drinks.length">
                <li v-for="drink in drinks" class="d-flex justify-content-between align-items-center mb-2">
                    <span class="me-2 py-2">{{ drink.quantity }}×</span>
                    <span class="flex-fill">{{ drink.name }}</span>
                    <button class="btn btn-outline-secondary btn-circle ms-2" @click="this.emitter.emit('addToOrder', {drink: drink.name})" >
                        <i class="bi bi-plus" alt="Ajouter à ma commande"></i>
                    </button>
                </li>
            </ul>
            <div class="alert alert-warning" v-if="!drinks.length">
                Aucune commande actuellement
            </div>
            <div class="d-flex align-items-center mb-5">
                <span class="avatar text-dark me-2"><i class="bi bi-people"></i></span>
                <p class="flex-fill mb-0 span-nowrap">
                    <span class="d-none d-md-inline">Total :</span> <span><b>{{ total.drinks }}</b> consommation{{ total.drinks > 1 ? 's' : ''}}</span> <span>pour <b>{{ total.tipplers }}</b> assoifé{{ total.tipplers > 1 ? 's' : ''}}</span>
                </p>
                <a :href="'/' + id + '/details'" class="btn btn-primary text-nowrap">
                    <i class="bi bi-search me-1" aria-hidden="true"></i>
                    Voir le détail de la commande
                </a>
            </div>
            <h3>Ma commande</h3>
            <my-order></my-order>
        </article>
        <div v-if="status == Status.NotFound">
            <div class="collapse show new-round">
                <div class="warning-msg">
                    <div class="icon">🍻</div>
                    <h4>Oups !</h4>
                    <p>La tournée demandée n'existe pas...</p>
                    <p>
                        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target=".new-round" aria-expanded="false" aria-controls="collapseExample">
                            <i class="bi bi-lg bi-arrow-right-short me-1" aria-hidden="true"></i>
                            Créer cette tournée
                        </button>
                    </p>
                </div>
            </div>
            <div class="collapse new-round">
                <h2>Créer la tournée <span class="text-primary font-monospace" v-text="id"></span></h2>
                <NewRound  :create-id="id"></NewRound>
            </div>
        </div>
        <div class="warning-msg" v-show="status == Status.NotAutenticated">
            <div class="icon">✋</div>
            <h4>Minute papillon !</h4>
            <p>Cette tournée nécessite un mot de passe...</p>
            <form class="mb-5" @submit="update">
                <div class="input-group">
                    <div class="form-floating">
                        <input type="password" class="form-control" id="round-password" placeholder="Mot de passe d'accès" v-model="password">
                        <label for="round-password">Mot de passe participant</label>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="bi bi-lg bi-unlock2 me-1" aria-hidden="true"></i>
                        Accéder
                    </button>
                </div>
            </form>
        </div>
    `
  }