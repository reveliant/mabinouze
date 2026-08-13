import axios from 'axios';
import RoundTitle from './RoundTitle.js'
import RoundUpdate from './RoundUpdate.js'
import Drink from './Drink.js'
import NewDrink from './NewDrink.js'
import NewOrder from './NewOrder.js'
import { DateTime } from 'luxon';

export default {
    components: {
        RoundTitle,
        RoundUpdate,
        Drink,
        NewDrink,
        NewOrder,
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
        expires: '',
        edit: false,
      }
    },
    computed: {
        isFuture: function() {
            return this.roundedTime(this.updatedTime) > DateTime.fromISO(this.expires);
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
                this.roundId = response.data.id;
                this.description = response.data.description;
                this.time = response.data.time;
                this.expires = response.data.expires;
                this.tipplers = response.data.tipplers;
                this.status = this.Status.Found;
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
            target.preventDefault();
            if (this.status == this.Status.Found) {
                axios.put(this.urls.round + '/' +  this.roundId, {
                    description: this.updatedDescription,
                    time: this.roundedTime(this.updatedTime).toISO(),
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
            <round-title :id="id" :description="description" :datetime="time" no-qrcode></round-title>
            <div class="accordion accordion-flush" id="round-accordion">
                <div class="d-flex justify-content-between align-items-baseline">
                    <span class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" id="edit-switch" v-model="edit">
                        <label class="form-check-label" for="edit-switch">Éditer les commandes</label>
                    </span>
                    <p class="text-end accordion-collapse collapse show" data-bs-parent="#round-accordion" id="round-details">
                        <button class="btn btn-outline-primary btn-sm" data-bs-toggle="collapse" data-bs-target="#round-form">
                            <i class="bi bi-pencil me-1" aria-hidden="true"></i>
                            Modifier
                        </button>
                    </p>
                </div>
                <RoundUpdate
                    data-bs-parent="#round-accordion"
                    id="round-form"
                    :roundId="roundId"
                    :description="description"
                    :time="time"
                    :expires="expires"
                    :config="config()"
                ></RoundUpdate>
            </div>
            <template v-for="tippler in tipplers">
                <div class="card border border-light bg-white mb-2 p-3 bg-white d-flex flex-row">
                    <div class="flex-shrink-0">
                        <div class="avatar">{{ tippler.name[0] }}</div>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <div class="d-flex align-items-center">
                            <h4>{{ tippler.name }}</h4>
                        </div>
                        <ul class="list-unstyled mb-0">
                    <Drink v-for="drink in tippler.drinks" v-bind="drink" :edit="edit" :config="config()"></Drink>
                    <NewDrink :order="tippler.id" v-show="edit"></NewDrink>
                </ul>
                    </div>
                </div>
            </template>
            <div class="alert alert-warning" v-if="!Object.keys(tipplers).length">
                Aucune commande actuellement
            </div>
            <NewOrder :round="id" v-show="edit"></NewOrder>
            <p class="text-end mt-3">
                <a :href="'/' + id + '/'" class="btn btn-primary">
                    <i class="bi bi-lg bi-arrow-left-circle me-1" aria-hidden="true"></i>
                    Résumé de la commande
                </a>
            </p>
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
            <h4>Est-ce que c'est bien toi le patron ?</h4>
            <p>Cette opération nécessite une authentification</p>
            <form class="mb-5" @submit="update">
                <div class="input-group">
                    <div class="form-floating">
                        <input type="password" class="form-control" id="details-password" placeholder="Mot de passe d'organisation" v-model="password">
                        <label for="details-password">Mot de passe d'organisation</label>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="bi bi-lg bi-unlock2 me-1" aria-hidden="true"></i>
                        Gérer
                    </button>
                </div>
            </form>
        </div>
    `
  }