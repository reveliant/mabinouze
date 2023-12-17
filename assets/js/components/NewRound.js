import axios from 'axios';
import moment from 'moment';
import params from '@params';

export default {
    data() {
        return {
            id: '',
            description: '',
            time: moment().add(1, 'h').minutes(0).format('HH:mm'),
            password: '',
            access_token: '',
        }
    },
    computed: {
        hostname: () => (new URL(params.baseURL)).hostname,
        roundTime() {
            let now = moment();
            let time = moment(this.time, 'HH:mm');
            if (time.isBefore(now)) {
                // Time in past
                time.add(1, 'd');
            }
            return time;
        },
        dateUntil() {
            let now = moment();
            let until = moment(this.roundTime).add(6, 'h');
            return (until.isSame(now, 'date') ? '' : until.format('dddd ')) + until.format('LT')
        },
        validId() { return this.id.match(/^[A-Za-z0-9-]{4}[A-Za-z0-9-]{0,251}$/) },
    },
    methods: {
        submit(target) {
            target.preventDefault();
            if (this.valid) {
                axios.post(this.urls.round, {
                    id: this.id,
                    description: this.description,
                    time: this.roundTime.toISOString(),
                    password: this.password,
                    access_token: (this.access_token != '') ? this.access_token : null,
                }).then((response) => {
                    sessionStorage.setItem(`admin:${this.id}`, btoa(this.password))
                    if (this.access_token != '') {
                        sessionStorage.setItem(`access:${this.id}`, btoa(this.access_token))
                    }
                    document.location.href = "/" + this.id + "/"
                })
            }
        },
    },
    template: `
        <form class="mb-5" @submit="submit">
            <div class="form-floating">
                <input type="text" class="form-control" id="round-id" aria-describedby="round-id-help" pattern="[A-Za-z0-9-]{4}[A-Za-z0-9-]{0,251}" minlength="4" maxlength="255" placeholder="Nom de la tournée" v-model.trim="id" required>
                <label for="round-id">Indique le nom de la tournée</label>
            </div>
            <div class="form-text" id="round-id-help">
                Le nom de la tournée doit faire au moins 4 caractères (chiffres ou lettres non accentuées, tiret possible à partir du 5<sup>è</sup> caractère)
            </div>
            <template v-if="validId">
                <div class="row mt-3">
                    <div class="col-md-10">
                        <div class="form-floating">
                            <input type="text" class="form-control" id="round-description" aria-describedby="round-description-help" placeholder="Description de la tournée" v-model="description">
                            <label for="round-description">Description de la tournée</label>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <div class="form-floating">
                            <input type="time" class="form-control" id="round-timetournee" placeholder="Heure de la tournée" v-model="time">
                            <label for="round-time">Heure de la tournée</label>
                        </div>
                    </div>
                </div>
                <div class="form-text" id="round-description-help">
                    Un petit texte d'explication sur la tournée, et son heure de début
                </div>
                <div class="input-group mt-3">
                    <div class="form-floating">
                        <input type="password" class="form-control" id="round-password" aria-describedby="round-password-help" placeholder="Mot de passe" required v-model="password">
                        <label for="round-password">Mot de passe</label>
                    </div>
                    <input type="submit" class="btn btn-primary" value="Créer la tournée">
                </div>
                <div class="form-text" id="round-password-help">
                    Un mot de passe qui te permettra d'accéder aux détails des partitipants.
                    Si tu le perds, ta tournée tourne au vinaigre !
                </div>
                <div class="alert alert-primary mt-3">
                    Le lien à communiquer aux assoifés est
                    <a :href="'/' + id" class="fw-bold">{{ hostname }}/{{ id }}</a><br/>
                    Les données seront conservées jusqu'à
                    <strong>{{ dateUntil }}</strong>
                </div>
            </template>
        </form>
    `
}
