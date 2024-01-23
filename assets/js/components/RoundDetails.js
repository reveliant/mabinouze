import axios from 'axios';
import moment from 'moment';
import RoundTitle from './RoundTitle.js'
import Drink from './Drink.js'
import NewDrink from './NewDrink.js'

export default {
    components: {
        RoundTitle,
        Drink,
        NewDrink,
    },
    data() {
      return {
        id: '',
        roundId: '',
        status: this.Status.Waiting,
        password: '',
        description: '',
        time: '',
        tipplers: {},
        updatedDescription: '',
        updatedTime: '',
        expires: '',
        error: ''
      }
    },
    computed: {
        isFuture: function() {
            return this.roundedTime(this.updatedTime).isAfter(this.expires);
        }
    },
    methods: {
        addToOrder(msg) {
            axios.post(this.urls.drink, {
                name: msg.drink,
                quantity: 1,
                order_id: msg.order,
            }, this.config()).then((response) => {
                this.update()
            })
        },
        config() {
            access_token = sessionStorage.getItem(`admin:${this.id}`) || this.base64UrlEncode(this.password);
            return {
                headers: {'Authorization': `Bearer ${access_token}`}
            };
        },
        update(event) {
            if (event) event.preventDefault();
            if (!this.validRoundName()) return;            
            axios.get(this.urls.getRoundDetails.replace('<id>', this.id), this.config()).then((response) => {
                this.description = response.data.description;
                this.time = response.data.time;
                this.tipplers = response.data.tipplers;
                this.status = this.Status.Found;

                this.roundId = response.data.id;
                this.updatedDescription = response.data.description;
                this.updatedTime = moment(response.data.time).format('HH:mm');
                this.expires = moment(response.data.expires);

                sessionStorage.setItem(`admin:${this.id}`, access_token);
            }).catch((error) => {
                switch (error.response.status) {
                    case 401:
                    case 403:
                        this.status = this.Status.NotAutenticated;
                        document.getElementById("details-password").focus();
                        sessionStorage.removeItem(`admin:${this.id}`)
                        break;
                    case 404:
                        this.status = this.Status.NotFound;
                        break;
                    default:
                        this.status = this.Status.Waiting;
                }
            })
        },
        submit(target) {
            console.log("Submit")
            target.preventDefault();
            if (this.status == this.Status.Found) {
                axios.put(this.urls.round + '/' +  this.roundId, {
                    description: this.updatedDescription,
                    time: this.roundedTime(this.updatedTime).toISOString(),
                    //password: this.password,
                    //access_token: (this.access_token != '') ? this.access_token : null,
                }, this.config()).then((response) => {
                    /*sessionStorage.setItem(`admin:${this.id}`, btoa(this.password))
                    if (this.access_token != '') {
                        sessionStorage.setItem(`access:${this.id}`, btoa(this.access_token))
                    }*/
                    this.update();
                }).catch((error) => {
                    this.error = error.response.body;
                });
            }
        },
    },
    mounted() {
        this.emitter.on('addToOrder', this.addToOrder);
        this.emitter.on('updateOrder', this.update);
        this.id = document.location.pathname.split('/')[1];
        this.update();
    },
    template: `
        <article v-if="status == Status.Found">
            <round-title :id="id" :description="description" :time="time"></round-title>
            <div class="accordion accordion-flush" id="round-accordion">
                <p class="text-end accordion-collapse collapse show" data-bs-parent="#round-accordion" id="round-details">
                    <button class="btn btn-outline-secondary btn-sm" data-bs-toggle="collapse" data-bs-target="#round-form">Modifier</button>
                </p>
                <form class="accordion-collapse collapse mt-3 mb-5 bg-secondary-subtle rounded p-3 pt-1" data-bs-parent="#round-accordion" id="round-form" @submit="submit">
                    <div class="row mt-3">
                        <div class="col-md-10">
                            <div class="form-floating">
                                <input type="text" class="form-control" id="round-description" aria-describedby="round-description-help" placeholder="Description de la tournée" v-model="updatedDescription">
                                <label for="round-description">Description de la tournée</label>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="form-floating">
                                <input type="time" class="form-control" id="round-time" placeholder="Heure de la tournée" v-model="updatedTime">
                                <label for="round-time">Heure de la tournée</label>
                            </div>
                        </div>
                    </div>
                    <p class="form-text text-danger fw-bold text-end" v-if="isFuture">
                        L'heure de la tournée ne peut être après son expiration ({{ expires.format('dddd LT') }}) !
                    </p>
                    <div class="row mt-3 d-none">
                        <div class="col-md-6">
                            <div class="form-floating">
                                <input type="password" class="form-control" id="round-password" aria-describedby="round-password-help" placeholder="Mot de passe d'organisation">
                                <label for="round-password">Mot de passe d'organisation</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating">
                                <input type="password" class="form-control" id="round-access-token" aria-describedby="round-access-token-help" placeholder="Mot de passe d'accès">
                                <label for="round-access-token">Mot de passe d'accès (optionnel)</label>
                            </div>
                        </div>
                    </div>
                    <div class="text-end mt-3">
                        <button class="btn btn-outline-danger" data-bs-toggle="collapse" data-bs-target="#round-details">Abandonner</button>
                        <input type="submit" class="btn btn-primary ms-2" data-bs-toggle="collapse" data-bs-target="#round-details" value="Enregistrer" />
                    </div>
                </form>
            </div>
            <template v-for="tippler in tipplers">
                <h3>{{ tippler.name }}</h3>
                <ul class="list-group mb-4">
                    <Drink v-for="drink in tippler.drinks" v-bind="drink" :config="config()"></Drink>
                    <NewDrink :order="tippler.id"></NewDrink>
                </ul>
            </template>
            <div class="alert alert-primary" v-if="!Object.keys(tipplers).length">
                Aucune commande actuellement
            </div>
            <p class="text-end mt-3"><a :href="'/' + id + '/'" class="btn btn-primary">Retour au résumé de la commande</a></p>
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
                        <input type="password" class="form-control" id="details-password" placeholder="Mot de passe d'accès" v-model="password">
                        <label for="details-password">Cette opération nécessite une authentification</label>
                    </div>
                    <input type="submit" class="btn btn-primary" value="Valider">
                </div>
            </form>
        </div>
    `
  }