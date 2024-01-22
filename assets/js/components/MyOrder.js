import axios from 'axios';
import Drink from './Drink.js'
import NewDrink from './NewDrink.js'

export default {
    components: {
        Drink,
        NewDrink,
    },
    data() {
      return {
        id: '',
        orderId: undefined,
        status: this.Status.Waiting,
        customOrder: "",
        settings: this.getUserDefaultSettings(),
        drinks: new Map()
      }
    },
    methods: {
        addToOrder(msg) {
            let drink = this.drinks.get(event.msg);
            if (drink === undefined) {
                if (!this.credentialsReady)
                    return new Promise();
                if (this.orderId !== undefined) {
                    return this.createDrink(msg.drink)
                } else {
                    return axios.post(this.urls.getRoundOrder.replace('<id>', this.id), {
                        tippler: this.settings.username,
                        password: this.settings.password,
                    }, this.config()).then((response) => {
                        this.orderId = response.data.id;
                        this.createDrink(msg.drink)
                    })
                }
            } else {
                drink.quantity++;
                return this.updateDrink(drink);
            }
        },
        createDrink(name) {
            if (!this.credentialsReady)
                return new Promise();
            return axios.post(this.urls.drink, {
                name: name,
                quantity: 1,
                order_id: this.orderId,
            }, this.config()).then((response) => {
                this.emitter.emit('updateOrder')
                this.update()
            })
        },
        updateDrink(drink) {
            if (!this.credentialsReady)
                return new Promise();
            return axios.put(this.urls.drink + '/' + drink.id, {
                name: drink.name,
                quantity: drink.quantity
            }, this.config()).then((response) => {
                this.emitter.emit('updateOrder')
                this.update()
            })
        },
        config() {
            return {
                headers: {'Authorization': `Bearer ${this.base64UrlEncode(this.settings.username)}.${this.base64UrlEncode(this.settings.password)}`}
            };
        },
        update(event) {
            if (!this.validRoundName() || !this.credentialsReady) return;
            axios.get(this.urls.getRoundOrder.replace('<id>', this.id), this.config()).then((response) => {
                this.orderId = response.data.id;
                this.status = this.Status.Found;
                this.drinks.clear();
                response.data.drinks.forEach((drink) => this.drinks.set(drink.name, drink));
            }).catch((error) => {
                this.orderId = undefined;
                this.drinks.clear();
                switch (error.response.status) {
                    case 401:
                        this.status = this.Status.NotAutenticated;
                        break;
                    case 403:
                        this.status = this.Status.NotAuthorized;
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
    computed: {
        credentialsReady() {
            return (this.settings.username != "" && this.settings.password != "")
        }
    },
    mounted() {
        this.emitter.on('addToOrder', this.addToOrder);
        this.emitter.on('updateOrder', this.update)
        this.emitter.on('updateUserDefaultSettings', () => {
            console.log("Reloading after credentials updated")
            this.settings = this.getUserDefaultSettings()
            this.update()
        });
        this.id = document.location.pathname.split('/')[1];
        this.update();
    },
    template: `
        <ul v-show="[Status.Found, Status.NotFound].includes(status)" class="list-group mb-4">
            <li class="list-group-item list-group-item-primary" v-if="status === Status.NotFound">
                Il n'y a actuellement aucune commande à ton nom.
            </li>
            <Drink v-for="[name, drink] in drinks" v-bind="drink" :config="config()"></Drink>
            <NewDrink></NewDrink>
        </ul>
        <div class="alert alert-primary" v-if="status === Status.NotAuthorized">
            Ton nom est déjà utilisé par un homonyme dans une commande.
            <a href="#" class="alert-link" data-bs-toggle="offcanvas" data-bs-target="#navbar-menu">Changer les paramètres</a>
        </div>
        <div class="alert alert-primary py-2" v-show="!credentialsReady">
            Indique ton prénom et un mot de passe avant de passer des commandes !
            <a href="#" class="alert-link" data-bs-toggle="offcanvas" data-bs-target="#navbar-menu">Paramétrer maintenant</a>
        </div>
    `
}