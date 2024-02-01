import axios from 'axios';
import moment from 'moment';

export default {
    props: {
        roundId: String,
        name: String,
        description: String,
        password: String,
        access_token: String,
        time: String,
        expires: String,
        config: Object,
    },
    data() {
        return {
            updatedDescription: this.description,
            updatedTime: moment(this.time).format('HH:mm'),
        }
    },
    computed: {
        isFuture: function() {
            return this.roundedTime(this.time).isAfter(this.expires);
        },
        expiry: function() {
            return moment(this.expires).format('dddd LT')
        },
    },
    methods: {
        submit(target) {
            target.preventDefault();
            axios.put(this.urls.round + '/' +  this.roundId, {
                description: this.updatedDescription,
                time: this.roundedTime(this.updatedTime).toISOString(),
                //password: this.password,
                //access_token: (this.access_token != '') ? this.access_token : null,
            }, this.config).then((response) => {
                /*sessionStorage.setItem(`admin:${this.roundId}`, btoa(this.password))
                if (this.access_token != '') {
                    sessionStorage.setItem(`access:${this.roundId}`, btoa(this.access_token))
                }*/
                this.emitter.emit('updateOrder')
            }).catch((error) => {
                this.emitter.emit('errorUpdateOrder', error)
            });
        },
    },
    template: `
        <form class="accordion-collapse collapse mt-3 mb-5 bg-secondary-subtle rounded p-3 pt-1" @submit="submit">
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
                L'heure de la tournée ne peut être après son expiration ({{ expiry }}) !
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
    `
  }