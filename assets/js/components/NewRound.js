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
            status: this.Status.Waiting,
            error: null,
        }
    },
    computed: {
        hostname: () => (new URL(params.baseURL)).hostname,
        dateUntil() {
            let now = moment();
            let until = moment(this.roundedTime(this.time)).add(6, 'h');
            return (until.isSame(now, 'date') ? '' : until.format('dddd ')) + until.format('LT')
        },
    },
    watch: {
        id: function(value) {
            this.id = value;
            this.error = null;
            this.status = this.Status.Waiting

            if (!this.validRoundName()) return;
            axios.head(this.urls.getRound.replace('<id>', this.id)).then((response) => {
                this.status = this.Status.Found;
            }).catch((error) => {
                switch (error.response.status) {
                    case 404:
                        this.status = this.Status.NotFound;
                        break;
                    default:
                        this.error = error.response.body;
                        this.status = this.Status.Waiting;
                }
            });
        }
    },
    methods: {
        submit(target) {
            target.preventDefault();
            if (this.status == this.Status.NotFound) {
                axios.post(this.urls.round, {
                    name: this.id,
                    description: this.description,
                    time: this.roundedTime(this.time).toISOString(),
                    password: this.password,
                    access_token: (this.access_token != '') ? this.access_token : null,
                }).then((response) => {
                    sessionStorage.setItem(`admin:${this.id}`, btoa(this.password))
                    if (this.access_token != '') {
                        sessionStorage.setItem(`access:${this.id}`, btoa(this.access_token))
                    }
                    document.location.href = "/" + this.id + "/"
                }).catch((error) => {
                    this.error = error.response.body;
                });
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
            <template v-if="status == Status.NotFound">
                <div class="row mt-3">
                    <div class="col-md-10">
                        <div class="form-floating">
                            <input type="text" class="form-control" id="round-description" aria-describedby="round-description-help" placeholder="Description de la tournée" v-model="description">
                            <label for="round-description">Description de la tournée</label>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <div class="form-floating">
                            <input type="time" class="form-control" id="round-time" placeholder="Heure de la tournée" v-model="time">
                            <label for="round-time">Heure de la tournée</label>
                        </div>
                    </div>
                </div>
                <div class="form-text" id="round-description-help">
                    Un petit texte d'explication sur la tournée, et son heure de début
                </div>
                <div class="row mt-3">
                    <div class="col-md-6">
                        <div class="form-floating">
                            <input type="password" class="form-control" id="round-password" aria-describedby="round-password-help" placeholder="Mot de passe d'organisation" required v-model="password">
                            <label for="round-password">Mot de passe d'organisation</label>
                        </div>
                        <div class="form-text" id="round-password-help">
                            Un mot de passe qui te permettra d'accéder aux détails des partitipants.
                            Si tu le perds, ta tournée tourne au vinaigre !
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-floating">
                            <input type="password" class="form-control" id="round-access-token" aria-describedby="round-access-token-help" placeholder="Mot de passe d'accès" v-model="access_token">
                            <label for="round-access-token">Mot de passe d'accès (optionnel)</label>
                        </div>
                        <div class="form-text" id="round-access-token-help">
                            Un mot de passe pour limiter l'accès aux seuls participants le connaissant
                        </div>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-md-10">
                        <div class="alert alert-primary mb-0">
                            Le lien à communiquer aux assoifés sera
                            <a :href="'/' + id" class="fw-bold">{{ hostname }}/{{ id }}</a><br/>
                            Les données seront conservées jusqu'à
                            <strong>{{ dateUntil }}</strong>
                        </div>
                    </div>
                    <div class="col-md-2 d-flex align-items-stretch">
                        <input type="submit" class="btn btn-primary flex-fill" value="Créer la tournée">
                    </div>
                </div>
            </template>
            <div class="alert alert-primary" v-if="status === Status.Found">
                Cette tournée existe déjà
            </div>
            <div class="alert alert-primary" v-if="error" v-text="error"></div>
        </form>
    `
}
