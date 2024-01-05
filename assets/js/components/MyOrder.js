import axios from 'axios';

export default {
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
        addToOrder(name) {
            if ((drink = this.drinks.get(name)) !== undefined) {
                drink.quantity++;
                return this.updateDrink(drink);
            } else {
                if (!this.credentialsReady)
                    return new Promise();
                if (this.orderId !== undefined) {
                    return this.createDrink(name)
                } else {
                    return axios.post(this.urls.getRoundOrder.replace('<id>', this.id), {
                        tippler: this.settings.username,
                        password: this.settings.password,
                    }, this.config()).then((response) => {
                        this.orderId = response.data.id;
                        this.createDrink(name)
                    })
                }
            }
        },
        removeFromOrder(name) {
            if ((drink = this.drinks.get(name)) !== undefined) {
                drink.quantity--;
                this.updateDrink(drink);
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
        submit(event) {
            event.preventDefault();
            if (this.customOrder != "") {
                console.log("Add custom order");
                this.addToOrder(this.customOrder).then(() => this.customOrder = "");
            }
        },
        config() {
            return {
                headers: {'Authorization': `Bearer ${this.base64UrlEncode(this.settings.username)}.${this.base64UrlEncode(this.settings.password)}`}
            };
        },
        update(event) {

            if (!this.id.match(/^[A-Za-z0-9-]{4}[A-Za-z0-9-]{0,251}$/) || !this.credentialsReady)
                return;
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
            <li v-for="[name, drink] in drinks" class="list-group-item d-flex justify-content-between align-items-center">
                <span class="flex-fill">{{ drink.name }}</span>
                <span class="badge bg-danger rounded-pill" v-if="drink.quantity > 1">{{ drink.quantity }}</span>
                <button class="list-group-item-add btn btn-danger badge ms-3" @click="removeFromOrder(drink.name)">&ndash;</button>
                <button class="list-group-item-add btn btn-success badge ms-1" @click="addToOrder(drink.name)">+</button>
            </li>
            <li class="list-group-item">
                <form class="d-flex justify-content-between align-items-center" @submit="submit">
                <input type="text" class="form-control flex-fill p-0 border-0" placeholder="Autre consommation" required v-model="customOrder" />
                <button class="list-group-item-add visible btn btn-success badge ms-3">+</button>
                </form>
            </li>
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