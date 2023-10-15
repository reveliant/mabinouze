import axios from 'axios';
import moment from 'moment';
import params from '@params';

export default {
    data() {
      return {
        id: '',
        found: false,
        description: '',
        time: '',
      }
    },
    methods: {
        moment: moment,
    },
    watch: {
        id(value){
            this.id = value;
            if (value.match(/^[A-Za-z0-9-]{4}[A-Za-z0-9-]{0,251}$/)) {
                axios.get(params.api + 'round?id=' + this.id).then((response) => {
                    this.description = response.data.description;
                    let now = moment();
                    let time = moment(response.data.time).add(6, 'h');
                    this.time = (time.isSame(now, 'date') ? '' : time.format('dddd ')) + time.format('[à] LT')
                    this.found = true;
                })
            } else {
                this.description = '';
                this.time = '';
                this.found = false;
            }
        }
    },
    template: `
        <form action="#" method="GET" class="mb-5">
            <div class="input-group">
                <div class="form-floating">
                    <input type="text" class="form-control" id="search-round" pattern="[A-Za-z0-9-]{4}[A-Za-z0-9-]{0,251}" minlength="4" maxlength="255" placeholder="Nom de la tournée" required v-model.trim="id">
                    <label for="search-round">Indique le nom de la tournée</label>
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