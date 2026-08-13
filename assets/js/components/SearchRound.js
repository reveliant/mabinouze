import axios from 'axios';

export default {
    data() {
      return {
        id: '',
        status: this.Status.Waiting,
        passwordProtected: false,
        description: '',
        time: '',
      }
    },
    methods: {
        submit(event) {
            event.preventDefault();
            if (this.status !== this.Status.NotFound) {
                document.location.href = "/" + this.id + "/"
            }
        }
    },
    watch: {
        id(value){
            this.id = value;
            if (value.match(/^[A-Za-z0-9\-]{4}[A-Za-z0-9\-]{0,251}$/)) {
                axios.get(this.urls.getRound.replace('<id>', this.id)).then((response) => {
                    this.description = response.data.description;
                    this.time = this.dayAndTime(response.data.time);
                    this.status = this.Status.Found;
                    this.passwordProtected = false
                }).catch((error) => {
                    switch (error.response.status) {
                        case 401:
                            this.passwordProtected = true;
                            break;
                        case 404:
                            this.status = this.Status.NotFound;
                            break;
                        default:
                            this.passwordProtected = false;
                            this.status = this.Status.Waiting;
                    }
                })
            } else {
                this.description = '';
                this.time = '';
                this.status = this.Status.Waiting;
                this.passwordProtected = false;
            }
        },
    },
    template: `
        <form @submit="submit">
            <div class="input-group">
                <div class="form-floating">
                    <input type="text" class="form-control" id="search-round" pattern="[A-Za-z0-9\\-]{4}[A-Za-z0-9]{0,251}" minlength="4" maxlength="255" placeholder="Nom de la tournée" required v-model.trim="id">
                    <label for="search-round">Nom de la tournée</label>
                </div>
                <input type="submit" class="btn btn-primary" value="Rejoindre" :disabled="status == Status.NotFound">
            </div>
        </form>
    `
  }