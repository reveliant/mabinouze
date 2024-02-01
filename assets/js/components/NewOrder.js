import axios from 'axios';

export default {
    props: {
        round: String
    },
    data() {
      return {
        username: '',
        password: '',
        error: '',
      }
    },
    computed: {
        validUser() {
            return !(this.username.match(/^\s*$/) || this.password.match(/^\s*$/))
        }
    },
    methods: {
        save(event) {
            event.preventDefault();
            if (!this.validUser)
                return
            return axios.post(this.urls.getRoundOrder.replace('<id>', this.round), {
                tippler: this.username,
                password: this.password,
            }, this.config()).then((response) => {
                this.emitter.emit('updateOrder')
                this.username='';
                this.password='';
                this.error='';
            }).catch((error) => {
                switch (error.response.status) {
                    case 403:
                        this.error = 'Cet assoifé existe déjà avec un autre mot de passe';
                        break;
                }
            });
        },
        config() {
            return {
                headers: {'Authorization': `Bearer ${this.base64UrlEncode(this.username)}.${this.base64UrlEncode(this.password)}`}
            };
        },
    },
    template: `
        <form class="mt-3 mb-5 bg-secondary-subtle rounded p-3" @submit="save">
            <h3>Nouvel assoiffé</h3>
            <div class="row mt-3">
                <div class="col-md-6">
                    <div class="form-floating">
                        <input type="text" class="form-control" id="neworder-username" aria-describedby="neworder-username-help" placeholder="Prénom, nom, alias..." v-model="username">
                        <label for="neworder-username" id="neworder-username-help">Prénom, nom, alias...</label>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-floating">
                        <input type="text" class="form-control" id="neworder-password" aria-describedby="neworder-password-help" placeholder="Mot de passe" v-model="password">
                        <label for="neworder-password" id="neworder-password">Mot de passe</label>
                    </div>
                </div>
                <div class="col-md-2 d-flex">
                    <input class="btn btn-outline-primary flex-fill" type="submit" value="Enregistrer" :disabled="!validUser"/>
                </div>
            </div>
            <p class="form-text text-danger fw-bold mb-0" v-if="error" v-text="error"></p>
        </form>
    `
  }