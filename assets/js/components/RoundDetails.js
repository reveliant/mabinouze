import axios from 'axios';
import Calendar from './Calendar.js'
import Drink from './Drink.js'
import NewDrink from './NewDrink.js'

export default {
    components: {
        Calendar,
        Drink,
        NewDrink,
    },
    data() {
      return {
        id: '',
        status: this.Status.Waiting,
        password: '',
        description: '',
        time: '',
        tipplers: [],
        error: ''
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
    },
    mounted() {
        this.emitter.on('addToOrder', this.addToOrder);
        this.emitter.on('updateOrder', this.update);
        this.id = document.location.pathname.split('/')[1];
        this.update();
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
                    <Drink v-for="drink in tippler.drinks" v-bind="drink" :config="config()"></Drink>
                    <NewDrink :order="tippler.id"></NewDrink>
                </ul>
            </template>
            <p class="text-end"><a :href="'/' + id + '/'" class="btn btn-primary">Retour au résumé de la commande</a></p>
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