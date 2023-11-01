import axios from 'axios';
import params from '@params';

export default {
    props: {
        "id": String
    },
    data() {
      return {
        showError: true,
        username: localStorage.getItem("username") || "",
        password: "",
        digest: localStorage.getItem("password") || "",
        customOrder: "",
        drinks: new Map()
      }
    },
    methods: {
        addToOrder(name) {
            if (!this.ready) return;
            if (this.drinks.has(name)) {
                this.drinks.get(name).quantity++;
            } else {
                this.drinks.set(name, {name: name, quantity: 1});
            }
        },
        removeFromOrder(name) {
            if (!this.ready) return;
            if (this.drinks.get(name).quantity > 1) {
                this.drinks.get(name).quantity--;
            } else {
                this.drinks.delete(name);
            }
        },
        submit(event) {
            if (this.customOrder != "") {
                this.addToOrder(this.customOrder);
                this.customOrder = "";
            }
            event.preventDefault();
        },
    },
    watch: {
        username(value) {
            this.username = value;
            localStorage.setItem("username", value)
        }
    },
    computed: {
        ready() {
            return (this.username != "" && this.digest != "")
        }
    },
    mounted() {
        this.emitter.on("addToOrder", this.addToOrder)
    },
    template: `
        <div v-if="!ready" class="alert alert-primary py-2">
            Indique ton prénom et un mot de passe avant de passer des commandes !
        </div>
        <ul v-if="ready" class="list-group">
            <li v-for="[name, drink] in drinks" class="list-group-item d-flex justify-content-between align-items-center">
                <span class="flex-fill">{{ drink.name }}</span>
                <span class="badge bg-danger rounded-pill" v-if="drink.quantity > 1">{{ drink.quantity }}</span>
                <button class="list-group-item-add btn btn-danger badge ms-3" @click="removeFromOrder(drink.name)">&ndash;</button>
                <button class="list-group-item-add btn btn-success badge ms-1" @click="drink.quantity++">+</button>
            </li>
            <li class="list-group-item">
                <form class="d-flex justify-content-between align-items-center" @submit="submit">
                <input type="text" class="form-control flex-fill p-0 border-0" placeholder="Autre consommation" required v-model="customOrder" />
                <button class="list-group-item-add visible btn btn-success badge ms-3">+</button>
                </form>
            </li>
        </ul>
        <div class="row mt-3 mb-5">
            <div class="col-md-6">
                <div class="form-floating">
                    <input type="text" class="form-control" id="order-username" aria-describedby="order-username-help" placeholder="Prénom, nom, alias..." required v-model="username">
                    <label for="order-username">Prénom, nom, alias...</label>
                </div>
                <div class="form-text" id="order-username-help">
                    Ton prénom, nom ou alias, visible uniquement par l'organisateur de la tournée pour savoir à qui distribuer les commandes
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-floating">
                    <input type="password" class="form-control" id="order-password" aria-describedby="order-password-help" placeholder="Mot de passe" required v-model="password">
                    <label for="order-password">Mot de passe</label>
                </div>
                <div class="form-text" id="order-password-help">
                    Un mot de passe qui te permettra de modifier ta commande ultérieurement.
                    Si tu le perds, ta tournée tourne au vinaigre !
                </div>
            </div>
        </div>
    `
}