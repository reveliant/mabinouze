import axios from 'axios';
import moment from 'moment';

export default {
    data() {
      return {
        id: '',
        password: '',
        found: false,
        passwordProtected: false,
        description: '',
        time: '',
      }
    },
    methods: {
        submit(event) {
            event.preventDefault();
            if (this.found) {
                document.location.href = "/" + this.id + "/"
            }
        }
    },
    watch: {
        id(value){
            this.id = value;
            if (value.match(/^[A-Za-z0-9-]{4}[A-Za-z0-9-]{0,251}$/)) {
                axios.get(this.urls.getRound.replace('<id>', this.id)).then((response) => {
                    this.description = response.data.description;
                    let now = moment();
                    let time = moment(response.data.time);
                    this.time = (time.isSame(now, 'date') ? '' : time.format('dddd ')) + time.format('[à] LT')
                    this.found = true;
                    this.passwordProtected = false
                }).catch((error) => {
                    if (error.response.status == 401) {
                        this.passwordProtected = true;
                        document.getElementById("search-password").focus();
                    } else {
                        this.passwordProtected = false;
                    }
                })
            } else {
                this.description = '';
                this.time = '';
                this.found = false;
                this.passwordProtected = false;
            }
        },
        password(value){
            this.password = value;
            encodedPassword = btoa(this.encodeAuth(this.password));
            axios.get(this.urls.getRound.replace('<id>', this.id), {
                headers: {'Authorization': `Bearer ${encodedPassword}`}
            }).then((response) => {
                this.description = response.data.description;
                let now = moment();
                let time = moment(response.data.time);
                this.time = (time.isSame(now, 'date') ? '' : time.format('dddd ')) + time.format('[à] LT')
                this.found = true;
                sessionStorage.setItem(`access:${this.id}`, encodedPassword)
            }).catch((error) => {})
        }
    },
    template: `
        <form class="mb-5" @submit="submit">
            <div class="input-group">
                <div class="form-floating">
                    <input type="text" class="form-control" id="search-round" pattern="[A-Za-z0-9-]{4}[A-Za-z0-9-]{0,251}" minlength="4" maxlength="255" placeholder="Nom de la tournée" required v-model.trim="id">
                    <label for="search-round">Indique le nom de la tournée</label>
                </div>
                <div class="form-floating" v-show="passwordProtected">
                    <input type="password" class="form-control" id="search-password" placeholder="Mot de passe d'accès" v-model="password">
                    <label for="search-password">Cette tournée nécessite un mot de passe d'accès</label>
                </div>
                <input type="submit" class="btn btn-primary" value="Rejoindre" :disabled="!found">
            </div>
            <div class="form-text" v-if="found">
                <span v-if="description">{{ description }}</span>
                <span v-if="description && time">, </span>
                <span v-if="time">{{ time }}</span>
            </div>
        </form>
    `
  }